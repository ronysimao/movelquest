import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/moveis/filters — Get distinct filter values (categories, fabrics, models)
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

        // Fetch distinct categories
        const { data: catData } = await supabase
            .from("moveis")
            .select("categoria")
            .eq("ativo", true)
            .not("categoria", "is", null);

        const categorias = [
            ...new Set((catData || []).map((r) => r.categoria).filter(Boolean)),
        ].sort();

        // Fetch distinct fabrics
        const { data: tecidoData } = await supabase
            .from("moveis")
            .select("tecido")
            .eq("ativo", true)
            .not("tecido", "is", null);

        const tecidos = [
            ...new Set(
                (tecidoData || []).map((r) => r.tecido).filter(Boolean)
            ),
        ].sort();

        // Fetch distinct models
        const { data: modeloData } = await supabase
            .from("moveis")
            .select("modelo")
            .eq("ativo", true)
            .not("modelo", "is", null);

        const modelos = [
            ...new Set(
                (modeloData || []).map((r) => r.modelo).filter(Boolean)
            ),
        ].sort();

        return NextResponse.json({
            categorias,
            tecidos,
            modelos,
        });
    } catch (error) {
        console.error("Filters error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
