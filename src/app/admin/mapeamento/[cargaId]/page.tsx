"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { StandardFieldKey } from "@/lib/gemini";

// ============================================
// Tipos locais
// ============================================
interface MappingEntry {
    rawKey: string;
    standardKey: string | null;
}

interface CargaInfo {
    id: number;
    nome_arquivo: string;
    status: string;
    fallback_reason: string | null;
}

const STANDARD_FIELD_LABELS: Record<string, string> = {
    categoria: "Categoria",
    modelo: "Modelo / Nome",
    variante: "Variante",
    tipo: "Tipo / Linha",
    comprimento_cm: "Comprimento (cm)",
    largura_cm: "Largura (cm)",
    altura_cm: "Altura (cm)",
    material: "Material",
    tecido: "Tecido",
    preco: "Preço (R$)",
    condicao_pagamento: "Cond. Pagamento",
};

// ============================================
// Main Page Component
// ============================================
export default function MapeamentoPage() {
    const params = useParams();
    const router = useRouter();
    const cargaId = params?.cargaId as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveAsTemplate, setSaveAsTemplate] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [carga, setCarga] = useState<CargaInfo | null>(null);
    const [rawHeaders, setRawHeaders] = useState<string[]>([]);
    const [standardFields, setStandardFields] = useState<string[]>([]);
    const [mappings, setMappings] = useState<MappingEntry[]>([]);
    const [sampleData, setSampleData] = useState<Record<string, unknown>[]>([]);
    const [existingMappings, setExistingMappings] = useState<{ raw_key: string; standard_key: string }[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);

    // ---- Fetch data ----
    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`/api/cargas/${cargaId}/mapeamento`);
            const json = await res.json();

            if (json.success) {
                setCarga(json.carga);
                setRawHeaders(json.rawHeaders || []);
                setStandardFields(json.standardFields || []);
                setSampleData(json.sampleData || []);
                setExistingMappings(json.existingMappings || []);

                // Inicializar mapeamentos com valores existentes (se houver)
                const initialMappings: MappingEntry[] = (json.rawHeaders || []).map((h: string) => {
                    const existing = (json.existingMappings || []).find(
                        (m: { raw_key: string }) => m.raw_key.toUpperCase() === h.toUpperCase()
                    );
                    return {
                        rawKey: h,
                        standardKey: existing?.standard_key || null,
                    };
                });
                setMappings(initialMappings);
            } else {
                console.error("[Mapeamento] API error:", json);
                setLoadError(json.error || `Erro HTTP ${res.status}`);
            }
        } catch (e) {
            console.error("[Mapeamento] Fetch error:", e);
            setLoadError("Falha de conexão com o servidor");
        } finally {
            setLoading(false);
        }
    }, [cargaId]);

    useEffect(() => {
        if (cargaId) fetchData();
    }, [cargaId, fetchData]);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // ---- Handlers ----
    const handleMappingChange = (rawKey: string, standardKey: string | null) => {
        setMappings(prev =>
            prev.map(m => m.rawKey === rawKey ? { ...m, standardKey } : m)
        );
    };

    const handleSubmit = async () => {
        const mapped = mappings.filter(m => m.standardKey);
        if (mapped.length === 0) {
            setToast({ message: "Mapeie pelo menos 1 coluna antes de processar.", type: "error" });
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/cargas/${cargaId}/mapeamento`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mappings, saveAsTemplate }),
            });
            const json = await res.json();

            if (json.success) {
                setToast({
                    message: `${json.processed} produtos importados com sucesso!${json.templateSaved ? " Template salvo." : ""}`,
                    type: "success",
                });
                // Redirecionar após 2s
                setTimeout(() => router.push("/admin"), 2000);
            } else {
                setToast({ message: json.error || "Erro ao processar", type: "error" });
            }
        } catch {
            setToast({ message: "Falha de conexão", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    // ---- Preview da tabela mapeada ----
    const previewData = useMemo(() => {
        if (sampleData.length === 0 || mappings.length === 0) return [];

        return sampleData.map(row => {
            const mapped: Record<string, unknown> = {};
            for (const m of mappings) {
                if (m.standardKey && row[m.rawKey] !== undefined) {
                    mapped[m.standardKey] = row[m.rawKey];
                }
            }
            return mapped;
        });
    }, [sampleData, mappings]);

    // Colunas já usadas (para evitar duplicatas no dropdown)
    const usedStandardKeys = useMemo(
        () => new Set(mappings.filter(m => m.standardKey).map(m => m.standardKey!)),
        [mappings]
    );

    const mappedCount = mappings.filter(m => m.standardKey).length;

    // ---- Loading State ----
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                    <span className="material-symbols-outlined text-4xl animate-spin-slow">sync</span>
                    <p className="text-sm font-medium">Carregando dados do arquivo...</p>
                </div>
            </div>
        );
    }

    if (!carga) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center text-slate-400 max-w-md">
                    <span className="material-symbols-outlined text-5xl mb-4 block text-red-400">error</span>
                    <h3 className="text-lg font-bold text-white mb-2">Erro ao carregar carga</h3>
                    <p className="text-sm mb-4">{loadError || "Carga não encontrada ou acesso negado."}</p>
                    <button
                        onClick={() => { setLoading(true); setLoadError(null); fetchData(); }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-16">
            {/* Toast */}
            {toast && (
                <div className={cn(
                    "fixed top-20 right-8 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl border animate-slide-up bg-slate-900 border-slate-700",
                    toast.type === "success" ? "text-emerald-400" : "text-red-400"
                )}>
                    <span className="material-symbols-outlined shrink-0">
                        {toast.type === "success" ? "check_circle" : "error"}
                    </span>
                    <span className="text-sm font-bold">{toast.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors cursor-pointer mt-1"
                    title="Voltar"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-extrabold tracking-tight text-white">
                            Ajuste Manual
                        </h2>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-900/30 text-orange-400 border border-orange-700/50">
                            <span className="material-symbols-outlined text-sm">front_hand</span>
                            Requer atenção
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm">
                        Arquivo: <span className="text-white font-medium">{carga.nome_arquivo}</span>
                    </p>
                    {carga.fallback_reason && (
                        <div className="mt-3 flex items-start gap-3 px-4 py-3 bg-orange-900/10 border border-orange-800/30 rounded-lg">
                            <span className="material-symbols-outlined text-sm text-orange-400 mt-0.5">warning</span>
                            <p className="text-sm text-orange-300">{carga.fallback_reason}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mapping Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">swap_horiz</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Mapeamento de Colunas</h3>
                            <p className="text-xs text-slate-500">
                                {mappedCount} de {rawHeaders.length} colunas mapeadas
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-primary h-full rounded-full transition-all duration-300"
                                style={{ width: `${rawHeaders.length > 0 ? (mappedCount / rawHeaders.length) * 100 : 0}%` }}
                            />
                        </div>
                        <span className="text-xs text-slate-400 font-bold">
                            {rawHeaders.length > 0 ? Math.round((mappedCount / rawHeaders.length) * 100) : 0}%
                        </span>
                    </div>
                </div>

                {/* Info banner */}
                <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <span className="material-symbols-outlined text-sm text-primary">info</span>
                    <p className="text-xs text-slate-400">
                        Para cada coluna do seu arquivo, selecione o campo correspondente no sistema.
                        Colunas sem mapeamento serão ignoradas.
                    </p>
                </div>

                {/* Mapping Table */}
                <div className="space-y-3">
                    {mappings.map((m) => {
                        const sampleValue = sampleData[0]?.[m.rawKey];
                        return (
                            <div
                                key={m.rawKey}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border transition-all",
                                    m.standardKey
                                        ? "bg-emerald-900/5 border-emerald-800/30"
                                        : "bg-slate-800/30 border-slate-800"
                                )}
                            >
                                {/* Coluna bruta (esquerda) */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "material-symbols-outlined text-sm",
                                            m.standardKey ? "text-emerald-400" : "text-slate-600"
                                        )}>
                                            {m.standardKey ? "check_circle" : "radio_button_unchecked"}
                                        </span>
                                        <span className="text-sm font-bold text-white truncate" title={m.rawKey}>
                                            {m.rawKey}
                                        </span>
                                    </div>
                                    {sampleValue !== undefined && (
                                        <p className="text-xs text-slate-500 mt-1 ml-6 truncate" title={String(sampleValue)}>
                                            Ex: <span className="text-slate-400">{String(sampleValue)}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Seta */}
                                <span className="material-symbols-outlined text-slate-600 text-lg shrink-0">
                                    arrow_forward
                                </span>

                                {/* Select (direita) */}
                                <div className="w-52 shrink-0">
                                    <select
                                        value={m.standardKey || ""}
                                        onChange={(e) => handleMappingChange(m.rawKey, e.target.value || null)}
                                        className={cn(
                                            "w-full px-3 py-2.5 rounded-lg text-sm font-medium border outline-none transition-colors cursor-pointer appearance-none",
                                            "bg-slate-800 text-white border-slate-700",
                                            "hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20",
                                            !m.standardKey && "text-slate-500"
                                        )}
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "right 12px center",
                                            paddingRight: "36px",
                                        }}
                                    >
                                        <option value="">— Ignorar —</option>
                                        {standardFields.map((field) => (
                                            <option
                                                key={field}
                                                value={field}
                                                disabled={usedStandardKeys.has(field) && m.standardKey !== field}
                                            >
                                                {STANDARD_FIELD_LABELS[field] || field}
                                                {usedStandardKeys.has(field) && m.standardKey !== field ? " (já usado)" : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Preview Table */}
            {previewData.length > 0 && mappedCount > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">preview</span>
                            <h3 className="text-lg font-bold text-white">Pré-visualização</h3>
                            <span className="text-xs text-slate-500">
                                Primeiras {previewData.length} linhas com o mapeamento aplicado
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-800/50 text-xs font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                    {mappings.filter(m => m.standardKey).map(m => (
                                        <th key={m.standardKey!} className="px-4 py-3">
                                            {STANDARD_FIELD_LABELS[m.standardKey!] || m.standardKey}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {previewData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                                        {mappings.filter(m => m.standardKey).map(m => (
                                            <td key={m.standardKey!} className="px-4 py-3 text-sm text-white truncate max-w-[200px]">
                                                {row[m.standardKey!] !== undefined
                                                    ? String(row[m.standardKey!])
                                                    : <span className="text-slate-600 italic">—</span>
                                                }
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Save as template checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={saveAsTemplate}
                            onChange={(e) => setSaveAsTemplate(e.target.checked)}
                            className="sr-only"
                        />
                        <div className={cn(
                            "size-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer",
                            saveAsTemplate
                                ? "bg-primary border-primary"
                                : "border-slate-600 group-hover:border-slate-500"
                        )}>
                            {saveAsTemplate && (
                                <span className="material-symbols-outlined text-white text-sm">check</span>
                            )}
                        </div>
                        <div>
                            <span className="text-sm font-medium text-white">
                                Salvar como template
                            </span>
                            <p className="text-xs text-slate-500">
                                Será usado automaticamente em importações futuras
                            </p>
                        </div>
                    </label>

                    {/* Submit button */}
                    <button
                        onClick={handleSubmit}
                        disabled={saving || mappedCount === 0}
                        className={cn(
                            "flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-sm transition-all cursor-pointer",
                            "bg-primary text-white hover:bg-primary/90",
                            "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        {saving ? (
                            <>
                                <span className="material-symbols-outlined animate-spin-slow text-sm">sync</span>
                                Processando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">play_arrow</span>
                                Processar com este mapeamento
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
