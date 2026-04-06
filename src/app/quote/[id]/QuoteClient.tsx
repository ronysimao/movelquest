"use client";

import { useState, useRef } from "react";
import { formatCurrency, cn } from "@/lib/utils";

interface QuoteItem {
    id: number;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
    snapshot: {
        modelo?: string;
        categoria?: string;
        imagem_url?: string;
        altura_cm?: number;
        largura_cm?: number;
        comprimento_cm?: number;
        material?: string;
        tecido?: string;
    };
}

interface QuoteData {
    numero: string;
    data: string;
    cliente_nome: string;
    cliente_email?: string;
    observacoes?: string;
    valor_total: number;
    vendedor?: { nome: string; email: string };
    itens: QuoteItem[];
}

export default function QuoteClientPage({ orcamento }: { orcamento: QuoteData }) {
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handleDownloadPdf = async () => {
        if (!printRef.current) return;
        setGeneratingPdf(true);

        try {
            // Dynamic import to avoid SSR issues
            const html2pdf = (await import("html2pdf.js")).default;

            const element = printRef.current;

            const opt = {
                margin: [10, 10, 10, 10] as [number, number, number, number],
                filename: `Pedido_${orcamento.numero}.pdf`,
                image: { type: "jpeg" as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#0f172a",
                    logging: false,
                },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
            };

            await html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error("PDF generation error:", err);
        } finally {
            setGeneratingPdf(false);
        }
    };

    const handleWhatsApp = () => {
        const totalFormatted = formatCurrency(orcamento.valor_total);
        const itemCount = orcamento.itens.reduce((sum, i) => sum + i.quantidade, 0);
        const pageUrl = typeof window !== "undefined" ? window.location.href : "";

        const text = encodeURIComponent(
            `Olá! Segue o resumo do meu pedido *${orcamento.numero}*:\n\n` +
            `📦 ${itemCount} ite${itemCount > 1 ? "ns" : "m"}\n` +
            `💰 Total: *${totalFormatted}*\n` +
            `👤 Cliente: ${orcamento.cliente_nome}\n\n` +
            `🔗 Veja os detalhes: ${pageUrl}`
        );

        window.open(`https://wa.me/?text=${text}`, "_blank");
    };

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(new Date(dateStr));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-primary/30">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full" />
            </div>

            {/* Action Buttons (fixed top) */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                <button
                    onClick={handleDownloadPdf}
                    disabled={generatingPdf}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md border border-slate-700 rounded-xl text-sm font-bold text-white transition-all shadow-lg cursor-pointer disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-lg">
                        {generatingPdf ? "sync" : "picture_as_pdf"}
                    </span>
                    {generatingPdf ? "Gerando..." : "Baixar PDF"}
                </button>
                <button
                    onClick={handleWhatsApp}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600/80 hover:bg-emerald-500 backdrop-blur-md border border-emerald-500/30 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-emerald-600/10 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-lg">chat</span>
                    WhatsApp
                </button>
            </div>

            {/* Printable Content */}
            <div ref={printRef}>
                <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-16">
                    {/* Header */}
                    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined text-white text-2xl block">chair</span>
                                </div>
                                <span className="text-2xl font-extrabold tracking-tight uppercase">
                                    Asisto <span className="text-primary">Fab</span>
                                </span>
                            </div>
                            <h1 className="text-slate-400 text-sm font-medium uppercase tracking-widest">Resumo do Pedido</h1>
                            <p className="text-3xl sm:text-4xl font-black text-white mt-1">
                                {orcamento.numero}
                            </p>
                            <p className="text-slate-500 mt-2 text-xs">
                                Emitido em {formatDate(orcamento.data)}
                            </p>
                            <p className="text-slate-400 mt-1 text-sm max-w-md line-clamp-2">
                                Preparado por <strong className="text-white">{orcamento.vendedor?.nome || "Asisto Fab"}</strong>
                            </p>
                        </div>

                        <div className="flex flex-col sm:items-end w-full sm:w-auto p-4 sm:p-0 bg-slate-800/50 sm:bg-transparent rounded-2xl border border-slate-700/50 sm:border-none">
                            <span className="text-xs text-slate-500 uppercase font-bold mb-1">Para o Cliente</span>
                            <p className="text-lg font-bold text-white break-words">{orcamento.cliente_nome}</p>
                            {orcamento.cliente_email && (
                                <p className="text-sm text-slate-400 mt-1">{orcamento.cliente_email}</p>
                            )}
                            <div className="mt-4 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-end">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                Aprovado
                            </div>
                        </div>
                    </header>

                    {/* Items List */}
                    <div className="space-y-4 mb-12">
                        <h2 className="text-xl font-bold flex items-center gap-2 px-2 text-white">
                            <span className="material-symbols-outlined text-primary">inventory_2</span>
                            Itens do Pedido
                        </h2>

                        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
                            {orcamento.itens.map((item, idx) => {
                                const snapshot = item.snapshot || {};
                                const itemName = snapshot.modelo || "Produto sem nome";
                                const itemCategory = snapshot.categoria || "";
                                const itemImage = snapshot.imagem_url || "/placeholder-furniture.jpg";
                                const hasDimensions = snapshot.altura_cm || snapshot.largura_cm || snapshot.comprimento_cm;

                                return (
                                    <div key={item.id} className={cn(
                                        "flex flex-col sm:flex-row gap-6 p-6 group hover:bg-slate-800/50 transition-colors",
                                        idx !== orcamento.itens.length - 1 && "border-b border-slate-800/50"
                                    )}>
                                        <div className="relative w-full sm:w-32 h-40 sm:h-32 bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                                style={{ backgroundImage: `url(${itemImage})` }}
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                <div>
                                                    {itemCategory && (
                                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                                                            {itemCategory}
                                                        </span>
                                                    )}
                                                    <h3 className="text-lg font-bold text-white leading-tight mb-2">
                                                        {itemName}
                                                    </h3>

                                                    {hasDimensions && (
                                                        <div className="flex gap-2 sm:gap-4 mt-2">
                                                            {snapshot.altura_cm && (
                                                                <div className="text-xs bg-slate-950/50 border border-slate-800 px-2 py-1 rounded">
                                                                    <span className="text-slate-500 mr-1">A:</span><span className="font-medium text-slate-300">{snapshot.altura_cm}cm</span>
                                                                </div>
                                                            )}
                                                            {snapshot.largura_cm && (
                                                                <div className="text-xs bg-slate-950/50 border border-slate-800 px-2 py-1 rounded">
                                                                    <span className="text-slate-500 mr-1">L:</span><span className="font-medium text-slate-300">{snapshot.largura_cm}cm</span>
                                                                </div>
                                                            )}
                                                            {snapshot.comprimento_cm && (
                                                                <div className="text-xs bg-slate-950/50 border border-slate-800 px-2 py-1 rounded">
                                                                    <span className="text-slate-500 mr-1">P:</span><span className="font-medium text-slate-300">{snapshot.comprimento_cm}cm</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {(snapshot.material || snapshot.tecido) && (
                                                        <div className="flex gap-2 mt-2">
                                                            {snapshot.material && (
                                                                <span className="text-xs text-slate-500">
                                                                    <span className="text-slate-600">Material:</span> {snapshot.material}
                                                                </span>
                                                            )}
                                                            {snapshot.tecido && (
                                                                <span className="text-xs text-slate-500">
                                                                    <span className="text-slate-600">Tecido:</span> {snapshot.tecido}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto sm:h-full bg-slate-950/30 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-sm font-bold text-white">{item.quantidade}x</p>
                                                        <p className="text-xs text-slate-500">{formatCurrency(item.preco_unitario)} cada</p>
                                                    </div>
                                                    <p className="text-xl font-black text-primary sm:mt-auto">
                                                        {formatCurrency(item.subtotal)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {orcamento.observacoes && (
                        <div className="mb-12 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-xl flex gap-4 items-start border-l-4 border-l-primary">
                            <div className="bg-primary/20 text-primary w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[20px]">info</span>
                            </div>
                            <div>
                                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2 mt-1">Observações do Pedido</h3>
                                <p className="text-white text-base leading-relaxed whitespace-pre-wrap">
                                    {orcamento.observacoes}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer Total */}
                    <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-slate-400 font-medium uppercase tracking-widest text-sm mb-1">Total do Pedido</h3>
                                <p className="text-4xl sm:text-5xl font-black text-white">
                                    {formatCurrency(orcamento.valor_total)}
                                </p>
                                <p className="text-xs text-slate-500 mt-2">
                                    {orcamento.itens.reduce((s, i) => s + i.quantidade, 0)} ite{orcamento.itens.reduce((s, i) => s + i.quantidade, 0) > 1 ? "ns" : "m"} · Pedido {orcamento.numero}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <button
                                    onClick={handleDownloadPdf}
                                    disabled={generatingPdf}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 border border-slate-700"
                                >
                                    <span className="material-symbols-outlined text-white">picture_as_pdf</span>
                                    {generatingPdf ? "Gerando PDF..." : "Baixar PDF"}
                                </button>
                                <button
                                    onClick={handleWhatsApp}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-white">chat</span>
                                    Enviar via WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Branding Footer */}
                    <div className="mt-12 text-center pb-8">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Gerado por Asisto Fab
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
