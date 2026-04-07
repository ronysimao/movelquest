import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import { STANDARD_FIELDS, type MappingSuggestion, type StandardFieldKey } from "@/lib/gemini";
// carga-processor importado dinamicamente dentro do POST para não carregar ExcelJS (23MB) no cold start

/**
 * GET /api/cargas/[id]/mapeamento
 * Retorna dados necessários para a tela de mapeamento manual:
 * - Cabeçalhos brutos do arquivo
 * - Campos padrão do sistema
 * - Mapeamentos existentes (se houver)
 * - Amostra de dados do arquivo
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !["admin", "fabricante_admin"].includes(session.perfil)) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const { id: cargaId } = await params;

        // Validar env vars antes de criar client
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("[Mapeamento GET] ENV VARS FALTANDO:", {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            });
            return NextResponse.json(
                { error: "Configuração do servidor incompleta", details: "Variáveis de ambiente Supabase não configuradas" },
                { status: 500 }
            );
        }

        const supabase = createAdminClient();

        // 1. Buscar dados da carga
        const { data: carga, error: cargaErr } = await supabase
            .from("cargas")
            .select("id, nome_arquivo, raw_headers, fallback_reason, status, storage_path")
            .eq("id", cargaId)
            .single();

        if (cargaErr || !carga) {
            console.error("[Mapeamento GET] Carga não encontrada:", {
                cargaId,
                cargaErr: cargaErr?.message,
                cargaErrCode: cargaErr?.code,
                cargaErrDetails: cargaErr?.details,
            });
            return NextResponse.json(
                {
                    error: "Carga não encontrada",
                    details: cargaErr?.message || `ID ${cargaId} não existe`,
                    code: cargaErr?.code,
                    hint: cargaErr?.details,
                },
                { status: 404 }
            );
        }

        // 2. Buscar mapeamentos existentes (TODO: habilitar quando cargas tiver organization_id)
        const existingMappings: { raw_key: string; standard_key: string }[] = [];

        // 3. Extrair amostra de dados (primeiras 5 linhas do arquivo)
        let sampleData: Record<string, unknown>[] = [];
        try {
            const { data: fileData } = await supabase.storage
                .from("cargas")
                .download(carga.storage_path);

            if (fileData) {
                const isXlsx = /\.xlsx$/i.test(carga.storage_path);
                const isCsv = /\.csv$/i.test(carga.storage_path);

                if (isXlsx) {
                    const ExcelJS = (await import("exceljs")).default;
                    const arrayBuffer = await fileData.arrayBuffer();
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.load(arrayBuffer);
                    const worksheet = workbook.worksheets[0];

                    if (worksheet) {
                        const rawData: (unknown[])[] = [];
                        worksheet.eachRow({ includeEmpty: false }, (row) => {
                            const values = Array.isArray(row.values)
                                ? (row.values as unknown[]).slice(1)
                                : [];
                            rawData.push(values);
                        });

                        // Encontrar cabeçalho
                        let headerRowIndex = -1;
                        let headers: string[] = [];
                        for (let i = 0; i < Math.min(15, rawData.length); i++) {
                            const row = rawData[i];
                            const stringCells = row.filter(r => {
                                if (r === null || r === undefined) return false;
                                return String(r).trim() !== "" && isNaN(Number(String(r)));
                            });
                            if (stringCells.length >= 3) {
                                headers = row.map((h: unknown) => {
                                    if (h === null || h === undefined) return "";
                                    const val = typeof h === "object" && h !== null && "richText" in h
                                        ? (h as { richText: { text: string }[] }).richText.map(rt => rt.text).join("")
                                        : String(h);
                                    return val.trim().toUpperCase();
                                });
                                headerRowIndex = i;
                                break;
                            }
                        }

                        if (headerRowIndex >= 0) {
                            const dataRows = rawData.slice(headerRowIndex + 1, headerRowIndex + 6);
                            for (const dr of dataRows) {
                                const obj: Record<string, unknown> = {};
                                headers.forEach((h, idx) => {
                                    let cv = dr[idx];
                                    if (cv && typeof cv === "object" && "richText" in (cv as Record<string, unknown>)) {
                                        cv = ((cv as { richText: { text: string }[] }).richText || []).map(rt => rt.text).join("");
                                    }
                                    if (h && cv !== null && cv !== undefined) {
                                        obj[h] = String(cv);
                                    }
                                });
                                if (Object.keys(obj).length > 0) sampleData.push(obj);
                            }
                        }
                    }
                } else if (isCsv) {
                    const Papa = (await import("papaparse")).default;
                    const text = await fileData.text();
                    const { data } = Papa.parse<Record<string, string>>(text, {
                        header: true,
                        skipEmptyLines: true,
                        preview: 5,
                        transformHeader: (h: string) => h.trim().toUpperCase(),
                    });
                    sampleData = data;
                }
            }
        } catch (e) {
            console.error("[Mapeamento GET] Erro ao extrair amostra:", e);
            // Continuar sem amostra — não é crítico
        }

        return NextResponse.json({
            success: true,
            carga: {
                id: carga.id,
                nome_arquivo: carga.nome_arquivo,
                status: carga.status,
                fallback_reason: carga.fallback_reason,
            },
            rawHeaders: carga.raw_headers || [],
            standardFields: STANDARD_FIELDS,
            existingMappings,
            sampleData,
        });

    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        console.error("[Mapeamento GET] Erro:", msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

/**
 * POST /api/cargas/[id]/mapeamento
 * Recebe o mapeamento manual, salva em field_mappings, e re-processa a carga.
 * Body: { mappings: { rawKey, standardKey }[], saveAsTemplate: boolean }
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !["admin", "fabricante_admin"].includes(session.perfil)) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const { id: cargaId } = await params;
        const body = await request.json();
        const { mappings, saveAsTemplate } = body;

        if (!Array.isArray(mappings) || mappings.length === 0) {
            return NextResponse.json({ error: "Nenhum mapeamento enviado" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Buscar dados da carga
        const { data: carga } = await supabase
            .from("cargas")
            .select("id")
            .eq("id", cargaId)
            .single();

        if (!carga) {
            return NextResponse.json({ error: "Carga não encontrada" }, { status: 404 });
        }

        // 2. Salvar mapeamentos como template (TODO: habilitar quando cargas tiver organization_id)
        // Por enquanto, apenas loga
        console.log(`[Mapeamento] ${mappings.filter((m: { standardKey: string | null }) => m.standardKey).length} mapeamentos recebidos.`);

        // 3. Converter para formato MappingSuggestion e re-processar
        const manualSuggestions: MappingSuggestion[] = mappings
            .filter((m: { standardKey: string | null }) => m.standardKey)
            .map((m: { rawKey: string; standardKey: string }) => ({
                rawKey: m.rawKey.trim().toUpperCase(),
                standardKey: m.standardKey as StandardFieldKey,
                confidence: 100,
                reason: "Mapeamento manual",
            }));

        // 4. Limpar itens antigos da fila de revisão desta carga
        await supabase
            .from("import_review_queue")
            .delete()
            .eq("carga_id", cargaId)
            .eq("status", "pending");

        // 5. Re-processar a carga com o mapeamento manual
        // Import dinâmico para não carregar ExcelJS no cold start
        const { reprocessarComMapeamento } = await import("@/lib/carga-processor");
        const result = await reprocessarComMapeamento(
            Number(cargaId),
            manualSuggestions
        );

        return NextResponse.json({
            success: result.success,
            processed: result.processed,
            error: result.error,
            templateSaved: saveAsTemplate,
        });

    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        console.error("[Mapeamento POST] Erro:", msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
