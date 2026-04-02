import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

/**
 * GET /api/orcamentos/[id] — Get single quote with items and movel details
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Acesso não autorizado" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("orcamentos")
            .select(
                `
                *,
                vendedor:profiles!vendedor_id(nome, email),
                itens:itens_orcamento(
                    *,
                    movel:moveis(
                        modelo, variante, categoria, material, tecido,
                        altura_cm, largura_cm, comprimento_cm, imagem_url
                    )
                )
            `
            )
            .eq("id", parseInt(id))
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: "Orçamento não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Get orcamento error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
