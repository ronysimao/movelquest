import { NextRequest, NextResponse } from "next/server";
// carga-processor importado dinamicamente para não carregar ExcelJS (23MB) no cold start

/**
 * POST /api/processar-carga
 * Rota interna — delega ao carga-processor.ts.
 * Protegida por INTERNAL_API_SECRET.
 * Mantida para compatibilidade — o fluxo principal usa
 * processarCarga() diretamente sem HTTP round-trip.
 */
export async function POST(request: NextRequest) {
    try {
        // ========================================
        // SEGURANÇA: Validar secret interno
        // Apenas chamadas internas são permitidas
        // ========================================
        const internalSecret = request.headers.get("x-internal-secret");
        if (
            !process.env.INTERNAL_API_SECRET ||
            internalSecret !== process.env.INTERNAL_API_SECRET
        ) {
            console.warn(
                "[processar-carga] Tentativa de acesso não autorizado bloqueada."
            );
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const carga_id = body.carga_id;

        if (!carga_id) {
            return NextResponse.json(
                { error: "carga_id ausente" },
                { status: 400 }
            );
        }

        // Import dinâmico para não carregar ExcelJS no cold start
        const { processarCarga } = await import("@/lib/carga-processor");
        const result = await processarCarga(carga_id);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Erro no processamento" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            processed: result.processed,
            review: result.review,
        });
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Erro desconhecido";
        console.error("[processar-carga/route] Erro:", message);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
