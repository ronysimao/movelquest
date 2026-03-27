"use client";

import { useState, useMemo, useEffect } from "react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

type OrderItem = {
    id: number;
    subtotal: number;
    quantidade: number;
    preco_unitario: number;
    snapshot: any;
};

type Order = {
    id: number;
    numero: string;
    created_at: string;
    valor_total: number;
    cliente_nome: string;
    observacoes?: string;
    vendedor?: { nome: string };
    itens: OrderItem[];
};

export default function OrdersClient({ 
    initialOrders, 
    isAdmin 
}: { 
    initialOrders: Order[]; 
    isAdmin: boolean;
}) {
    const [viewMode, setViewMode] = useState<"cards" | "list">("list");
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "value_desc" | "value_asc">("date_desc");
    const [searchItem, setSearchItem] = useState<string>("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Extract unique item names from all orders for the autocomplete/datalist
    const availableItems = useMemo(() => {
        const itemNames = new Set<string>();
        initialOrders.forEach(order => {
            order.itens.forEach(item => {
                if (item.snapshot?.modelo) {
                    itemNames.add(item.snapshot.modelo);
                }
            });
        });
        return Array.from(itemNames).sort();
    }, [initialOrders]);

    // Apply Filters & Sorting
    const filteredAndSortedOrders = useMemo(() => {
        let result = [...initialOrders];

        // Filter by Item Name
        if (searchItem) {
            const term = searchItem.toLowerCase();
            result = result.filter(order => 
                order.itens.some(item => 
                    item.snapshot?.modelo?.toLowerCase().includes(term) ||
                    item.snapshot?.categoria?.toLowerCase().includes(term)
                )
            );
        }

        // Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case "date_asc":
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case "date_desc":
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case "value_asc":
                    return a.valor_total - b.valor_total;
                case "value_desc":
                    return b.valor_total - a.valor_total;
                default:
                    return 0;
            }
        });

        return result;
    }, [initialOrders, searchItem, sortBy]);


    const toggleExpand = (id: number) => {
        setExpandedOrder(prev => prev === id ? null : id);
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Control Panel / Filters */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-4 items-end backdrop-blur-md shadow-lg">
                <div className="w-full flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Filtrar por item no pedido</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500">search</span>
                        <input 
                            type="text"
                            value={searchItem}
                            onChange={(e) => setSearchItem(e.target.value)}
                            placeholder="Buscar modelo, poltrona, mesa..."
                            list="item-list"
                            className="w-full bg-slate-950/50 border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all"
                        />
                        <datalist id="item-list">
                            {availableItems.map(item => (
                                <option key={item} value={item} />
                            ))}
                        </datalist>
                    </div>
                </div>

                <div className="w-full md:w-48">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ordenar por</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-[18px]">sort</span>
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full bg-slate-950/50 border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 pl-9 pr-4 text-sm text-white appearance-none outline-none cursor-pointer"
                        >
                            <option value="date_desc">Data (Mais recentes)</option>
                            <option value="date_asc">Data (Mais antigos)</option>
                            <option value="value_desc">Valor (Maior)</option>
                            <option value="value_asc">Valor (Menor)</option>
                        </select>
                    </div>
                </div>

                <div className="w-full md:w-auto mt-4 md:mt-0">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Visão</label>
                    <div className="flex bg-slate-950/50 border border-slate-700 rounded-xl p-1">
                        <button 
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                                viewMode === "list" ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <span className="material-symbols-outlined text-lg">view_list</span>
                        </button>
                        <button 
                            onClick={() => setViewMode("cards")}
                            className={cn(
                                "flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                                viewMode === "cards" ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <span className="material-symbols-outlined text-lg">grid_view</span>
                        </button>
                        <div className="w-px h-6 bg-slate-700 my-auto mx-1" />
                        <button
                            onClick={() => {
                                setSearchItem("");
                                setSortBy("date_desc");
                            }}
                            className="flex-1 md:flex-none px-3 py-1.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-slate-500 hover:text-white"
                            title="Desfazer filtros"
                        >
                            <span className="material-symbols-outlined text-[18px]">device_reset</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Feedback */}
            <div className="mb-4 text-sm text-slate-400 font-medium">
                Exibindo <span className="text-white">{filteredAndSortedOrders.length}</span> {filteredAndSortedOrders.length === 1 ? 'pedido' : 'pedidos'}
                {searchItem && <span> contendo <strong className="text-primary">&quot;{searchItem}&quot;</strong></span>}
            </div>

            {/* Orders Render (Empty State) */}
            {filteredAndSortedOrders.length === 0 ? (
                 <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center">
                     <span className="material-symbols-outlined text-6xl text-slate-700 mb-4 animate-bounce-slow">search_off</span>
                     <h2 className="text-xl font-bold text-white mb-2">Nenhum resultado</h2>
                     <p className="text-slate-400 mb-6 max-w-sm">Tente ajustar seus filtros para encontrar o pedido desejado.</p>
                     <button onClick={() => setSearchItem("")} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl text-white font-bold transition-colors cursor-pointer">
                         Limpar Filtros
                     </button>
                 </div>
            ) : (
                <div className={cn(
                    "grid gap-4 w-full",
                    viewMode === "cards" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                    {filteredAndSortedOrders.map((order) => {
                        const isExpanded = expandedOrder === order.id;

                        return (
                            <div key={order.id} className="bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all hover:shadow-xl group">
                                {/* Order Header / Summary */}
                                <div 
                                    className={cn(
                                        "p-6 flex flex-col items-start justify-between cursor-pointer",
                                        viewMode === "list" ? "sm:flex-row gap-6 sm:items-center" : "gap-4"
                                    )}
                                    onClick={() => toggleExpand(order.id)}
                                >
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">receipt_long</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-white tracking-tight">{order.numero}</h3>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400">
                                                    {formatDate(order.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400">Cliente: <span className="text-slate-300 font-medium">{order.cliente_nome}</span></p>
                                            <p className="text-xs text-slate-500 mt-1">{order.itens?.length || 0} {(order.itens?.length || 0) === 1 ? 'item' : 'itens'} no pedido</p>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "flex gap-4 w-full justify-between items-center sm:w-auto",
                                        viewMode === "list" ? "sm:flex-row" : "flex-row sm:mt-4 pt-4 border-t border-slate-800 sm:w-full"
                                    )}>
                                        <div className="flex flex-col text-left sm:text-right">
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Valor Total</p>
                                            <p className="text-xl font-black text-primary">{formatCurrency(order.valor_total)}</p>
                                            {isAdmin && (
                                                <p className="text-[10px] text-slate-500 mt-0.5 max-w-[120px] truncate" title={order.vendedor?.nome}>
                                                    Vendedor: {order.vendedor?.nome || '—'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(`${window.location.origin}/quote/${order.numero}`);
                                                    showToast("Link do pedido copiado com sucesso!", "success");
                                                }}
                                                className="flex items-center justify-center p-2 rounded-full bg-slate-900 border border-slate-700 hover:border-primary text-slate-400 hover:text-primary transition-all cursor-pointer group/btn"
                                                title="Copiar Link"
                                            >
                                                <span className="material-symbols-outlined text-[18px] group-hover/btn:-translate-y-0.5 transition-transform">content_copy</span>
                                            </button>
                                            <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors bg-slate-950 p-2 rounded-full border border-slate-800">
                                                {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items Inline Expansion */}
                                {isExpanded && (
                                    <div className="bg-slate-950/50 border-t border-slate-800 p-6 animate-slide-up">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-[18px]">inventory_2</span>
                                                Resumo dos Itens
                                            </h4>
                                            
                                            <Link 
                                                href={`/quote/${order.numero}`}
                                                target="_blank"
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-primary/20 hover:border-primary"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                Ver Pedido
                                            </Link>
                                        </div>

                                        {order.observacoes && (
                                            <div className="mb-6 bg-slate-900/50 rounded-xl p-4 border border-slate-800 border-l-4 border-l-primary flex gap-3 items-start">
                                                <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                                                <div>
                                                    <h5 className="text-xs font-bold text-slate-400 uppercase mb-1">Observações do Pedido</h5>
                                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{order.observacoes}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            {order.itens.map(item => {
                                                const snap = item.snapshot || {};
                                                return (
                                                    <div key={item.id} className="flex gap-4 items-center bg-slate-900 rounded-xl p-3 border border-slate-800 hover:border-slate-700 transition-colors">
                                                        <div 
                                                            className="w-16 h-16 bg-slate-800 rounded-lg shrink-0 bg-cover bg-center border border-slate-700 overflow-hidden"
                                                            style={{ backgroundImage: `url(${snap.imagem_url || '/placeholder-furniture.jpg'})` }}
                                                        />
                                                        <div className="flex-1 min-w-0 flex flex-col">
                                                            <div className="flex justify-between items-start gap-4">
                                                                <div className="truncate">
                                                                    <p className="text-xs font-bold text-slate-500 uppercase mb-0.5">{snap.categoria || 'Móvel'}</p>
                                                                    <p className="text-sm font-bold text-white truncate" title={snap.modelo}>{snap.modelo}</p>
                                                                    <p className="text-xs text-slate-400 mt-1">{item.quantidade}x à {formatCurrency(item.preco_unitario)}</p>
                                                                </div>
                                                                <span className="text-sm font-black text-primary p-2 bg-primary/5 rounded-lg border border-primary/10 shrink-0">
                                                                    {formatCurrency(item.subtotal)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Toast Feedback */}
            {toast && (
                <div className={cn(
                    "fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-fade-in-up",
                    toast.type === "success" && "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                )}>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span className="text-sm font-bold">{toast.message}</span>
                </div>
            )}
        </div>
    );
}
