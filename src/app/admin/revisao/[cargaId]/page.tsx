"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function RevisaoPage() {
    const params = useParams();
    const router = useRouter();
    const cargaId = params?.cargaId as string;

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const fetchItems = useCallback(async () => {
        try {
            const res = await fetch(`/api/cargas/${cargaId}/revisao`);
            const json = await res.json();
            if (json.success) {
                setItems(json.data);
            } else {
                setToast({ message: "Erro ao carregar fila de revisão.", type: "error" });
            }
        } catch (err) {
            setToast({ message: "Falha de conexão", type: "error" });
        } finally {
            setLoading(false);
        }
    }, [cargaId]);

    useEffect(() => {
        if (cargaId) fetchItems();
    }, [cargaId, fetchItems]);

    // Oculta toast automaticamente
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleAction = async (itemId: number, action: "approve" | "reject", mappedFields: any) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/cargas/${cargaId}/revisao`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: [{ id: itemId, action, mappedFields }] })
            });
            const json = await res.json();
            
            if (json.success) {
                setToast({ message: action === "approve" ? "Item Aprovado!" : "Item Descartado!", type: "success" });
                // Remover item da tela
                setItems(prev => prev.filter(i => i.id !== itemId));
            } else {
                setToast({ message: json.error || "Erro ao processar", type: "error" });
            }
        } catch (e) {
            setToast({ message: "Falha de comunicação no salvamento", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Carregando itens de revisão...</div>;
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

            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors cursor-pointer"
                    title="Voltar"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1">
                        Revisão Manual
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Carga #{cargaId} • {items.length} itens aguardando aprovação
                    </p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-emerald-500 mb-4 block">
                        task_alt
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">Fila limpa!</h3>
                    <p className="text-slate-400">Nenhum item desta carga está pendente de revisão.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-md transition-all hover:border-primary/50">
                            <div className="flex flex-col md:flex-row gap-6 md:divide-x divide-slate-800">
                                
                                {/* COLUNA 1: Dados Brutos */}
                                <div className="flex-1 md:pr-6">
                                    <div className="flex items-center gap-2 mb-4 text-slate-400">
                                        <span className="material-symbols-outlined text-sm">raw_on</span>
                                        <h4 className="text-sm font-bold uppercase tracking-wider">Leitura Bruta (XLSX)</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {Object.entries(item.raw_data).map(([k, v]) => (
                                            <div key={k} className="bg-slate-800/50 p-3 rounded-lg border border-slate-800/80">
                                                <div className="text-xs text-slate-500 font-bold mb-1 truncate" title={k}>{k}</div>
                                                <div className="text-white font-medium truncate" title={v as string}>{v as React.ReactNode}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* COLUNA 2: Sugestão Mapeada Asisto Fab */}
                                <div className="flex-1 md:pl-6 mt-6 md:mt-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-primary">
                                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                            <h4 className="text-sm font-bold uppercase tracking-wider">Sugestão Asisto Fab</h4>
                                        </div>
                                        <span className={cn(
                                            "text-xs px-2 py-1 rounded-md font-bold",
                                            item.confidence_score >= 80 ? "bg-emerald-900/30 text-emerald-400" :
                                            item.confidence_score >= 40 ? "bg-amber-900/30 text-amber-400" : "bg-red-900/30 text-red-400"
                                        )}>
                                            Confiança: {item.confidence_score}%
                                        </span>
                                    </div>

                                    {Object.keys(item.mapped_data).length === 0 ? (
                                        <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-4 text-sm text-red-400">
                                            A IA não conseguiu encontrar colunas compatíveis.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {Object.entries(item.mapped_data).map(([k, v]) => (
                                                <div key={k} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
                                                    <span className="text-xs text-slate-400 font-bold uppercase w-1/3">{k}</span>
                                                    <span className="text-sm text-white font-medium w-2/3 text-right truncate">{v as React.ReactNode}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-800">
                                        <button
                                            disabled={saving}
                                            onClick={() => handleAction(item.id, "reject", null)}
                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-lg transition-colors cursor-pointer"
                                        >
                                            Descartar Linha
                                        </button>
                                        <button
                                            disabled={saving || Object.keys(item.mapped_data).length === 0}
                                            onClick={() => handleAction(item.id, "approve", item.mapped_data)}
                                            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-sm">check</span>
                                            Aprovar e Importar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
