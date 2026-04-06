import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

/**
 * GET /api/fornecedores — List all suppliers
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

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("fornecedores")
            .select("id, cod_fornecedor, nome")
            .order("nome", { ascending: true });

        if (error) {
            console.error("Fornecedores fetch error:", error);
            return NextResponse.json(
                { error: "Erro ao buscar fornecedores" },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: data || [] });
    } catch (error) {
        console.error("Fornecedores error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
