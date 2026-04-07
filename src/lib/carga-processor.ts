/**
 * carga-processor.ts
 * Lógica principal de processamento de cargas (XLSX/PDF/CSV com Gemini AI).
 * 
 * Pipeline AI-FIRST:
 * 1. Consulta mapeamentos conhecidos (field_mappings) — aprendizado contínuo
 * 2. Se não houver, extrai conteúdo bruto do arquivo como texto
 * 3. Envia o texto ao Gemini para extração inteligente → JSON com produtos
 * 4. Produtos com confiança >= 80% são inseridos automaticamente
 * 5. Produtos com confiança < 80% vão para fila de revisão
 * 6. Se confiança geral < 30% ou zero produtos → fallback humano
 *
 * Migrado de SheetJS (xlsx) para ExcelJS — sem CVEs conhecidos.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";
import Papa from "papaparse";
import { extractProductsFromText, applyMapping, type MappingSuggestion, type ExtractedProduct } from "@/lib/gemini";

type AdminSupabase = SupabaseClient;

function createAdminSupabase(): AdminSupabase {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

export interface ProcessarCargaResult {
    success: boolean;
    processed: number;
    review: number;
    needsHumanHelp?: boolean;
    error?: string;
}

// ============================================
// Utilitário: Normalizar valor de célula ExcelJS para primitivo
// Trata fórmulas, richText, datas, e objetos
// ============================================
function normalizeCellValue(cellVal: unknown): string | number | null {
    if (cellVal === null || cellVal === undefined) return null;

    if (typeof cellVal === "object" && cellVal !== null) {
        const obj = cellVal as Record<string, unknown>;
        // Fórmula: {result: valor, sharedFormula: "..."}
        if ("result" in obj) return normalizeCellValue(obj.result);
        // RichText: [{text: "..."}, ...]
        if ("richText" in obj && Array.isArray(obj.richText)) {
            return (obj.richText as { text: string }[]).map(rt => rt.text).join("");
        }
        // Date object
        if (cellVal instanceof Date) {
            return cellVal.toISOString().split("T")[0];
        }
        try { return JSON.stringify(cellVal); } catch { return null; }
    }

    if (typeof cellVal === "number") return cellVal;
    if (typeof cellVal === "boolean") return String(cellVal);

    const str = String(cellVal).trim();
    return str === "" ? null : str;
}

// ============================================
// Consulta de mapeamentos conhecidos (Aprendizado Contínuo)
// ============================================
async function fetchKnownMappings(
    supabase: AdminSupabase,
    organizationId: string | null,
    headers: string[]
): Promise<MappingSuggestion[] | null> {
    if (!organizationId) return null;

    const { data: mappings } = await supabase
        .from("field_mappings")
        .select("raw_key, standard_key, confidence")
        .eq("organization_id", organizationId)
        .eq("is_active", true);

    if (!mappings || mappings.length === 0) return null;

    // Verificar se os mapeamentos cobrem pelo menos 50% dos cabeçalhos
    const normalizedHeaders = headers.map(h => h.trim().toUpperCase());
    const matchedMappings = mappings.filter(m =>
        normalizedHeaders.includes(m.raw_key.trim().toUpperCase())
    );

    if (matchedMappings.length < headers.filter(Boolean).length * 0.5) {
        console.log(`[Aprendizado] Apenas ${matchedMappings.length}/${headers.length} colunas mapeadas. Usando IA.`);
        return null;
    }

    console.log(`[Aprendizado] Encontrados ${matchedMappings.length} mapeamentos conhecidos! Pulando IA.`);

    return matchedMappings.map(m => ({
        rawKey: m.raw_key.trim().toUpperCase(),
        standardKey: m.standard_key as any,
        confidence: m.confidence ?? 100,
        reason: "Mapeamento salvo de importação anterior",
    }));
}

// ============================================
// Avaliação de Fallback — decide se escala para humano
// ============================================
interface FallbackCheck {
    needsHelp: boolean;
    reason: string;
}

function checkFallbackNeeded(
    totalRows: number,
    processados: number,
    paraRevisao: number,
    overallConfidence: number
): FallbackCheck {
    if (overallConfidence < 30) {
        return {
            needsHelp: true,
            reason: `Confiança da extração muito baixa: ${overallConfidence}%. A IA não reconheceu o conteúdo do arquivo.`,
        };
    }

    if (totalRows > 0 && paraRevisao > totalRows * 0.7) {
        return {
            needsHelp: true,
            reason: `${paraRevisao} de ${totalRows} itens (${Math.round(paraRevisao / totalRows * 100)}%) foram para revisão. O formato do arquivo não é reconhecido.`,
        };
    }

    if (totalRows > 3 && processados === 0 && paraRevisao === 0) {
        return {
            needsHelp: true,
            reason: `Nenhum produto foi extraído de ${totalRows} linhas. O arquivo pode ter um formato desconhecido.`,
        };
    }

    return { needsHelp: false, reason: "" };
}

// ============================================
// Utilitário: Inserir produtos extraídos no banco
// ============================================
async function insertExtractedProducts(
    products: ExtractedProduct[],
    batchConfidence: number,
    carga: Record<string, unknown>,
    supabase: AdminSupabase
): Promise<{ processados: number; paraRevisao: number }> {
    let processados = 0;
    let paraRevisao = 0;

    for (const product of products) {
        const hasMinData = product.modelo || product.categoria;
        const itemConfidence = hasMinData ? batchConfidence : Math.min(batchConfidence, 30);

        if (itemConfidence >= 80) {
            const { error } = await supabase.from("moveis").insert({
                categoria: product.categoria || "Sem Categoria",
                modelo: product.modelo || "Sem Nome",
                variante: product.variante || null,
                tipo: product.tipo || null,
                comprimento_cm: product.comprimento_cm ? Number(product.comprimento_cm) : null,
                largura_cm: product.largura_cm ? Number(product.largura_cm) : null,
                altura_cm: product.altura_cm ? Number(product.altura_cm) : null,
                material: product.material || null,
                tecido: product.tecido || null,
                preco: product.preco ? Number(product.preco) : 0,
                condicao_pagamento: product.condicao_pagamento || null,
                ativo: true,
            });

            if (!error) {
                processados++;
            } else {
                console.error(`[Inserção] Erro:`, error);
            }
        } else {
            await supabase.from("import_review_queue").insert({
                carga_id: carga.id,
                organization_id: carga.organization_id || null,
                raw_data: product,
                mapped_data: product,
                confidence_score: itemConfidence,
                status: "pending",
            });
            paraRevisao++;
        }
    }

    return { processados, paraRevisao };
}

// ============================================
// Função Principal: processarCarga
// ============================================
export async function processarCarga(cargaId: number): Promise<ProcessarCargaResult> {
    const supabase = createAdminSupabase();

    try {
        const { data: carga, error: cargaErr } = await supabase
            .from("cargas")
            .select("*")
            .eq("id", cargaId)
            .single();

        if (cargaErr || !carga) {
            throw new Error(`Carga não encontrada: ${cargaErr?.message}`);
        }

        console.log(`[Carga ${cargaId}] Iniciando processamento: ${carga.storage_path}`);

        const { data: fileData, error: downloadErr } = await supabase.storage
            .from("cargas")
            .download(carga.storage_path);

        if (downloadErr || !fileData) {
            throw new Error(`Erro no download do storage: ${downloadErr?.message}`);
        }

        const isXlsx = /\.xlsx$/i.test(carga.storage_path);
        const isCsv = /\.csv$/i.test(carga.storage_path);
        const isPdf = /\.pdf$/i.test(carga.storage_path);

        let processados = 0;
        let paraRevisao = 0;
        let needsHumanHelp = false;

        if (isXlsx) {
            const result = await processXlsx(fileData, carga, supabase);
            processados = result.processados;
            paraRevisao = result.paraRevisao;
            needsHumanHelp = result.needsHumanHelp;
        } else if (isCsv) {
            const result = await processCsv(fileData, carga, supabase);
            processados = result.processados;
            paraRevisao = result.paraRevisao;
            needsHumanHelp = result.needsHumanHelp;
        } else if (isPdf) {
            const result = await processPdf(fileData, carga, supabase);
            processados = result.processados;
            paraRevisao = result.paraRevisao;
            needsHumanHelp = result.needsHumanHelp;
        } else {
            throw new Error("Formato de arquivo não suportado. Use .xlsx, .csv ou .pdf.");
        }

        console.log(`[Carga ${cargaId}] Finalizada! Auto-aprovados: ${processados} | Para revisão: ${paraRevisao} | Fallback humano: ${needsHumanHelp}`);

        let finalStatus: string;
        if (needsHumanHelp) {
            finalStatus = "needs_human_help";
        } else if (processados === 0 && paraRevisao === 0) {
            finalStatus = "falha";
        } else {
            finalStatus = "sucesso";
        }

        await supabase
            .from("cargas")
            .update({
                status: finalStatus,
                registros_processados: processados,
                erro_mensagem: finalStatus === "falha" ? "Nenhum produto identificado no arquivo" : null,
            })
            .eq("id", cargaId);

        return { success: true, processed: processados, review: paraRevisao, needsHumanHelp };

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        console.error("[Carga Processor] Erro:", message);

        await supabase
            .from("cargas")
            .update({ status: "falha", erro_mensagem: message })
            .eq("id", cargaId);

        return { success: false, processed: 0, review: 0, error: message };
    }
}

// ============================================
// Processador XLSX — Abordagem AI-FIRST
// 1. Extrai TODO o conteúdo da planilha como texto legível
// 2. Envia ao Gemini para interpretar semanticamente
// 3. Recebe JSON com produtos estruturados
// ============================================
async function processXlsx(
    fileData: Blob,
    carga: Record<string, unknown>,
    supabase: AdminSupabase
) {
    const arrayBuffer = await fileData.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet || worksheet.rowCount === 0) {
        throw new Error("Planilha vazia ou sem dados.");
    }

    console.log(`[XLSX] Planilha "${worksheet.name}" — ${worksheet.rowCount} linhas`);

    // ---- Extrair TODAS as linhas como texto legível ----
    const textLines: string[] = [];
    const allHeaders: string[] = [];
    let headerCaptured = false;

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        const values = Array.isArray(row.values)
            ? (row.values as unknown[]).slice(1) // ExcelJS é 1-indexed
            : [];

        const normalized = values.map(v => normalizeCellValue(v));
        const nonEmpty = normalized.filter(v => v !== null);

        // Ignorar linhas com poucos dados (títulos, logos, linhas decorativas)
        if (nonEmpty.length < 2) return;

        // Converter para texto separado por " | "
        const lineText = normalized
            .map(v => v !== null ? String(v) : "")
            .join(" | ");

        textLines.push(`Linha ${rowNumber}: ${lineText}`);

        // Capturar primeira linha com 4+ labels curtos como "cabeçalho" para fallback
        if (!headerCaptured && nonEmpty.length >= 4) {
            const shortTexts = nonEmpty.filter(v =>
                typeof v === "string" && v.length < 40 && isNaN(Number(v))
            );
            if (shortTexts.length >= 4) {
                shortTexts.forEach(h => allHeaders.push(String(h).trim().toUpperCase()));
                headerCaptured = true;
            }
        }
    });

    if (textLines.length === 0) {
        throw new Error("Planilha sem dados legíveis.");
    }

    console.log(`[XLSX] ${textLines.length} linhas extraídas como texto (${textLines.join("\n").length} chars)`);

    // ---- Salvar cabeçalhos brutos na carga (para tela de mapeamento manual) ----
    if (allHeaders.length > 0) {
        await supabase
            .from("cargas")
            .update({ raw_headers: allHeaders })
            .eq("id", carga.id);
    }

    // ---- Aprendizado Contínuo: consultar mapeamentos conhecidos ----
    if (allHeaders.length > 0) {
        const knownMappings = await fetchKnownMappings(
            supabase,
            carga.organization_id as string | null,
            allHeaders
        );

        // Se tiver mapeamentos salvos, usar o fluxo de mapeamento por coluna
        if (knownMappings) {
            console.log(`[XLSX] Usando ${knownMappings.length} mapeamentos salvos (aprendizado contínuo)`);
            return await processWithColumnMapping(workbook, carga, supabase, allHeaders, knownMappings);
        }
    }

    // ---- AI-FIRST: Enviar texto bruto ao Gemini ----
    const rawText = textLines.join("\n");
    console.log("[XLSX] Enviando conteúdo ao Gemini para extração inteligente...");
    const { products, confidence: batchConfidence } = await extractProductsFromText(rawText);
    console.log(`[XLSX] Gemini extraiu ${products.length} produtos com confiança ${batchConfidence}%.`);

    // Verificar fallback
    if (products.length === 0 || batchConfidence < 30) {
        const reason = products.length === 0
            ? "A IA não conseguiu extrair nenhum produto da planilha."
            : `Confiança da extração muito baixa: ${batchConfidence}%.`;

        await supabase
            .from("cargas")
            .update({ status: "needs_human_help", fallback_reason: reason })
            .eq("id", carga.id);
        return { processados: 0, paraRevisao: 0, needsHumanHelp: true };
    }

    // Inserir produtos
    const { processados, paraRevisao } = await insertExtractedProducts(products, batchConfidence, carga, supabase);
    console.log(`[XLSX] Resumo: ${processados} inseridos, ${paraRevisao} para revisão.`);

    // Pós-verificação
    const postFallback = checkFallbackNeeded(products.length, processados, paraRevisao, batchConfidence);
    if (postFallback.needsHelp) {
        await supabase
            .from("cargas")
            .update({ status: "needs_human_help", fallback_reason: postFallback.reason })
            .eq("id", carga.id);
        return { processados, paraRevisao, needsHumanHelp: true };
    }

    return { processados, paraRevisao, needsHumanHelp: false };
}

// ============================================
// Processador CSV — Abordagem AI-FIRST
// ============================================
async function processCsv(
    fileData: Blob,
    carga: Record<string, unknown>,
    supabase: AdminSupabase
) {
    const text = await fileData.text();

    if (text.trim().length < 10) {
        throw new Error("Arquivo CSV vazio ou sem dados legíveis.");
    }

    // Capturar cabeçalhos para salvar e para aprendizado contínuo
    const { meta } = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        preview: 1,
        transformHeader: (h: string) => h.trim().toUpperCase(),
    });

    const headers = (meta.fields || []).filter(Boolean);

    // Salvar cabeçalhos brutos na carga
    if (headers.length > 0) {
        await supabase
            .from("cargas")
            .update({ raw_headers: headers })
            .eq("id", carga.id);
    }

    // Aprendizado Contínuo
    if (headers.length > 0) {
        const knownMappings = await fetchKnownMappings(
            supabase,
            carga.organization_id as string | null,
            headers
        );

        if (knownMappings) {
            console.log(`[CSV] Usando ${knownMappings.length} mapeamentos salvos`);
            return await processCsvWithMapping(text, carga, supabase, knownMappings);
        }
    }

    // AI-FIRST: enviar o texto bruto do CSV ao Gemini
    // O CSV já é texto legível — envia os primeiros 15000 chars
    console.log("[CSV] Enviando conteúdo ao Gemini para extração inteligente...");
    const { products, confidence: batchConfidence } = await extractProductsFromText(text);
    console.log(`[CSV] Gemini extraiu ${products.length} produtos com confiança ${batchConfidence}%.`);

    if (products.length === 0 || batchConfidence < 30) {
        const reason = products.length === 0
            ? "A IA não conseguiu extrair nenhum produto do CSV."
            : `Confiança da extração muito baixa: ${batchConfidence}%.`;

        await supabase
            .from("cargas")
            .update({ status: "needs_human_help", fallback_reason: reason })
            .eq("id", carga.id);
        return { processados: 0, paraRevisao: 0, needsHumanHelp: true };
    }

    const { processados, paraRevisao } = await insertExtractedProducts(products, batchConfidence, carga, supabase);
    console.log(`[CSV] Resumo: ${processados} inseridos, ${paraRevisao} para revisão.`);

    const postFallback = checkFallbackNeeded(products.length, processados, paraRevisao, batchConfidence);
    if (postFallback.needsHelp) {
        await supabase
            .from("cargas")
            .update({ status: "needs_human_help", fallback_reason: postFallback.reason })
            .eq("id", carga.id);
        return { processados, paraRevisao, needsHumanHelp: true };
    }

    return { processados, paraRevisao, needsHumanHelp: false };
}

// ============================================
// Processador PDF com Gemini
// ============================================
async function processPdf(
    fileData: Blob,
    carga: Record<string, unknown>,
    supabase: AdminSupabase
) {
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pdfText = "";
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(buffer);
        pdfText = pdfData.text as string;
        console.log(`[PDF] Extraídos ${pdfText.length} caracteres de texto.`);
    } catch (err) {
        console.error("[PDF] Erro ao extrair texto:", err);
        throw new Error("Não foi possível extrair texto do PDF. Verifique se o arquivo não está protegido.");
    }

    if (pdfText.trim().length < 50) {
        await supabase
            .from("cargas")
            .update({
                status: "needs_human_help",
                fallback_reason: "PDF não contém texto legível suficiente. Pode ser um PDF escaneado sem OCR.",
            })
            .eq("id", carga.id);
        return { processados: 0, paraRevisao: 0, needsHumanHelp: true };
    }

    console.log("[PDF] Enviando texto ao Gemini para extração...");
    const { products, confidence: batchConfidence } = await extractProductsFromText(pdfText);
    console.log(`[PDF] Gemini extraiu ${products.length} produtos com confiança ${batchConfidence}%.`);

    if (products.length === 0 || batchConfidence < 30) {
        const reason = products.length === 0
            ? "A IA não conseguiu extrair nenhum produto do PDF."
            : `Confiança da extração muito baixa: ${batchConfidence}%.`;

        await supabase
            .from("cargas")
            .update({ status: "needs_human_help", fallback_reason: reason })
            .eq("id", carga.id);
        return { processados: 0, paraRevisao: 0, needsHumanHelp: true };
    }

    const { processados, paraRevisao } = await insertExtractedProducts(products, batchConfidence, carga, supabase);

    const postFallback = checkFallbackNeeded(products.length, processados, paraRevisao, batchConfidence);
    if (postFallback.needsHelp) {
        await supabase
            .from("cargas")
            .update({ status: "needs_human_help", fallback_reason: postFallback.reason })
            .eq("id", carga.id);
        return { processados, paraRevisao, needsHumanHelp: true };
    }

    return { processados, paraRevisao, needsHumanHelp: false };
}

// ============================================
// Processador com mapeamento por coluna (aprendizado contínuo)
// Usado quando existem field_mappings salvos para esta organização.
// ============================================
async function processWithColumnMapping(
    workbook: ExcelJS.Workbook,
    carga: Record<string, unknown>,
    supabase: AdminSupabase,
    knownHeaders: string[],
    mappings: MappingSuggestion[]
) {
    let processados = 0;
    let paraRevisao = 0;

    const worksheet = workbook.worksheets[0];
    const rawData: (unknown[])[] = [];

    worksheet.eachRow({ includeEmpty: false }, (row) => {
        const values = Array.isArray(row.values)
            ? (row.values as unknown[]).slice(1)
            : [];
        rawData.push(values);
    });

    // Encontrar linha do cabeçalho por correspondência com headers conhecidos
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(25, rawData.length); i++) {
        const row = rawData[i];
        const normalized = row.map(c => normalizeCellValue(c));
        const rowLabels = normalized
            .filter(v => typeof v === "string" && v.length < 40)
            .map(v => String(v).toUpperCase());

        const matches = knownHeaders.filter(h => rowLabels.includes(h));
        if (matches.length >= 3) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) {
        // Fallback para AI-first
        console.log("[XLSX/Mapping] Cabeçalho não encontrado para mapeamento salvo, usando IA");
        const textLines = rawData
            .map((row, idx) => {
                const normalized = row.map(c => normalizeCellValue(c));
                const nonEmpty = normalized.filter(v => v !== null);
                if (nonEmpty.length < 2) return null;
                return `Linha ${idx + 1}: ${normalized.map(v => v ?? "").join(" | ")}`;
            })
            .filter(Boolean);

        const { products, confidence } = await extractProductsFromText(textLines.join("\n"));
        const result = await insertExtractedProducts(products, confidence, carga, supabase);
        return { ...result, needsHumanHelp: false };
    }

    // Extrair headers reais da linha encontrada
    const fullHeaders = rawData[headerRowIndex].map(c => {
        const v = normalizeCellValue(c);
        return v ? String(v).toUpperCase() : "";
    });
    const dataRows = rawData.slice(headerRowIndex + 1);

    const mappingConfig = {
        suggestions: mappings,
        overallConfidence: Math.round(mappings.reduce((acc, s) => acc + s.confidence, 0) / mappings.length),
    };

    for (const row of dataRows) {
        if (!row || !Array.isArray(row)) continue;

        const rowObject: Record<string, unknown> = {};
        let isEmptyRow = true;

        fullHeaders.forEach((h, index) => {
            const cellVal = normalizeCellValue(row[index]);
            if (h && cellVal !== null && String(cellVal).trim() !== "") {
                rowObject[h] = cellVal;
                isEmptyRow = false;
            }
        });

        if (isEmptyRow) continue;

        const { mapped, confidence } = applyMapping(
            rowObject as Record<string, string | number>,
            mappingConfig.suggestions
        );

        if (Object.keys(mapped).length === 0) continue;

        if (confidence >= 80) {
            const { error } = await supabase.from("moveis").insert({
                categoria: mapped.categoria || "Sem Categoria",
                modelo: mapped.modelo || "Sem Nome",
                variante: mapped.variante || null,
                tipo: mapped.tipo || null,
                comprimento_cm: mapped.comprimento_cm ? Number(mapped.comprimento_cm) : null,
                largura_cm: mapped.largura_cm ? Number(mapped.largura_cm) : null,
                altura_cm: mapped.altura_cm ? Number(mapped.altura_cm) : null,
                material: mapped.material || null,
                tecido: mapped.tecido || null,
                preco: mapped.preco ? Number(mapped.preco) : 0,
                condicao_pagamento: mapped.condicao_pagamento || null,
                ativo: true,
            });
            if (!error) processados++;
        } else {
            await supabase.from("import_review_queue").insert({
                carga_id: carga.id,
                organization_id: carga.organization_id || null,
                raw_data: rowObject,
                mapped_data: mapped,
                confidence_score: confidence,
                status: "pending",
            });
            paraRevisao++;
        }
    }

    return { processados, paraRevisao, needsHumanHelp: false };
}

// ============================================
// CSV com mapeamento salvo (aprendizado contínuo)
// ============================================
async function processCsvWithMapping(
    text: string,
    carga: Record<string, unknown>,
    supabase: AdminSupabase,
    mappings: MappingSuggestion[]
) {
    let processados = 0;
    let paraRevisao = 0;

    const { data } = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim().toUpperCase(),
    });

    const mappingConfig = {
        suggestions: mappings,
        overallConfidence: Math.round(mappings.reduce((acc, s) => acc + s.confidence, 0) / mappings.length),
    };

    for (const row of data) {
        const hasContent = Object.values(row).some(
            (v) => v !== null && v !== undefined && String(v).trim() !== ""
        );
        if (!hasContent) continue;

        const rowObject: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(row)) {
            if (value !== null && value !== undefined && String(value).trim() !== "") {
                rowObject[key] = value;
            }
        }

        const { mapped, confidence } = applyMapping(
            rowObject as Record<string, string | number>,
            mappingConfig.suggestions
        );

        if (confidence >= 80) {
            const { error } = await supabase.from("moveis").insert({
                categoria: mapped.categoria || "Sem Categoria",
                modelo: mapped.modelo || "Sem Nome",
                variante: mapped.variante || null,
                tipo: mapped.tipo || null,
                comprimento_cm: mapped.comprimento_cm || null,
                largura_cm: mapped.largura_cm || null,
                altura_cm: mapped.altura_cm || null,
                material: mapped.material || null,
                tecido: mapped.tecido || null,
                preco: mapped.preco || 0,
                condicao_pagamento: mapped.condicao_pagamento || null,
                ativo: true,
            });
            if (!error) processados++;
        } else {
            await supabase.from("import_review_queue").insert({
                carga_id: carga.id,
                organization_id: carga.organization_id || null,
                raw_data: rowObject,
                mapped_data: mapped,
                confidence_score: confidence,
                status: "pending",
            });
            paraRevisao++;
        }
    }

    return { processados, paraRevisao, needsHumanHelp: false };
}

// ============================================
// Re-processar com mapeamento manual
// Usado pela API de mapeamento quando o humano define o De-Para
// ============================================
export async function reprocessarComMapeamento(
    cargaId: number,
    manualMappings: MappingSuggestion[]
): Promise<ProcessarCargaResult> {
    const supabase = createAdminSupabase();

    try {
        const { data: carga, error: cargaErr } = await supabase
            .from("cargas")
            .select("*")
            .eq("id", cargaId)
            .single();

        if (cargaErr || !carga) {
            throw new Error(`Carga não encontrada: ${cargaErr?.message}`);
        }

        const { data: fileData, error: downloadErr } = await supabase.storage
            .from("cargas")
            .download(carga.storage_path);

        if (downloadErr || !fileData) {
            throw new Error(`Erro no download: ${downloadErr?.message}`);
        }

        const isXlsx = /\.xlsx$/i.test(carga.storage_path);
        const isCsv = /\.csv$/i.test(carga.storage_path);

        if (!isXlsx && !isCsv) {
            throw new Error("Reprocessamento com mapeamento manual só é suportado para XLSX e CSV.");
        }

        let rows: Record<string, unknown>[] = [];

        if (isXlsx) {
            const arrayBuffer = await fileData.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            const worksheet = workbook.worksheets[0];
            if (!worksheet) throw new Error("Planilha vazia");

            const rawData: (unknown[])[] = [];
            worksheet.eachRow({ includeEmpty: false }, (row) => {
                const values = Array.isArray(row.values)
                    ? (row.values as unknown[]).slice(1)
                    : [];
                rawData.push(values);
            });

            // Encontrar cabeçalho pelo mesmo algoritmo
            for (let i = 0; i < Math.min(25, rawData.length); i++) {
                const row = rawData[i];
                if (!Array.isArray(row)) continue;
                const normalized = row.map(c => normalizeCellValue(c));
                const labels = normalized.filter(v =>
                    typeof v === "string" && v.length < 40 && isNaN(Number(v))
                );

                if (labels.length >= 4) {
                    const headers = normalized.map(v => v ? String(v).toUpperCase() : "");
                    const dataRows = rawData.slice(i + 1);
                    for (const dr of dataRows) {
                        if (!dr || !Array.isArray(dr)) continue;
                        const obj: Record<string, unknown> = {};
                        let empty = true;
                        headers.forEach((h, idx) => {
                            const cv = normalizeCellValue(dr[idx]);
                            if (h && cv !== null && String(cv).trim() !== "") {
                                obj[h] = cv;
                                empty = false;
                            }
                        });
                        if (!empty) rows.push(obj);
                    }
                    break;
                }
            }
        } else {
            const text = await fileData.text();
            const { data } = Papa.parse<Record<string, string>>(text, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (h: string) => h.trim().toUpperCase(),
            });
            rows = data.filter(row =>
                Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== "")
            );
        }

        // Processar com mapeamento manual
        let processados = 0;
        for (const row of rows) {
            const { mapped } = applyMapping(
                row as Record<string, string | number>,
                manualMappings,
                0 // aceitar qualquer confiança, pois o mapeamento é manual
            );

            const hasData = mapped.modelo || mapped.categoria;
            if (!hasData) continue;

            const { error } = await supabase.from("moveis").insert({
                categoria: mapped.categoria || "Sem Categoria",
                modelo: mapped.modelo || "Sem Nome",
                variante: mapped.variante || null,
                tipo: mapped.tipo || null,
                comprimento_cm: mapped.comprimento_cm || null,
                largura_cm: mapped.largura_cm || null,
                altura_cm: mapped.altura_cm || null,
                material: mapped.material || null,
                tecido: mapped.tecido || null,
                preco: mapped.preco || 0,
                condicao_pagamento: mapped.condicao_pagamento || null,
                ativo: true,
            });

            if (!error) processados++;
        }

        // Atualizar carga para sucesso
        await supabase
            .from("cargas")
            .update({
                status: "sucesso",
                registros_processados: processados,
                fallback_reason: null,
                erro_mensagem: null,
            })
            .eq("id", cargaId);

        return { success: true, processed: processados, review: 0 };

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        console.error("[Reprocessar] Erro:", message);
        return { success: false, processed: 0, review: 0, error: message };
    }
}
