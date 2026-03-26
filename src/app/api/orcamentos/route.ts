import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/orcamentos — List quotes for current user
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Acesso não autorizado" },
                { status: 401 }
            );
        }

        const supabase = createServerClient();

        const { data, error } = await supabase
            .from("orcamentos")
            .select(
                "*, itens:itens_orcamento(*, movel:moveis(modelo, variante, categoria))"
            )
            .eq("vendedor_id", session.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Orcamentos fetch error:", error);
            return NextResponse.json(
                { error: "Erro ao buscar orçamentos" },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: data || [] });
    } catch (error) {
        console.error("Orcamentos error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/orcamentos — Create a new quote
 * Body: { cliente_nome, cliente_email?, cliente_endereco?, itens: [{ movel_id, quantidade }] }
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Acesso não autorizado" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { cliente_nome, cliente_email, cliente_endereco, itens } = body;

        if (!cliente_nome || !itens || itens.length === 0) {
            return NextResponse.json(
                {
                    error: "Nome do cliente e pelo menos 1 item são obrigatórios",
                },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        // Fetch prices and snapshot info for all movel_ids
        const movelIds = itens.map(
            (i: { movel_id: number }) => i.movel_id
        );
        const { data: moveisData, error: moveisError } = await supabase
            .from("moveis")
            .select("*, fornecedor:fornecedores(nome, cod_fornecedor)")
            .in("id", movelIds);

        if (moveisError || !moveisData) {
            return NextResponse.json(
                { error: "Erro ao buscar preços dos móveis" },
                { status: 500 }
            );
        }

        const priceMap = new Map(
            moveisData.map((m) => [m.id, m.preco])
        );

        // Calculate items with subtotals
        const processedItens = itens.map(
            (item: { movel_id: number; quantidade: number }) => {
                const preco = priceMap.get(item.movel_id) || 0;
                return {
                    movel_id: item.movel_id,
                    quantidade: item.quantidade,
                    preco_unitario: preco,
                    subtotal: preco * item.quantidade,
                };
            }
        );

        const valorTotal = processedItens.reduce(
            (sum: number, i: { subtotal: number }) => sum + i.subtotal,
            0
        );

        // Generate quote number
        const now = new Date();
        const year = now.getFullYear();
        const random = Math.floor(Math.random() * 9000) + 1000;
        const numero = `MQ-${year}-${random}`;

        // Create orcamento
        const { data: orcamento, error: orcError } = await supabase
            .from("orcamentos")
            .insert({
                numero,
                cliente_nome,
                cliente_email: cliente_email || null,
                cliente_endereco: cliente_endereco || null,
                vendedor_id: session.id,
                valor_total: valorTotal,
            })
            .select()
            .single();

        if (orcError || !orcamento) {
            console.error("Create orcamento error:", orcError);
            return NextResponse.json(
                { error: "Erro ao criar orçamento" },
                { status: 500 }
            );
        }

        // Insert items
        const itensToInsert = processedItens.map(
            (item: {
                movel_id: number;
                quantidade: number;
                preco_unitario: number;
                subtotal: number;
            }) => {
                const movel = moveisData.find(m => m.id === item.movel_id);
                return {
                    ...item,
                    orcamento_id: orcamento.id,
                    snapshot: movel || {}
                };
            }
        );

        const { error: itensError } = await supabase
            .from("itens_orcamento")
            .insert(itensToInsert);

        if (itensError) {
            console.error("Insert itens error:", itensError);
            // Rollback orcamento
            await supabase
                .from("orcamentos")
                .delete()
                .eq("id", orcamento.id);
            return NextResponse.json(
                { error: "Erro ao inserir itens do orçamento" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            orcamento: { ...orcamento, itens: processedItens },
        });
    } catch (error) {
        console.error("Create orcamento error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
