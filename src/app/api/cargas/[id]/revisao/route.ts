import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

/**
 * GET /api/cargas/[id]/revisao
 * Lista os itens pendentes na fila de revisão para uma carga específica.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.perfil !== "admin") {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const { id: cargaId } = await params;
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("import_review_queue")
            .select("*")
            .eq("carga_id", cargaId)
            .eq("status", "pending")
            .order("confidence_score", { ascending: true }); // Menores confianças primeiro

        if (error) throw error;

        return NextResponse.json({ success: true, data: data || [] });
    } catch (err: any) {
        console.error("[Revisão GET] Erro:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/**
 * POST /api/cargas/[id]/revisao
 * Processa a decisão do admin sobre itens da fila de revisão.
 * Body: { items: { id: number, action: 'approve' | 'reject', mappedFields?: any }[] }
 *
 * - 'approve': Insere o produto na tabela `moveis` e marca o item como 'approved'.
 * - 'reject':  Marca o item como 'rejected' sem inserir nada.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.perfil !== "admin") {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const { id: cargaId } = await params;
        const body = await request.json();
        const { items } = body;

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Nenhum item enviado" }, { status: 400 });
        }

        const supabase = createAdminClient();
        let aprovados = 0;
        let rejeitados = 0;
        const erros: string[] = [];

        for (const item of items) {
            if (item.action === "approve") {
                const fields = item.mappedFields || {};

                // Garantir campos mínimos para inserção na tabela `moveis`
                const { error: insertErr } = await supabase.from("moveis").insert({
                    categoria: fields.categoria || "Sem Categoria",
                    modelo: fields.modelo || "Sem Nome",
                    variante: fields.variante || null,
                    tipo: fields.tipo || null,
                    comprimento_cm: fields.comprimento_cm ? Number(fields.comprimento_cm) : null,
                    largura_cm: fields.largura_cm ? Number(fields.largura_cm) : null,
                    altura_cm: fields.altura_cm ? Number(fields.altura_cm) : null,
                    material: fields.material || null,
                    tecido: fields.tecido || null,
                    preco: fields.preco ? Number(fields.preco) : 0,
                    condicao_pagamento: fields.condicao_pagamento || null,
                    ativo: true,
                });

                if (!insertErr) {
                    aprovados++;
                    await supabase
                        .from("import_review_queue")
                        .update({ status: "approved" })
                        .eq("id", item.id);
                } else {
                    console.error(`[Revisão] Erro ao inserir item ${item.id}:`, insertErr);
                    erros.push(`Item ${item.id}: ${insertErr.message}`);
                }

            } else if (item.action === "reject") {
                rejeitados++;
                await supabase
                    .from("import_review_queue")
                    .update({ status: "rejected" })
                    .eq("id", item.id);
            }
        }

        // Atualizar o contador de registros aprovados na carga
        if (aprovados > 0) {
            const { data: carga } = await supabase
                .from("cargas")
                .select("registros_processados")
                .eq("id", cargaId)
                .single();

            if (carga) {
                await supabase
                    .from("cargas")
                    .update({
                        registros_processados: (carga.registros_processados || 0) + aprovados,
                    })
                    .eq("id", cargaId);
            }
        }

        return NextResponse.json({
            success: true,
            aprovados,
            rejeitados,
            erros: erros.length > 0 ? erros : undefined,
        });
    } catch (err: any) {
        console.error("[Revisão POST] Erro:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
