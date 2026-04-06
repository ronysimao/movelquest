import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

/**
 * POST /api/moveis/manage — Create a new product
 * PUT  /api/moveis/manage — Update an existing product
 */

interface ProductPayload {
    id?: number;
    categoria: string;
    modelo: string;
    variante?: string;
    tipo?: string;
    comprimento_cm?: number | null;
    largura_cm?: number | null;
    altura_cm?: number | null;
    material?: string;
    tecido?: string;
    preco: number;
    condicao_pagamento?: string;
    ativo?: boolean;
    // Fornecedor — pode ser ID ou nome novo
    fornecedor_id?: number | null;
    fornecedor_nome?: string;
}

function validatePayload(body: ProductPayload): string | null {
    if (!body.categoria?.trim()) return "Categoria é obrigatória";
    if (!body.modelo?.trim()) return "Modelo/Nome é obrigatório";
    if (body.preco === undefined || body.preco === null || isNaN(body.preco))
        return "Preço é obrigatório";
    if (body.preco < 0) return "Preço não pode ser negativo";
    return null;
}

// ============================================
// POST — Create product
// ============================================
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Acesso não autorizado" },
                { status: 401 }
            );
        }

        const body: ProductPayload = await request.json();
        const validationError = validatePayload(body);
        if (validationError) {
            return NextResponse.json(
                { error: validationError },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();
        let fornecedorId = body.fornecedor_id || null;

        // Se informou nome de fornecedor novo, criar
        if (!fornecedorId && body.fornecedor_nome?.trim()) {
            const nome = body.fornecedor_nome.trim();
            // Tentar encontrar existente
            const { data: existing } = await supabase
                .from("fornecedores")
                .select("id")
                .ilike("nome", nome)
                .limit(1);

            if (existing && existing.length > 0) {
                fornecedorId = existing[0].id;
            } else {
                // Criar novo fornecedor
                const cod = `F-${Date.now().toString(36).toUpperCase()}`;
                const { data: newFornecedor, error: fErr } = await supabase
                    .from("fornecedores")
                    .insert({ cod_fornecedor: cod, nome })
                    .select("id")
                    .single();

                if (fErr) {
                    console.error("Erro ao criar fornecedor:", fErr);
                    return NextResponse.json(
                        { error: "Erro ao criar fornecedor" },
                        { status: 500 }
                    );
                }
                fornecedorId = newFornecedor.id;
            }
        }

        const insertData = {
            fornecedor_id: fornecedorId,
            categoria: body.categoria.trim(),
            modelo: body.modelo.trim(),
            variante: body.variante?.trim() || null,
            tipo: body.tipo?.trim() || null,
            comprimento_cm: body.comprimento_cm || null,
            largura_cm: body.largura_cm || null,
            altura_cm: body.altura_cm || null,
            material: body.material?.trim() || null,
            tecido: body.tecido?.trim() || null,
            preco: body.preco,
            condicao_pagamento: body.condicao_pagamento?.trim() || null,
            ativo: body.ativo !== false,
        };

        const { data, error } = await supabase
            .from("moveis")
            .insert(insertData)
            .select("*, fornecedor:fornecedores(nome, cod_fornecedor)")
            .single();

        if (error) {
            console.error("Erro ao criar produto:", error);
            return NextResponse.json(
                { error: "Erro ao salvar produto no banco de dados" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
            message: "Produto criado com sucesso",
        });
    } catch (error) {
        console.error("Manage POST error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

// ============================================
// PUT — Update existing product
// ============================================
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Acesso não autorizado" },
                { status: 401 }
            );
        }

        const body: ProductPayload = await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: "ID do produto é obrigatório para edição" },
                { status: 400 }
            );
        }

        const validationError = validatePayload(body);
        if (validationError) {
            return NextResponse.json(
                { error: validationError },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();
        let fornecedorId = body.fornecedor_id || null;

        // Se informou nome de fornecedor novo, criar
        if (!fornecedorId && body.fornecedor_nome?.trim()) {
            const nome = body.fornecedor_nome.trim();
            const { data: existing } = await supabase
                .from("fornecedores")
                .select("id")
                .ilike("nome", nome)
                .limit(1);

            if (existing && existing.length > 0) {
                fornecedorId = existing[0].id;
            } else {
                const cod = `F-${Date.now().toString(36).toUpperCase()}`;
                const { data: newFornecedor, error: fErr } = await supabase
                    .from("fornecedores")
                    .insert({ cod_fornecedor: cod, nome })
                    .select("id")
                    .single();

                if (fErr) {
                    console.error("Erro ao criar fornecedor:", fErr);
                    return NextResponse.json(
                        { error: "Erro ao criar fornecedor" },
                        { status: 500 }
                    );
                }
                fornecedorId = newFornecedor.id;
            }
        }

        const updateData = {
            fornecedor_id: fornecedorId,
            categoria: body.categoria.trim(),
            modelo: body.modelo.trim(),
            variante: body.variante?.trim() || null,
            tipo: body.tipo?.trim() || null,
            comprimento_cm: body.comprimento_cm || null,
            largura_cm: body.largura_cm || null,
            altura_cm: body.altura_cm || null,
            material: body.material?.trim() || null,
            tecido: body.tecido?.trim() || null,
            preco: body.preco,
            condicao_pagamento: body.condicao_pagamento?.trim() || null,
            ativo: body.ativo !== false,
        };

        const { data, error } = await supabase
            .from("moveis")
            .update(updateData)
            .eq("id", body.id)
            .select("*, fornecedor:fornecedores(nome, cod_fornecedor)")
            .single();

        if (error) {
            console.error("Erro ao atualizar produto:", error);
            return NextResponse.json(
                { error: "Erro ao atualizar produto" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
            message: "Produto atualizado com sucesso",
        });
    } catch (error) {
        console.error("Manage PUT error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
