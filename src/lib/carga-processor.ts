/**
 * carga-processor.ts
 * Lógica principal de processamento de cargas (XLSX/PDF/CSV com Gemini AI).
 * 
 * Pipeline:
 * 1. Consulta mapeamentos conhecidos (field_mappings) antes de usar IA
 * 2. Se não houver, usa Gemini para sugerir mapeamento
 * 3. Avalia confiança geral e escala para humano se necessário
 * 4. Produtos com confiança >= 80% são inseridos automaticamente
 * 5. Produtos com confiança < 80% vão para fila de revisão
 *
 * Migrado de SheetJS (xlsx) para ExcelJS — sem CVEs conhecidos.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";
import Papa from "papaparse";
import { suggestColumnMappings, extractProductsFromText, applyMapping, type MappingSuggestion } from "@/lib/gemini";

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

    // Verificar se os mapeamentos conhecidos cobrem pelo menos 50% dos cabeçalhos
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
    // Regra 1: Confiança geral abaixo de 50%
    if (overallConfidence < 50) {
        return {
            needsHelp: true,
            reason: `Confiança do mapeamento muito baixa: ${overallConfidence}%. A IA não reconheceu as colunas do arquivo.`,
        };
    }

    // Regra 2: Mais de 70% das linhas na fila de revisão
    if (totalRows > 0 && paraRevisao > totalRows * 0.7) {
        return {
            needsHelp: true,
            reason: `${paraRevisao} de ${totalRows} linhas (${Math.round(paraRevisao / totalRows * 100)}%) foram para revisão. O formato do arquivo não é reconhecido.`,
        };
    }

    // Regra 3: Zero produtos extraídos de um arquivo não-vazio
    if (totalRows > 3 && processados === 0 && paraRevisao === 0) {
        return {
            needsHelp: true,
            reason: `Nenhum produto foi extraído de ${totalRows} linhas. O arquivo pode ter um formato desconhecido.`,
        };
    }

    return { needsHelp: false, reason: "" };
}

// ============================================
// Função Principal: processarCarga
// ============================================
/**
 * Processa uma carga (XLSX, CSV ou PDF) usando IA Gemini com fallback humano.
 * Pode ser chamada diretamente sem necessidade de HTTP request.
 */
export async function processarCarga(cargaId: number): Promise<ProcessarCargaResult> {
    const supabase = createAdminSupabase();

    try {
        // 1. Buscar detalhes da carga
        const { data: carga, error: cargaErr } = await supabase
            .from("cargas")
            .select("*")
            .eq("id", cargaId)
            .single();

        if (cargaErr || !carga) {
            throw new Error(`Carga não encontrada: ${cargaErr?.message}`);
        }

        console.log(`[Carga ${cargaId}] Iniciando processamento: ${carga.storage_path}`);

        // 2. Download do arquivo do Storage
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

        // 3. Processar conforme o tipo de arquivo
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

        // 4. Atualizar status da Carga
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
// Processador XLSX com ExcelJS + IA Gemini
// ============================================
async function processXlsx(
    fileData: Blob,
    carga: Record<string, unknown>,
    supabase: AdminSupabase
) {
    let processados = 0;
    let paraRevisao = 0;

    // ExcelJS lê a partir de um Buffer (Node.js)
    const arrayBuffer = await fileData.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet || worksheet.rowCount === 0) {
        throw new Error("Planilha vazia ou sem dados.");
    }

    console.log(`[XLSX/ExcelJS] Planilha "${worksheet.name}" — ${worksheet.rowCount} linhas`);

    // ---- Extrair todas as linhas como arrays ----
    const rawData: (unknown[] | null[])[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row) => {
        // row.values começa no índice 1 (ExcelJS é 1-indexed) — remover o elemento 0
        const values = Array.isArray(row.values)
            ? (row.values as unknown[]).slice(1)
            : [];
        rawData.push(values);
    });

    if (rawData.length === 0) {
        throw new Error("Planilha sem dados legíveis.");
    }

    // ---- Detectar linha de cabeçalho ----
    // Primeira linha com 3+ células string não-vazias
    let headerRowIndex = -1;
    let headers: string[] = [];

    for (let i = 0; i < Math.min(15, rawData.length); i++) {
        const row = rawData[i];
        if (!Array.isArray(row)) continue;

        const stringCells = row.filter((r) => {
            if (r === null || r === undefined) return false;
            const str = String(r).trim();
            return str !== "" && isNaN(Number(str));
        });

        if (stringCells.length >= 3) {
            headers = row.map((h: unknown) => {
                if (h === null || h === undefined) return "";
                // ExcelJS pode retornar objetos { richText: [...] } para texto formatado
                const val = typeof h === "object" && h !== null && "richText" in h
                    ? (h as { richText: { text: string }[] }).richText.map(rt => rt.text).join("")
                    : String(h);
                return val.trim().toUpperCase();
            });
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1 || headers.length === 0) {
        throw new Error("Não foi possível identificar o cabeçalho no arquivo XLSX. A primeira linha deve conter os nomes das colunas.");
    }

    const cleanHeaders = headers.filter(Boolean);
    console.log(`[XLSX/ExcelJS] Cabeçalho encontrado na linha ${headerRowIndex + 1}: [${cleanHeaders.join(", ")}]`);

    // ---- Salvar cabeçalhos brutos na carga (para tela de mapeamento manual) ----
    await supabase
        .from("cargas")
        .update({ raw_headers: cleanHeaders })
        .eq("id", carga.id);

    const dataRows = rawData.slice(headerRowIndex + 1);
    console.log(`[XLSX/ExcelJS] Linhas de dados a processar: ${dataRows.length}`);

    // ---- Aprendizado Contínuo: consultar mapeamentos conhecidos ----
    const knownMappings = await fetchKnownMappings(
        supabase,
        carga.organization_id as string | null,
        cleanHeaders
    );

    let mapping;
    if (knownMappings) {
        // Usar mapeamentos salvos de importações anteriores
        mapping = {
            suggestions: knownMappings,
            overallConfidence: Math.round(
                knownMappings.reduce((acc, s) => acc + s.confidence, 0) / knownMappings.length
            ),
            unmappedKeys: cleanHeaders.filter(
                h => !knownMappings.some(m => m.rawKey === h)
            ),
        };
        console.log(`[XLSX/ExcelJS] Usando ${knownMappings.length} mapeamentos salvos. Confiança: ${mapping.overallConfidence}%`);
    } else {
        // Gemini sugere mapeamento de colunas
        console.log(`[XLSX/ExcelJS] Solicitando mapeamento ao Gemini para ${cleanHeaders.length} colunas...`);
        mapping = await suggestColumnMappings(cleanHeaders);
        console.log(`[XLSX/ExcelJS] Confiança geral do mapeamento: ${mapping.overallConfidence}%`);
        mapping.suggestions.forEach((s) => {
            if (s.standardKey) {
                console.log(`  "${s.rawKey}" → "${s.standardKey}" (${s.confidence}%)`);
            }
        });
    }

    // ---- Verificar se precisa de fallback humano ----
    if (!knownMappings) {
        // Só verifica fallback se NÃO usou mapeamentos salvos
        const fallback = checkFallbackNeeded(dataRows.length, 0, 0, mapping.overallConfidence);
        if (fallback.needsHelp) {
            console.log(`[XLSX/ExcelJS] FALLBACK HUMANO: ${fallback.reason}`);
            await supabase
                .from("cargas")
                .update({
                    status: "needs_human_help",
                    fallback_reason: fallback.reason,
                })
                .eq("id", carga.id);
            return { processados: 0, paraRevisao: 0, needsHumanHelp: true };
        }
    }

    // ---- Processar cada linha de dados ----
    let linhasIgnoradas = 0;
    for (const row of dataRows) {
        if (!row || !Array.isArray(row)) continue;

        const rowObject: Record<string, unknown> = {};
        let isEmptyRow = true;

        headers.forEach((h, index) => {
            let cellVal = row[index];

            // ExcelJS pode retornar richText objects — normalizar
            if (cellVal !== null && cellVal !== undefined && typeof cellVal === "object" && "richText" in (cellVal as Record<string, unknown>)) {
                cellVal = ((cellVal as { richText: { text: string }[] }).richText || []).map(rt => rt.text).join("");
            }

            if (h && cellVal !== null && cellVal !== undefined && String(cellVal).trim() !== "") {
                rowObject[h] = cellVal;
                isEmptyRow = false;
            }
        });

        if (isEmptyRow) {
            linhasIgnoradas++;
            continue;
        }

        const { mapped, confidence } = applyMapping(
            rowObject as Record<string, string | number>,
            mapping.suggestions
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

            if (!error) {
                processados++;
            } else {
                console.error(`[XLSX/ExcelJS] Erro ao inserir produto:`, error);
            }
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

    console.log(`[XLSX/ExcelJS] Resumo: ${processados} inseridos, ${paraRevisao} para revisão, ${linhasIgnoradas} linhas em branco ignoradas.`);

    // ---- Verificação pós-processamento ----
    const postFallback = checkFallbackNeeded(dataRows.length - linhasIgnoradas, processados, paraRevisao, mapping.overallConfidence);
    if (postFallback.needsHelp) {
        console.log(`[XLSX/ExcelJS] FALLBACK PÓS-PROCESSAMENTO: ${postFallback.reason}`);
        await supabase
            .from("cargas")
            .update({
                status: "needs_human_help",
                fallback_reason: postFallback.reason,
            })
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
    let processados = 0;
    let paraRevisao = 0;

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
        // Escalar para humano — PDF pode estar escaneado sem OCR
        await supabase
            .from("cargas")
            .update({
                status: "needs_human_help",
                fallback_reason: "PDF não contém texto legível suficiente. Pode ser um PDF escaneado sem OCR. É necessário um arquivo com texto selecionável.",
            })
            .eq("id", carga.id);
        return { processados: 0, paraRevisao: 0, needsHumanHelp: true };
    }

    console.log("[PDF] Enviando texto ao Gemini para extração de produtos...");
    const { products, confidence: batchConfidence } = await extractProductsFromText(pdfText);
    console.log(`[PDF] Gemini extraiu ${products.length} produtos com confiança média ${batchConfidence}%.`);

    // Verificar fallback antes de processar
    if (products.length === 0 || batchConfidence < 50) {
        const reason = products.length === 0
            ? "A IA não conseguiu extrair nenhum produto do PDF."
            : `Confiança da extração muito baixa: ${batchConfidence}%. O formato do PDF não é reconhecido.`;

        await supabase
            .from("cargas")
            .update({
                status: "needs_human_help",
                fallback_reason: reason,
            })
            .eq("id", carga.id);
        return { processados: 0, paraRevisao: 0, needsHumanHelp: true };
    }

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

    // Verificação pós-processamento
    const postFallback = checkFallbackNeeded(products.length, processados, paraRevisao, batchConfidence);
    if (postFallback.needsHelp) {
        await supabase
            .from("cargas")
            .update({
                status: "needs_human_help",
                fallback_reason: postFallback.reason,
            })
            .eq("id", carga.id);
        return { processados, paraRevisao, needsHumanHelp: true };
    }

    return { processados, paraRevisao, needsHumanHelp: false };
}

// ============================================
// Processador CSV com PapaParse + IA Gemini
// ============================================
async function processCsv(
    fileData: Blob,
    carga: Record<string, unknown>,
    supabase: AdminSupabase
) {
    let processados = 0;
    let paraRevisao = 0;

    // Ler o CSV como texto
    const text = await fileData.text();

    if (text.trim().length < 10) {
        throw new Error("Arquivo CSV vazio ou sem dados legíveis.");
    }

    // PapaParse auto-detecta delimitador (, ; \t)
    const { data, meta, errors } = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // manter tudo como string para o Gemini mapear
        transformHeader: (h: string) => h.trim().toUpperCase(),
    });

    if (errors.length > 0) {
        console.warn(`[CSV] PapaParse encontrou ${errors.length} avisos:`, errors.slice(0, 5));
    }

    const delimiter = meta.delimiter || ",";
    const headers = meta.fields || [];

    console.log(`[CSV] ${data.length} linhas, delimitador: "${delimiter}", colunas: [${headers.join(", ")}]`);

    if (headers.length === 0 || data.length === 0) {
        throw new Error("CSV não contém cabeçalho ou dados válidos.");
    }

    const cleanHeaders = headers.filter(Boolean);

    // ---- Salvar cabeçalhos brutos na carga ----
    await supabase
        .from("cargas")
        .update({ raw_headers: cleanHeaders })
        .eq("id", carga.id);

    // ---- Aprendizado Contínuo: consultar mapeamentos conhecidos ----
    const knownMappings = await fetchKnownMappings(
        supabase,
        carga.organization_id as string | null,
        cleanHeaders
    );

    let mapping;
    if (knownMappings) {
        mapping = {
            suggestions: knownMappings,
            overallConfidence: Math.round(
                knownMappings.reduce((acc, s) => acc + s.confidence, 0) / knownMappings.length
            ),
            unmappedKeys: cleanHeaders.filter(
                h => !knownMappings.some(m => m.rawKey === h)
            ),
        };
        console.log(`[CSV] Usando ${knownMappings.length} mapeamentos salvos. Confiança: ${mapping.overallConfidence}%`);
    } else {
        // Gemini sugere mapeamento de colunas
        console.log(`[CSV] Solicitando mapeamento ao Gemini para ${cleanHeaders.length} colunas...`);
        mapping = await suggestColumnMappings(cleanHeaders);
        console.log(`[CSV] Confiança geral do mapeamento: ${mapping.overallConfidence}%`);
        mapping.suggestions.forEach((s) => {
            if (s.standardKey) {
                console.log(`  "${s.rawKey}" → "${s.standardKey}" (${s.confidence}%)`);
            }
        });
    }

    // ---- Verificar se precisa de fallback humano ----
    if (!knownMappings) {
        const fallback = checkFallbackNeeded(data.length, 0, 0, mapping.overallConfidence);
        if (fallback.needsHelp) {
            console.log(`[CSV] FALLBACK HUMANO: ${fallback.reason}`);
            await supabase
                .from("cargas")
                .update({
                    status: "needs_human_help",
                    fallback_reason: fallback.reason,
                })
                .eq("id", carga.id);
            return { processados: 0, paraRevisao: 0, needsHumanHelp: true };
        }
    }

    // Processar cada linha
    let linhasIgnoradas = 0;
    for (const row of data) {
        // Verificar se a linha está vazia
        const hasContent = Object.values(row).some(
            (v) => v !== null && v !== undefined && String(v).trim() !== ""
        );

        if (!hasContent) {
            linhasIgnoradas++;
            continue;
        }

        // Converter keys para UPPERCASE (já feito no header transform, mas garantir)
        const rowObject: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(row)) {
            if (value !== null && value !== undefined && String(value).trim() !== "") {
                rowObject[key] = value;
            }
        }

        const { mapped, confidence } = applyMapping(
            rowObject as Record<string, string | number>,
            mapping.suggestions
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

            if (!error) {
                processados++;
            } else {
                console.error(`[CSV] Erro ao inserir produto:`, error);
            }
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

    console.log(`[CSV] Resumo: ${processados} inseridos, ${paraRevisao} para revisão, ${linhasIgnoradas} linhas em branco ignoradas.`);

    // Verificação pós-processamento
    const postFallback = checkFallbackNeeded(data.length - linhasIgnoradas, processados, paraRevisao, mapping.overallConfidence);
    if (postFallback.needsHelp) {
        await supabase
            .from("cargas")
            .update({
                status: "needs_human_help",
                fallback_reason: postFallback.reason,
            })
            .eq("id", carga.id);
        return { processados, paraRevisao, needsHumanHelp: true };
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

        // Download do arquivo
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
        let headers: string[] = [];

        if (isXlsx) {
            const arrayBuffer = await fileData.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            const worksheet = workbook.worksheets[0];
            if (!worksheet) throw new Error("Planilha vazia");

            const rawData: (unknown[] | null[])[] = [];
            worksheet.eachRow({ includeEmpty: false }, (row) => {
                const values = Array.isArray(row.values)
                    ? (row.values as unknown[]).slice(1)
                    : [];
                rawData.push(values);
            });

            // Encontrar cabeçalho
            for (let i = 0; i < Math.min(15, rawData.length); i++) {
                const row = rawData[i];
                if (!Array.isArray(row)) continue;
                const stringCells = row.filter(r => {
                    if (r === null || r === undefined) return false;
                    const str = String(r).trim();
                    return str !== "" && isNaN(Number(str));
                });
                if (stringCells.length >= 3) {
                    headers = row.map((h: unknown) => {
                        if (h === null || h === undefined) return "";
                        const val = typeof h === "object" && h !== null && "richText" in h
                            ? (h as { richText: { text: string }[] }).richText.map(rt => rt.text).join("")
                            : String(h);
                        return val.trim().toUpperCase();
                    });
                    const dataRows = rawData.slice(i + 1);
                    for (const dr of dataRows) {
                        if (!dr || !Array.isArray(dr)) continue;
                        const obj: Record<string, unknown> = {};
                        let empty = true;
                        headers.forEach((h, idx) => {
                            let cv = dr[idx];
                            if (cv && typeof cv === "object" && "richText" in (cv as Record<string, unknown>)) {
                                cv = ((cv as { richText: { text: string }[] }).richText || []).map(rt => rt.text).join("");
                            }
                            if (h && cv !== null && cv !== undefined && String(cv).trim() !== "") {
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
            const { data, meta } = Papa.parse<Record<string, string>>(text, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (h: string) => h.trim().toUpperCase(),
            });
            headers = meta.fields || [];
            rows = data.filter(row =>
                Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== "")
            );
        }

        // Processar com mapeamento manual
        let processados = 0;
        for (const row of rows) {
            const { mapped, confidence } = applyMapping(
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
