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
// Product Detail Modal
// ============================================
function ProductModal({
    movel,
    onClose,
    user,
    onUpdate,
}: {
    movel: Movel;
    onClose: () => void;
    user: Profile | null;
    onUpdate: (updatedMovel: Movel) => void;
}) {
    const placeholderImg = "/placeholder-furniture.jpg";
    const imgUrl = movel.imagem_url || placeholderImg;
    const [isUploading, setIsUploading] = useState(false);

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
                alert("Imagem atualizada com sucesso!");
            } else {
                alert(data.error || "Erro ao atualizar a imagem");
            }
        } catch (error) {
            console.error(error);
            alert("Erro interno ao enviar a imagem");
        } finally {
            setIsUploading(false);
        }
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
                        <label className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:bg-slate-800 hover:border-primary transition-all text-white p-3 rounded-full shadow-xl flex items-center justify-center cursor-pointer z-20 group/upload" title="Alterar Imagem">
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

                    {/* Actions */}
                    <div className="mt-auto flex gap-3">
                        <button className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all cursor-pointer">
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
                        <span className="text-xl font-extrabold tracking-tight text-white uppercase">
                            Móvel<span className="text-primary">Quest</span>
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
                        <div className="min-w-0 w-full">
                            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                                Catálogo de Vendas
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500">
                                {loading
                                    ? "Carregando..."
                                    : `Exibindo ${totalCount} produtos disponíveis`}
                            </p>
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
                                {moveis.map((movel) => (
                                    <ProductCard
                                        key={movel.id}
                                        movel={movel}
                                        onOpen={setSelectedMovel}
                                    />
                                ))}
                            </div>

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
                />
            )}
        </div>
    );
}
