import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

/**
 * GET /api/cargas — List load history (admin only)
 * Query params: ?page=1&pageSize=10&search=filename
 * Returns cargas enriched with revisao_pendente count.
 */
export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.perfil !== "admin") {
            return NextResponse.json(
                { error: "Acesso não autorizado" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
        const search = searchParams.get("search") || "";

        const supabase = createAdminClient();

        let query = supabase
            .from("cargas")
            .select("*", { count: "exact" })
            .order("data_upload", { ascending: false });

        if (search) {
            query = query.ilike("nome_arquivo", `%${search}%`);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data: cargas, count, error } = await query;

        if (error) {
            console.error("Cargas fetch error:", error);
            return NextResponse.json(
                { error: "Erro ao buscar histórico de cargas" },
                { status: 500 }
            );
        }

        // Enriquecer cada carga com a contagem de itens pendentes de revisão
        const cargasComRevisao = await Promise.all(
            (cargas || []).map(async (carga) => {
                const { count: pendentes } = await supabase
                    .from("import_review_queue")
                    .select("*", { count: "exact", head: true })
                    .eq("carga_id", carga.id)
                    .eq("status", "pending");

                return {
                    ...carga,
                    revisao_pendente: pendentes || 0,
                };
            })
        );

        return NextResponse.json({
            data: cargasComRevisao,
            count: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize),
        });
    } catch (error) {
        console.error("Cargas error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
