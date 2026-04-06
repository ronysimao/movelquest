"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import type { Movel, Profile } from "@/types";

// ============================================
// Product Card Component
// ============================================
function ProductCard({
    movel,
    onOpen,
}: {
    movel: Movel;
    onOpen: (m: Movel) => void;
}) {
    const placeholderImg = "/placeholder-furniture.jpg";
    const imgUrl = movel.imagem_url || placeholderImg;

    return (
        <div className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-primary transition-all flex flex-col">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-slate-800">
                <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                    style={{
                        backgroundImage: `url(${imgUrl})`,
                        backgroundColor: "#1e293b",
                    }}
                />
                {movel.fornecedor && (
                    <div className="absolute top-3 left-3 bg-primary text-white px-2 py-1 rounded text-[10px] font-bold uppercase">
                        {(movel.fornecedor as unknown as { nome: string }).nome}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 min-w-0 w-full overflow-hidden">
                <span className="text-[10px] font-bold text-primary uppercase mb-1 block truncate">
                    {movel.categoria}
                </span>
                <h3 className="font-bold text-white mb-2 leading-tight line-clamp-2 break-words text-sm sm:text-base">
                    {movel.modelo}
                    {movel.variante && (
                        <span className="text-slate-400 font-normal">
                            {" "}
                            — {movel.variante}
                        </span>
                    )}
                </h3>

                {/* Dimensions */}
                {(movel.altura_cm || movel.largura_cm || movel.comprimento_cm) && (
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4">
                        {movel.altura_cm && (
                            <div className="text-[10px] bg-slate-800/50 p-1 sm:p-2 rounded text-center min-w-0 overflow-hidden">
                                <span className="block text-slate-400 font-medium truncate">Alt.</span>
                                <span className="font-bold text-white block truncate">
                                    {movel.altura_cm}cm
                                </span>
                            </div>
                        )}
                        {movel.largura_cm && (
                            <div className="text-[10px] bg-slate-800/50 p-1 sm:p-2 rounded text-center min-w-0 overflow-hidden">
                                <span className="block text-slate-400 font-medium truncate">Larg.</span>
                                <span className="font-bold text-white block truncate">
                                    {movel.largura_cm}cm
                                </span>
                            </div>
                        )}
                        {movel.comprimento_cm && (
                            <div className="text-[10px] bg-slate-800/50 p-1 sm:p-2 rounded text-center min-w-0 overflow-hidden">
                                <span className="block text-slate-400 font-medium truncate">Prof.</span>
                                <span className="font-bold text-white block truncate">
                                    {movel.comprimento_cm}cm
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Price + Action */}
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-800">
                    <span className="font-extrabold text-base sm:text-lg text-white truncate max-w-[70%]">
                        {formatCurrency(movel.preco)}
                    </span>
                    <button
                        onClick={() => onOpen(movel)}
                        className="bg-primary/10 hover:bg-primary text-primary hover:text-white p-2 rounded-lg transition-colors shrink-0"
                    >
                        <span className="material-symbols-outlined">open_in_new</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Product List Item Component (Technical View)
// ============================================
function ProductListItem({
    movel,
    onOpen,
}: {
    movel: Movel;
    onOpen: (m: Movel) => void;
}) {
    const placeholderImg = "/placeholder-furniture.jpg";
    const imgUrl = movel.imagem_url || placeholderImg;

    return (
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-3 hover:ring-2 hover:ring-primary/50 transition-all group">
            {/* Thumbnail */}
            <div
                className="w-16 h-16 bg-slate-800 rounded-lg bg-cover bg-center shrink-0 border border-slate-700"
                style={{ backgroundImage: `url(${imgUrl})` }}
            />

            {/* Info */}
            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-6 items-center">
                <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{movel.modelo}</p>
                    <p className="text-xs text-slate-500 truncate">
                        {movel.categoria}
                        {movel.variante && ` · ${movel.variante}`}
                        {(movel.fornecedor as unknown as { nome: string })?.nome && ` · ${(movel.fornecedor as unknown as { nome: string }).nome}`}
                    </p>
                </div>

                {/* Dimensions */}
                <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
                    {movel.altura_cm && <span className="bg-slate-800 px-1.5 py-0.5 rounded">A: {movel.altura_cm}</span>}
                    {movel.largura_cm && <span className="bg-slate-800 px-1.5 py-0.5 rounded">L: {movel.largura_cm}</span>}
                    {movel.comprimento_cm && <span className="bg-slate-800 px-1.5 py-0.5 rounded">P: {movel.comprimento_cm}</span>}
                </div>

                {/* Material */}
                <div className="hidden sm:block text-xs text-slate-500 truncate max-w-[120px]">
                    {movel.material || movel.tecido || "—"}
                </div>

                {/* Price */}
                <span className="font-extrabold text-base text-white shrink-0">{formatCurrency(movel.preco)}</span>
            </div>

            {/* Action */}
            <button
                onClick={() => onOpen(movel)}
                className="bg-primary/10 hover:bg-primary text-primary hover:text-white p-2 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
                <span className="material-symbols-outlined">open_in_new</span>
            </button>
        </div>
    );
}

// ============================================
// Cart Sidebar Component
// ============================================
function CartSidebar({
    cart,
    onClose,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    isSubmitting
}: {
    cart: { movel: Movel; quantidade: number }[];
    onClose: () => void;
    onUpdateQuantity: (movelId: number, delta: number) => void;
    onRemoveItem: (movelId: number) => void;
    onCheckout: (clienteNome: string, observacoes: string) => void;
    isSubmitting: boolean;
}) {
    const [clienteNome, setClienteNome] = useState("");
    const [observacoes, setObservacoes] = useState("");
    
    const total = cart.reduce((sum, item) => sum + item.movel.preco * item.quantidade, 0);

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex justify-end animate-fade-in" onClick={onClose}>
            <div 
                className="w-full max-w-md bg-slate-900 h-full flex flex-col border-l border-slate-800 shadow-2xl animate-slide-left"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900 z-10">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <span className="material-symbols-outlined text-primary">shopping_cart</span>
                        Meu Pedido
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
                            <span className="material-symbols-outlined text-5xl mb-4 opacity-50">remove_shopping_cart</span>
                            <p>Seu pedido está vazio.</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.movel.id} className="flex gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                <div 
                                    className="w-20 h-20 bg-slate-800 rounded-lg bg-cover bg-center shrink-0" 
                                    style={{ backgroundImage: `url(${item.movel.imagem_url || '/placeholder-furniture.jpg'})` }} 
                                />
                                <div className="flex-1 min-w-0 flex flex-col">
                                    <p className="text-sm font-bold text-white truncate">{item.movel.modelo}</p>
                                    <p className="text-xs text-slate-400 truncate mb-1">{item.movel.variante || item.movel.categoria}</p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <p className="text-sm font-bold text-primary">{formatCurrency(item.movel.preco)}</p>
                                        <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1">
                                            <button 
                                                onClick={() => item.quantidade === 1 ? onRemoveItem(item.movel.id) : onUpdateQuantity(item.movel.id, -1)}
                                                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-sm">{item.quantidade === 1 ? 'delete' : 'remove'}</span>
                                            </button>
                                            <span className="text-xs font-bold w-4 text-center text-white">{item.quantidade}</span>
                                            <button 
                                                onClick={() => onUpdateQuantity(item.movel.id, 1)}
                                                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-6 border-t border-slate-800 bg-slate-900 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Nome do Cliente (Opcional)</label>
                            <input 
                                type="text"
                                value={clienteNome}
                                onChange={e => setClienteNome(e.target.value)}
                                placeholder="Ex: Cliente Balcão..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Observações do Pedido</label>
                            <textarea 
                                value={observacoes}
                                onChange={e => setObservacoes(e.target.value)}
                                placeholder="Ex: Entrega na parte da tarde, etc..."
                                rows={2}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:text-slate-600"
                            />
                        </div>

                        <div className="flex justify-between items-center mt-2">
                            <span className="text-slate-400">Total</span>
                            <span className="text-2xl font-black text-white">{formatCurrency(total)}</span>
                        </div>
                        <button 
                            onClick={() => onCheckout(clienteNome, observacoes)}
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isSubmitting ? (
                                <span className="material-symbols-outlined animate-spin-slow">sync</span>
                            ) : (
                                <span className="material-symbols-outlined">send</span>
                            )}
                            Gerar Pedido e Link
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// UI Components: Toast and Confirm Modal
// ============================================
function Toast({ 
    message, 
    type = "success", 
    onClose 
}: { 
    message: string; 
    type?: "success" | "error" | "info"; 
    onClose: () => void; 
}) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: "check_circle",
        error: "error",
        info: "info"
    };

    const colors = {
        success: "bg-emerald-500/10 border-emerald-500/50 text-emerald-400",
        error: "bg-red-500/10 border-red-500/50 text-red-400",
        info: "bg-primary/10 border-primary/50 text-primary"
    };

    return (
        <div className={cn(
            "fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-up",
            colors[type]
        )}>
            <span className="material-symbols-outlined">{icons[type]}</span>
            <span className="text-sm font-bold">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-70 cursor-pointer">
                <span className="material-symbols-outlined text-sm">close</span>
            </button>
        </div>
    );
}

function ConfirmModal({
    title,
    message,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    onConfirm,
    onCancel,
    type = "danger",
    icon
}: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: "danger" | "info" | "success";
    icon?: string;
}) {
    const isDanger = type === "danger";
    const isSuccess = type === "success";
    
    // Default icons
    const renderIcon = icon || (isDanger ? "delete_forever" : (isSuccess ? "check_circle" : "info"));

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={onCancel}>
            <div 
                className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <div className={cn(
                    "w-12 h-12 rounded-full mb-4 flex items-center justify-center",
                    isDanger ? "bg-red-500/20 text-red-500" : (isSuccess ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/20 text-primary")
                )}>
                    <span className="material-symbols-outlined text-2xl">
                        {renderIcon}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button 
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer"
                    >
                        {cancelLabel}
                    </button>
                    <button 
                        onClick={onConfirm}
                        className={cn(
                            "flex-1 px-4 py-2.5 rounded-lg text-white font-bold text-sm transition-all cursor-pointer",
                            isDanger ? "bg-red-600 hover:bg-red-700" : (isSuccess ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary hover:bg-primary/90")
                        )}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Product Detail Modal
// ============================================
function ProductModal({
    movel,
    onClose,
    user,
    onUpdate,
    showToast,
    confirmAction,
    onAddToCart,
}: {
    movel: Movel;
    onClose: () => void;
    user: Profile | null;
    onUpdate: (updatedMovel: Movel) => void;
    showToast: (msg: string, type?: "success" | "error") => void;
    confirmAction: (cfg: { title: string; message: string; onConfirm: () => void; type?: "danger"|"info"|"success"; icon?: string; }) => void;
    onAddToCart: (movel: Movel, qty: number) => void;
}) {
    const placeholderImg = "/placeholder-furniture.jpg";
    const imgUrl = movel.imagem_url || placeholderImg;
    const [isUploading, setIsUploading] = useState(false);
    const [qty, setQty] = useState(1);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("movel_id", movel.id.toString());

            const res = await fetch("/api/moveis/upload-image", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success && data.imagem_url) {
                onUpdate({ ...movel, imagem_url: data.imagem_url });
                showToast("Imagem atualizada com sucesso!", "success");
            } else {
                showToast(data.error || "Erro ao atualizar a imagem", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Erro interno ao enviar a imagem", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = async () => {
        confirmAction({
            title: "Remover Imagem",
            message: "Tem certeza que deseja remover permanentemente a imagem deste móvel?",
            onConfirm: async () => {
                setIsUploading(true);
                try {
                    const res = await fetch(`/api/moveis/upload-image?movel_id=${movel.id}`, {
                        method: "DELETE",
                    });
                    const data = await res.json();
                    if (data.success) {
                        onUpdate({ ...movel, imagem_url: undefined });
                        showToast("Imagem removida com sucesso!", "success");
                    } else {
                        showToast(data.error || "Erro ao remover a imagem", "error");
                    }
                } catch (error) {
                    console.error(error);
                    showToast("Erro interno ao remover a imagem", "error");
                } finally {
                    setIsUploading(false);
                }
            }
        });
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 w-full max-w-6xl md:max-h-[90vh] md:rounded-2xl shadow-2xl overflow-hidden relative flex flex-col lg:flex-row animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white z-50 bg-slate-900/50 backdrop-blur-md rounded-full p-1 transition-colors cursor-pointer"
                >
                    <span className="material-symbols-outlined text-3xl">close</span>
                </button>

                {/* Image */}
                <div className="lg:w-1/2 h-72 lg:h-auto bg-slate-800 relative group">
                    <div
                        className="w-full h-full bg-cover bg-center min-h-[300px]"
                        style={{
                            backgroundImage: `url(${imgUrl})`,
                            backgroundColor: "#1e293b",
                        }}
                    />
                    {movel.fornecedor && (
                        <div className="absolute bottom-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase z-10">
                            {(movel.fornecedor as unknown as { nome: string }).nome}
                        </div>
                    )}

                    {user?.perfil === "admin" && (
                        <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                            <label className="bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:bg-slate-800 hover:border-primary transition-all text-white p-3 rounded-full shadow-xl flex items-center justify-center cursor-pointer group/upload" title="Alterar Imagem">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                                {isUploading ? (
                                    <span className="material-symbols-outlined text-primary animate-spin-slow">sync</span>
                                ) : (
                                    <span className="material-symbols-outlined text-white group-hover/upload:text-primary transition-colors">edit_square</span>
                                )}
                            </label>
                            {movel.imagem_url && (
                                <button
                                    onClick={handleRemoveImage}
                                    disabled={isUploading}
                                    className="bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:bg-red-500/20 hover:border-red-500 transition-all text-white p-3 rounded-full shadow-xl flex items-center justify-center cursor-pointer group/remove"
                                    title="Remover Imagem"
                                >
                                    <span className="material-symbols-outlined text-white group-hover/remove:text-red-500 transition-colors">delete</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="lg:w-1/2 p-6 lg:p-10 flex flex-col overflow-y-auto">
                    <div className="mb-6">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">
                            {movel.categoria}
                        </span>
                        <h2 className="text-3xl font-extrabold mt-2 mb-1 text-white">
                            {movel.modelo}
                        </h2>
                        {movel.variante && (
                            <p className="text-slate-400 text-sm mb-3">{movel.variante}</p>
                        )}
                        <span className="text-3xl font-black text-primary">
                            {formatCurrency(movel.preco)}
                        </span>
                    </div>

                    {/* Specs + Dimensions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Especificações Técnicas
                            </h4>
                            <div className="space-y-2">
                                {movel.material && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Material:</span>
                                        <span className="font-semibold text-white">
                                            {movel.material}
                                        </span>
                                    </div>
                                )}
                                {movel.tecido && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Tecido:</span>
                                        <span className="font-semibold text-white">
                                            {movel.tecido}
                                        </span>
                                    </div>
                                )}
                                {movel.tipo && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Tipo:</span>
                                        <span className="font-semibold text-white">
                                            {movel.tipo}
                                        </span>
                                    </div>
                                )}
                                {movel.condicao_pagamento && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Pagamento:</span>
                                        <span className="font-semibold text-white">
                                            {movel.condicao_pagamento}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {(movel.altura_cm ||
                            movel.largura_cm ||
                            movel.comprimento_cm) && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Dimensões (cm)
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {movel.altura_cm && (
                                            <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                                                <span className="block text-[10px] text-slate-400">
                                                    Alt.
                                                </span>
                                                <span className="text-sm font-bold text-white">
                                                    {movel.altura_cm}
                                                </span>
                                            </div>
                                        )}
                                        {movel.largura_cm && (
                                            <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                                                <span className="block text-[10px] text-slate-400">
                                                    Larg.
                                                </span>
                                                <span className="text-sm font-bold text-white">
                                                    {movel.largura_cm}
                                                </span>
                                            </div>
                                        )}
                                        {movel.comprimento_cm && (
                                            <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                                                <span className="block text-[10px] text-slate-400">
                                                    Prof.
                                                </span>
                                                <span className="text-sm font-bold text-white">
                                                    {movel.comprimento_cm}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* Fornecedor info */}
                    {movel.fornecedor && (
                        <div className="mb-8 p-4 bg-slate-800/30 rounded-xl">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Fornecedor
                            </h4>
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">factory</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">
                                        {
                                            (movel.fornecedor as unknown as { nome: string })
                                                .nome
                                        }
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Cód:{" "}
                                        {
                                            (
                                                movel.fornecedor as unknown as {
                                                    cod_fornecedor: string;
                                                }
                                            ).cod_fornecedor
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="mb-6 mt-4 sm:mt-0 bg-slate-800/50 p-4 rounded-xl flex items-center justify-between border border-slate-700/50">
                        <span className="text-sm font-bold text-slate-300">Quantidade</span>
                        <div className="flex items-center gap-4 bg-slate-900 rounded-lg p-1.5 border border-slate-700">
                            <button 
                                onClick={() => setQty(Math.max(1, qty - 1))}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span className="text-lg font-bold w-8 text-center text-white">{qty}</span>
                            <button 
                                onClick={() => setQty(qty + 1)}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex gap-3">
                        <button 
                            onClick={() => {
                                onAddToCart(movel, qty);
                                showToast(`${qty} ${qty === 1 ? 'móvel adicionado' : 'móveis adicionados'} ao pedido!`, "success");
                                onClose();
                            }}
                            className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined">shopping_cart</span>
                            Adicionar ao Pedido
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 border border-slate-700 hover:bg-slate-800 rounded-xl transition-all text-slate-400 font-bold cursor-pointer"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Filter Sidebar Component
// ============================================
function FilterSidebar({
    filters,
    onFilterChange,
    filterOptions,
    onReset,
    className,
}: {
    filters: FilterState;
    onFilterChange: (key: string, value: string) => void;
    filterOptions: { categorias: string[]; tecidos: string[] };
    onReset: () => void;
    className?: string;
}) {
    return (
        <div className={cn("space-y-6", className)}>
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">filter_list</span>
                    Filtros
                </h2>
                
                {/* Image Toggle */}
                <button
                    onClick={() => onFilterChange("apenas_com_imagem", filters.apenas_com_imagem ? "" : "true")}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border cursor-pointer",
                        filters.apenas_com_imagem 
                            ? "bg-primary/20 border-primary text-primary" 
                            : "bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-500"
                    )}
                    title="Mostrar apenas itens com foto"
                >
                    <span className="material-symbols-outlined text-base">image</span>
                    FOTOS
                </button>
            </div>

            {/* Text search */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Busca Geral
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={filters.busca}
                        onChange={(e) => onFilterChange("busca", e.target.value)}
                        placeholder="Nome ou marca..."
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-2 pl-3 pr-10 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white placeholder:text-slate-600"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-2 text-slate-500 text-xl">
                        search
                    </span>
                </div>
            </div>

            {/* Category */}
            {filterOptions.categorias.length > 0 && (
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Categoria
                    </label>
                    <select
                        value={filters.categoria}
                        onChange={(e) => onFilterChange("categoria", e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer text-white"
                    >
                        <option value="">Todas as Categorias</option>
                        {filterOptions.categorias.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Fabric */}
            {filterOptions.tecidos.length > 0 && (
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Tecido / Acabamento
                    </label>
                    <select
                        value={filters.tecido}
                        onChange={(e) => onFilterChange("tecido", e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer text-white"
                    >
                        <option value="">Todos os Tecidos</option>
                        {filterOptions.tecidos.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Dimensions */}
            <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase -mb-2">
                    Medidas Máximas (cm)
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                        <span className="text-[10px] text-slate-400">Altura Máx.</span>
                        <input
                            type="number"
                            value={filters.altura_max}
                            onChange={(e) => onFilterChange("altura_max", e.target.value)}
                            placeholder="0 cm"
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-1.5 px-3 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-400">Largura</span>
                        <input
                            type="number"
                            value={filters.largura_max}
                            onChange={(e) => onFilterChange("largura_max", e.target.value)}
                            placeholder="0 cm"
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-1.5 px-3 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-400">Profund.</span>
                        <input
                            type="number"
                            value={filters.comprimento_max}
                            onChange={(e) =>
                                onFilterChange("comprimento_max", e.target.value)
                            }
                            placeholder="0 cm"
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-1.5 px-3 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Reset */}
            <button
                onClick={onReset}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
            >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Limpar Filtros
            </button>
        </div>
    );
}

// ============================================
// Types
// ============================================
interface FilterState {
    busca: string;
    categoria: string;
    tecido: string;
    altura_max: string;
    largura_max: string;
    comprimento_max: string;
    apenas_com_imagem: boolean;
}

const INITIAL_FILTERS: FilterState = {
    busca: "",
    categoria: "",
    tecido: "",
    altura_max: "",
    largura_max: "",
    comprimento_max: "",
    apenas_com_imagem: false,
};

// ============================================
// Main Search Page
// ============================================
export default function SearchPage() {
    const router = useRouter();
    const [user, setUser] = useState<Profile | null>(null);
    const [moveis, setMoveis] = useState<Movel[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
    const [filterOptions, setFilterOptions] = useState<{
        categorias: string[];
        tecidos: string[];
        modelos: string[];
    }>({ categorias: [], tecidos: [], modelos: [] });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedMovel, setSelectedMovel] = useState<Movel | null>(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    
    // Cart State
    const [cart, setCart] = useState<{ movel: Movel; quantidade: number }[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

    // Feedback states
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void; type?: "danger"|"info"|"success"; icon?: string; } | null>(null);

    const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
        setToast({ message, type });
    };

    const confirmAction = (config: { title: string; message: string; onConfirm: () => void; type?: "danger"|"info"|"success"; icon?: string; }) => {
        setConfirmModal(config);
    };

    // Fetch user
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.profile);
                }
            } catch {
                /* middleware handles */
            }
        })();
    }, []);

    // Fetch filter options
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/moveis/filters");
                if (res.ok) {
                    const data = await res.json();
                    setFilterOptions(data);
                }
            } catch {
                /* silent */
            }
        })();
    }, []);

    // Fetch moveis
    const fetchMoveis = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: "12",
            });
            if (filters.busca) params.set("busca", filters.busca);
            if (filters.categoria) params.set("categoria", filters.categoria);
            if (filters.tecido) params.set("tecido", filters.tecido);
            if (filters.altura_max) params.set("altura_max", filters.altura_max);
            if (filters.largura_max) params.set("largura_max", filters.largura_max);
            if (filters.comprimento_max)
                params.set("comprimento_max", filters.comprimento_max);
            if (filters.apenas_com_imagem)
                params.set("apenas_com_imagem", "true");

            const res = await fetch(`/api/moveis?${params}`);
            if (res.ok) {
                const data = await res.json();
                setMoveis(data.data);
                setTotalPages(data.totalPages);
                setTotalCount(data.count);
            }
        } catch (err) {
            console.error("Failed to fetch moveis:", err);
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        fetchMoveis();
    }, [fetchMoveis]);

    // Debounce text search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [filters.busca]);

    const handleFilterChange = (key: string, value: string) => {
        if (key === "apenas_com_imagem") {
            setFilters((prev) => ({ ...prev, apenas_com_imagem: value === "true" }));
        } else {
            setFilters((prev) => ({ ...prev, [key]: value }));
        }
        if (key !== "busca") setPage(1);
    };

    const handleReset = () => {
        setFilters(INITIAL_FILTERS);
        setPage(1);
    };

    // Cart Handlers
    const handleAddToCart = (movel: Movel, qty: number = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.movel.id === movel.id);
            if (existing) {
                return prev.map(item => item.movel.id === movel.id ? { ...item, quantidade: item.quantidade + qty } : item);
            }
            return [...prev, { movel, quantidade: qty }];
        });
    };

    const handleUpdateQuantity = (movelId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.movel.id === movelId) {
                const newQuantity = Math.max(1, item.quantidade + delta);
                return { ...item, quantidade: newQuantity };
            }
            return item;
        }));
    };

    const handleRemoveFromCart = (movelId: number) => {
        setCart(prev => prev.filter(item => item.movel.id !== movelId));
    };

    const handleCheckout = async (clienteNome: string, observacoes: string) => {
        if (cart.length === 0) return;
        setIsSubmittingOrder(true);
        try {
            const body = {
                cliente_nome: clienteNome.trim() || "Cliente Balcão",
                observacoes: observacoes.trim(),
                itens: cart.map(c => ({ movel_id: c.movel.id, quantidade: c.quantidade }))
            };
            const response = await fetch("/api/orcamentos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (data.success) {
                showToast("Pedido gerado com sucesso!", "success");
                setCart([]);
                setIsCartOpen(false);
                
                // Show order link in confirm modal
                confirmAction({
                    title: "Pedido Gerado com Sucesso!",
                    message: `O pedido ${data.orcamento.numero} foi gerado. Clique no botão abaixo para acessar a página pública do pedido, ou clique em Cancelar para fechar.`,
                    onConfirm: () => {
                        window.open(`/quote/${data.orcamento.numero}`, '_blank');
                    },
                    type: "info",
                    icon: "check_circle"
                });
            } else {
                showToast(data.error || "Erro ao gerar pedido", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Erro de comunicação", "error");
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
    };

    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden w-full relative">
            {/* Header */}
            <header className="border-b border-slate-800 bg-bg-dark/50 sticky top-0 z-40 backdrop-blur-md">
                <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-white text-2xl">
                                chair
                            </span>
                        </div>
                            <span className="text-2xl font-extrabold tracking-tight uppercase">
                                Asisto <span className="text-primary">Fab</span>
                            </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <a
                                className="text-primary border-b-2 border-primary pb-1 cursor-pointer"
                                href="/search"
                            >
                                Pesquisa
                            </a>
                            <a
                                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                                href="/orders"
                            >
                                Meus Pedidos
                            </a>
                            {user?.perfil === "admin" && (
                                <a
                                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                                    href="/admin"
                                >
                                    Admin
                                </a>
                            )}
                        </nav>
                        <div className="h-8 w-px bg-slate-800 hidden md:block" />
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setIsCartOpen(true)}
                                className="relative w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="Meu Pedido"
                            >
                                <span className="material-symbols-outlined">shopping_cart</span>
                                {cart.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">
                                        {cart.length}
                                    </span>
                                )}
                            </button>
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-semibold text-white">
                                    {user?.nome || "..."}
                                </p>
                                <p className="text-[10px] text-slate-500 capitalize">
                                    {user?.perfil || ""}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 hover:bg-primary/30 transition-colors cursor-pointer"
                                title="Sair"
                            >
                                <span className="material-symbols-outlined">person</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
                {/* Sidebar Filters (Desktop) */}
                <aside className="w-72 border-r border-slate-800 p-6 hidden lg:block overflow-y-auto max-h-[calc(100vh-64px)] sticky top-16 cursor-pointer">
                    <FilterSidebar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        filterOptions={filterOptions}
                        onReset={handleReset}
                    />
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 p-4 sm:p-6 w-full max-w-full">
                    {/* Title + View Toggle */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 w-full">
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                                Catálogo de Vendas
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500">
                                {loading
                                    ? "Carregando..."
                                    : `Exibindo ${totalCount} produtos disponíveis`}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 shrink-0">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "p-2 rounded-md transition-all cursor-pointer",
                                    viewMode === "grid" ? "bg-primary text-white shadow-md" : "text-slate-400 hover:text-white"
                                )}
                                title="Visualização em grade"
                            >
                                <span className="material-symbols-outlined text-lg">grid_view</span>
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "p-2 rounded-md transition-all cursor-pointer",
                                    viewMode === "list" ? "bg-primary text-white shadow-md" : "text-slate-400 hover:text-white"
                                )}
                                title="Visualização em lista"
                            >
                                <span className="material-symbols-outlined text-lg">view_list</span>
                            </button>
                        </div>
                    </div>

                    {/* Product Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <span className="material-symbols-outlined text-4xl animate-spin-slow mb-3">
                                sync
                            </span>
                            <p className="text-sm">Carregando catálogo...</p>
                        </div>
                    ) : moveis.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 w-full overflow-hidden">
                            <span className="material-symbols-outlined text-5xl mb-3">
                                search_off
                            </span>
                            <p className="text-lg font-bold mb-1 truncate px-4">
                                Nenhum produto encontrado
                            </p>
                            <p className="text-sm text-center px-4">
                                Tente ajustar os filtros de busca
                            </p>
                            <button
                                onClick={handleReset}
                                className="mt-4 px-6 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    ) : (
                        <>
                            {viewMode === "grid" ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
                                    {moveis.map((movel) => (
                                        <ProductCard
                                            key={movel.id}
                                            movel={movel}
                                            onOpen={setSelectedMovel}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 w-full">
                                    {moveis.map((movel) => (
                                        <ProductListItem
                                            key={movel.id}
                                            movel={movel}
                                            onOpen={setSelectedMovel}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page <= 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:text-primary hover:border-primary transition-all disabled:opacity-30"
                                    >
                                        <span className="material-symbols-outlined">
                                            chevron_left
                                        </span>
                                    </button>

                                    {Array.from(
                                        { length: Math.min(totalPages, 7) },
                                        (_, i) => {
                                            let pageNum: number;
                                            if (totalPages <= 7) {
                                                pageNum = i + 1;
                                            } else if (page <= 4) {
                                                pageNum = i + 1;
                                            } else if (page >= totalPages - 3) {
                                                pageNum = totalPages - 6 + i;
                                            } else {
                                                pageNum = page - 3 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    className={cn(
                                                        "w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all",
                                                        page === pageNum
                                                            ? "bg-primary text-white"
                                                            : "border border-slate-800 text-slate-500 hover:text-primary hover:border-primary"
                                                    )}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        }
                                    )}

                                    <button
                                        onClick={() =>
                                            setPage((p) => Math.min(totalPages, p + 1))
                                        }
                                        disabled={page >= totalPages}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:text-primary hover:border-primary transition-all disabled:opacity-30"
                                    >
                                        <span className="material-symbols-outlined">
                                            chevron_right
                                        </span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Mobile Filter Overlay */}
            {mobileFiltersOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden animate-fade-in"
                    onClick={() => setMobileFiltersOpen(false)}
                >
                    <div
                        className="absolute right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Filtros</h2>
                            <button
                                onClick={() => setMobileFiltersOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            filterOptions={filterOptions}
                            onReset={() => {
                                handleReset();
                                setMobileFiltersOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* FAB for Mobile Filters */}
            <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 transition-transform"
            >
                <span className="material-symbols-outlined">tune</span>
            </button>

            {/* Product Detail Modal */}
            {selectedMovel && (
                <ProductModal
                    movel={selectedMovel}
                    onClose={() => setSelectedMovel(null)}
                    user={user}
                    onUpdate={(updatedMovel) => {
                        setSelectedMovel(updatedMovel);
                        setMoveis((prev) =>
                            prev.map((m) =>
                                m.id === updatedMovel.id ? updatedMovel : m
                            )
                        );
                    }}
                    showToast={showToast}
                    confirmAction={confirmAction}
                    onAddToCart={handleAddToCart}
                />
            )}

            {/* Cart Sidebar */}
            {isCartOpen && (
                <CartSidebar 
                    cart={cart}
                    onClose={() => setIsCartOpen(false)}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveFromCart}
                    onCheckout={handleCheckout}
                    isSubmitting={isSubmittingOrder}
                />
            )}

            {/* Feedback UI */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
            
            {confirmModal && (
                <ConfirmModal
                    title={confirmModal.title}
                    message={confirmModal.message}
                    type={confirmModal.type}
                    icon={confirmModal.icon}
                    onConfirm={() => {
                        confirmModal.onConfirm();
                        setConfirmModal(null);
                    }}
                    onCancel={() => setConfirmModal(null)}
                />
            )}
        </div>
    );
}
