import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// ============================================
// Tipos do Sistema
// ============================================

/** Campos padronizados da tabela `moveis` no banco de dados */
export const STANDARD_FIELDS = [
    "categoria",
    "modelo",
    "variante",
    "tipo",
    "comprimento_cm",
    "largura_cm",
    "altura_cm",
    "material",
    "tecido",
    "preco",
    "condicao_pagamento",
] as const;

export type StandardFieldKey = typeof STANDARD_FIELDS[number];

export interface MappingSuggestion {
    rawKey: string;
    standardKey: StandardFieldKey | null;
    confidence: number; // 0 a 100
    reason: string;
}

export interface MappingResult {
    suggestions: MappingSuggestion[];
    overallConfidence: number;
    unmappedKeys: string[];
}

export interface ExtractedProduct {
    [key: string]: string | number | null;
}

// ============================================
// Inicialização do Cliente Gemini
// ============================================

function getGeminiClient() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_AI_API_KEY não configurada no ambiente.");
    }
    return new GoogleGenerativeAI(apiKey);
}

// ============================================
// Função 1: Mapeamento de Colunas XLSX
// Recebe os cabeçalhos brutos do arquivo e retorna sugestões de mapeamento
// ============================================

export async function suggestColumnMappings(
    rawHeaders: string[],
    existingMappings?: Record<string, string>
): Promise<MappingResult> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const standardFieldsDesc = {
        categoria: "Categoria do móvel (ex: Sofá, Mesa, Cadeira)",
        modelo: "Nome ou modelo do produto (ex: Milano, Oslo)",
        variante: "Variação do produto (ex: 2 lugares, 3 lugares)",
        tipo: "Subtipo ou linha do produto",
        comprimento_cm: "Comprimento em centímetros (número)",
        largura_cm: "Largura em centímetros (número)",
        altura_cm: "Altura em centímetros (número)",
        material: "Material principal (ex: MDF, Madeira Maciça)",
        tecido: "Tecido ou revestimento (ex: Linho, Couro Sintético)",
        preco: "Preço em reais (número)",
        condicao_pagamento: "Condição de pagamento (ex: 30/60/90)",
    };

    const prompt = `
Você é um especialista em importação de catálogos de móveis.
Analise os cabeçalhos de uma planilha XLSX e mapeie-os para os campos padrão do sistema.

CABEÇALHOS DO ARQUIVO:
${rawHeaders.map((h, i) => `${i + 1}. "${h}"`).join("\n")}

CAMPOS PADRÃO DO SISTEMA:
${Object.entries(standardFieldsDesc).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

${existingMappings && Object.keys(existingMappings).length > 0 ? `
MAPEAMENTOS JÁ CONHECIDOS (de importações anteriores):
${Object.entries(existingMappings).map(([k, v]) => `"${k}" → "${v}"`).join("\n")}
` : ""}

Retorne um JSON com o array de sugestões. Para cada cabeçalho, sugira o campo padrão mais adequado:
- Se não houver equivalência, use null em standardKey
- confidence deve ser 0-100 (100 = certeza absoluta)
- reason deve ser curto (máx 80 chars)

Formato exato:
{
  "suggestions": [
    { "rawKey": "DESCRIÇÃO", "standardKey": "modelo", "confidence": 90, "reason": "Nome/descrição principal do produto" },
    ...
  ]
}
`;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
            },
        });

        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);
        const suggestions: MappingSuggestion[] = parsed.suggestions || [];

        // Calcular confiança geral
        const mappedCount = suggestions.filter((s) => s.standardKey !== null).length;
        const avgConfidence =
            suggestions.length > 0
                ? suggestions
                    .filter((s) => s.standardKey !== null)
                    .reduce((acc, s) => acc + s.confidence, 0) / Math.max(mappedCount, 1)
                : 0;

        const unmappedKeys = suggestions
            .filter((s) => s.standardKey === null)
            .map((s) => s.rawKey);

        return {
            suggestions,
            overallConfidence: Math.round(avgConfidence),
            unmappedKeys,
        };
    } catch (err) {
        console.error("[Gemini] Erro no mapeamento de colunas:", err);
        // Fallback: retornar sem mapeamento
        return {
            suggestions: rawHeaders.map((h) => ({
                rawKey: h,
                standardKey: null,
                confidence: 0,
                reason: "Erro na análise pela IA",
            })),
            overallConfidence: 0,
            unmappedKeys: rawHeaders,
        };
    }
}

// ============================================
// Função 2: Extração de Produtos de Texto (XLSX/CSV/PDF)
// Recebe o texto bruto/tabelar de qualquer fonte e retorna lista de produtos
// ============================================

export async function extractProductsFromText(
    rawText: string,
    maxProducts = 100
): Promise<{ products: ExtractedProduct[]; confidence: number }> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Você é um especialista em extração de dados de catálogos de móveis brasileiros.
Analise o conteúdo abaixo (pode ser de uma planilha XLSX, CSV ou PDF) e extraia TODOS os produtos.

CONTEÚDO DO CATÁLOGO:
---
${rawText.substring(0, 15000)} ${rawText.length > 15000 ? "... [truncado]" : ""}
---

INSTRUÇÕES IMPORTANTES:
- Ignore linhas de cabeçalho, títulos, logos, datas e subtotais
- Cada produto é uma linha de dados com preço, modelo, dimensões, etc.
- Se houver colunas como "REF", "DESCRIÇÃO", "VLR" etc., interprete semanticamente
- Preços podem estar em formato brasileiro: "1.250,00" ou "R$ 1250"
- Dimensões podem estar como "L x A x P" ou em colunas separadas
- Se uma coluna tiver valores como "SOFÁ 3 LUGARES", separe em modelo + variante

CAMPOS A EXTRAIR (use null se não encontrar):
- categoria: Categoria do móvel (Sofá, Mesa, Cadeira, Rack, Estante, etc.)
- modelo: Nome/modelo do produto
- variante: Variação (ex: 2 lugares, com gaveta, cor)
- tipo: Subtipo, linha ou coleção
- comprimento_cm: Comprimento em cm (apenas número)
- largura_cm: Largura em cm (apenas número)
- altura_cm: Altura em cm (apenas número)
- material: Material principal
- tecido: Tecido ou revestimento
- preco: Preço em reais (apenas número decimal, sem "R$")
- condicao_pagamento: Condição de pagamento

Extraia no máximo ${maxProducts} produtos. Retorne JSON:
{
  "confidence": 75,
  "products": [
    { "categoria": "Sofá", "modelo": "Milano", "variante": "3 lugares", "preco": 2500.00, ... },
    ...
  ]
}
`;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
                maxOutputTokens: 8192,
            },
        });

        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        return {
            products: parsed.products || [],
            confidence: parsed.confidence || 50,
        };
    } catch (err) {
        console.error("[Gemini] Erro na extração de produtos:", err);
        return { products: [], confidence: 0 };
    }
}

// ============================================
// Função 3: Aplicar mapeamento aos dados brutos de uma linha
// ============================================

export function applyMapping(
    rowData: Record<string, any>,
    suggestions: MappingSuggestion[],
    minConfidence = 60
): { mapped: Partial<Record<StandardFieldKey, any>>; confidence: number } {
    const mapped: Partial<Record<StandardFieldKey, any>> = {};
    let totalConfidence = 0;
    let mappedCount = 0;

    for (const suggestion of suggestions) {
        if (!suggestion.standardKey || suggestion.confidence < minConfidence) continue;
        const rawValue = rowData[suggestion.rawKey];
        if (rawValue === undefined || rawValue === null || rawValue === "") continue;

        // Converter tipos numéricos
        const numericFields: StandardFieldKey[] = [
            "comprimento_cm", "largura_cm", "altura_cm", "preco",
        ];

        if (numericFields.includes(suggestion.standardKey)) {
            const numVal = typeof rawValue === "number" ? rawValue : parseFloat(String(rawValue).replace(/[^0-9.,]/g, "").replace(",", "."));
            if (!isNaN(numVal)) {
                mapped[suggestion.standardKey] = numVal;
                totalConfidence += suggestion.confidence;
                mappedCount++;
            }
        } else {
            mapped[suggestion.standardKey] = String(rawValue).trim();
            totalConfidence += suggestion.confidence;
            mappedCount++;
        }
    }

    const avgConfidence = mappedCount > 0 ? Math.round(totalConfidence / mappedCount) : 0;

    // Campos críticos: se não tiver modelo + preço, reduzir confiança
    const hasCritical = "modelo" in mapped || "categoria" in mapped;
    const finalConfidence = hasCritical ? avgConfidence : Math.min(avgConfidence, 40);

    return { mapped, confidence: finalConfidence };
}
