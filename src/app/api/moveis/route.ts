import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

/**
 * GET /api/moveis — Search furniture with filters and pagination
 * Query params: ?page=1&pageSize=12&busca=&categoria=&tecido=&altura_max=&largura_max=&comprimento_max=
 */
export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Acesso não autorizado" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);
        const busca = searchParams.get("busca") || "";
        const categoria = searchParams.get("categoria") || "";
        const tecido = searchParams.get("tecido") || "";
        const alturaMax = searchParams.get("altura_max");
        const larguraMax = searchParams.get("largura_max");
        const comprimentoMax = searchParams.get("comprimento_max");
        const apenasComImagem = searchParams.get("apenas_com_imagem") === "true";

        const supabase = createAdminClient();

        let query = supabase
            .from("moveis")
            .select("*, fornecedor:fornecedores(nome, cod_fornecedor)", {
                count: "exact",
            })
            .eq("ativo", true)
            .order("created_at", { ascending: false });

        // Text search across modelo, variante, tipo, categoria, and fornecedor nome
        if (busca) {
            // Find suppliers matching the search text
            const { data: fData } = await supabase
                .from("fornecedores")
                .select("id")
                .ilike("nome", `%${busca}%`);

            let fornecedorIds: number[] = [];
            if (fData && fData.length > 0) {
                fornecedorIds = fData.map((f) => f.id);
            }

            let orClause = `modelo.ilike.%${busca}%,variante.ilike.%${busca}%,tipo.ilike.%${busca}%,categoria.ilike.%${busca}%`;
            if (fornecedorIds.length > 0) {
                orClause += `,fornecedor_id.in.(${fornecedorIds.join(",")})`;
            }

            query = query.or(orClause);
        }

        if (categoria) {
            query = query.eq("categoria", categoria);
        }

        if (tecido) {
            query = query.ilike("tecido", `%${tecido}%`);
        }

        if (alturaMax) {
            query = query.lte("altura_cm", parseFloat(alturaMax));
        }

        if (larguraMax) {
            query = query.lte("largura_cm", parseFloat(larguraMax));
        }

        if (comprimentoMax) {
            query = query.lte("comprimento_cm", parseFloat(comprimentoMax));
        }

        if (apenasComImagem) {
            query = query.not("imagem_url", "is", null).neq("imagem_url", "");
        }

        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) {
            console.error("Moveis fetch error:", error);
            return NextResponse.json(
                { error: "Erro ao buscar móveis" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            data: data || [],
            count: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize),
        });
    } catch (error) {
        console.error("Moveis error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/moveis/categorias — Get distinct categories
 */
export async function OPTIONS() {
    // This is a workaround; we'll use a separate route for categories
    return NextResponse.json({ message: "Use GET with query parameters" });
}
