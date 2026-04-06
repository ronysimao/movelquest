"use client";

import { useState, useEffect, useCallback } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Movel, Fornecedor } from "@/types";

// ============================================
// Types
// ============================================
interface ProductForm {
    id?: number;
    categoria: string;
    modelo: string;
    variante: string;
    tipo: string;
    comprimento_cm: string;
    largura_cm: string;
    altura_cm: string;
    material: string;
    tecido: string;
    preco: string;
    condicao_pagamento: string;
    fornecedor_id: string;
    fornecedor_nome: string;
    ativo: boolean;
}

const EMPTY_FORM: ProductForm = {
    categoria: "",
    modelo: "",
    variante: "",
    tipo: "",
    comprimento_cm: "",
    largura_cm: "",
    altura_cm: "",
    material: "",
    tecido: "",
    preco: "",
    condicao_pagamento: "",
    fornecedor_id: "",
    fornecedor_nome: "",
    ativo: true,
};

interface MarkupConfig {
    global: number; // porcentagem global
    perProduct: Record<number, number>; // porcentagem por produto (id -> %)
}

// ============================================
// Toast Component
// ============================================
function Toast({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    const styles = {
        success: "bg-emerald-500/10 border-emerald-500/50 text-emerald-400",
        error: "bg-red-500/10 border-red-500/50 text-red-400",
        info: "bg-primary/10 border-primary/50 text-primary",
    };
    const icons = { success: "check_circle", error: "error", info: "info" };
    return (
        <div className={cn("fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-up", styles[type])}>
            <span className="material-symbols-outlined">{icons[type]}</span>
            <span className="text-sm font-bold">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-70 cursor-pointer"><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
    );
}

// ============================================
// Product Form Modal
// ============================================
function ProductFormModal({
    form,
    onChange,
    onSubmit,
    onClose,
    onImageUpload,
    isUploading,
    currentImageUrl,
    fornecedores,
    categorias,
    loading,
    isEditing,
}: {
    form: ProductForm;
    onChange: (field: keyof ProductForm, value: string | boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    onImageUpload: (file: File) => void;
    isUploading: boolean;
    currentImageUrl?: string;
    fornecedores: Fornecedor[];
    categorias: string[];
    loading: boolean;
    isEditing: boolean;
}) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImagePreview(URL.createObjectURL(file));
        onImageUpload(file);
    };

    const previewSrc = imagePreview || currentImageUrl;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-start justify-center p-4 overflow-y-auto animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-slide-up border border-slate-800" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">{isEditing ? "edit_note" : "add_circle"}</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{isEditing ? "Editar Produto" : "Novo Produto"}</h2>
                            <p className="text-xs text-slate-400">{isEditing ? "Atualize os campos abaixo" : "Preencha todos os campos obrigatórios"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer"><span className="material-symbols-outlined text-2xl">close</span></button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Image Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-full h-48 bg-slate-800 rounded-xl overflow-hidden border-2 border-dashed border-slate-700 hover:border-primary/50 transition-colors group mb-2">
                            {previewSrc ? (
                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${previewSrc})` }} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-2">add_photo_alternate</span>
                                    <p className="text-sm font-medium">Clique para adicionar foto</p>
                                    <p className="text-xs text-slate-600 mt-1">JPG, PNG, WEBP · Max 5MB</p>
                                </div>
                            )}
                            <label className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-950/60 flex items-center justify-center transition-opacity cursor-pointer">
                                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                                <span className="material-symbols-outlined text-white text-3xl">{isUploading ? "sync" : "edit"}</span>
                            </label>
                        </div>
                    </div>

                    {/* Info Principal */}
                    <fieldset className="space-y-4">
                        <legend className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary">info</span>
                            Informações Básicas
                        </legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Modelo / Nome <span className="text-red-400">*</span></label>
                                <input type="text" value={form.modelo} onChange={e => onChange("modelo", e.target.value)} required placeholder="Ex: Poltrona Lyon" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Categoria <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <input type="text" list="categorias-list" value={form.categoria} onChange={e => onChange("categoria", e.target.value)} required placeholder="Ex: Sofás, Mesas, Cadeiras" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                                    <datalist id="categorias-list">
                                        {categorias.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Variante</label>
                                <input type="text" value={form.variante} onChange={e => onChange("variante", e.target.value)} placeholder="Ex: 2 Lugares, Cinza" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Tipo</label>
                                <input type="text" value={form.tipo} onChange={e => onChange("tipo", e.target.value)} placeholder="Ex: Decorativo, Funcional" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                            </div>
                        </div>
                    </fieldset>

                    {/* Dimensões */}
                    <fieldset className="space-y-4">
                        <legend className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary">straighten</span>
                            Dimensões (cm)
                        </legend>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Altura</label>
                                <input type="number" step="0.1" min="0" value={form.altura_cm} onChange={e => onChange("altura_cm", e.target.value)} placeholder="0" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Largura</label>
                                <input type="number" step="0.1" min="0" value={form.largura_cm} onChange={e => onChange("largura_cm", e.target.value)} placeholder="0" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Profundidade</label>
                                <input type="number" step="0.1" min="0" value={form.comprimento_cm} onChange={e => onChange("comprimento_cm", e.target.value)} placeholder="0" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                            </div>
                        </div>
                    </fieldset>

                    {/* Materiais */}
                    <fieldset className="space-y-4">
                        <legend className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary">texture</span>
                            Materiais e Acabamentos
                        </legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Material</label>
                                <input type="text" value={form.material} onChange={e => onChange("material", e.target.value)} placeholder="Ex: MDF, Madeira Maciça" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Tecido / Revestimento</label>
                                <input type="text" value={form.tecido} onChange={e => onChange("tecido", e.target.value)} placeholder="Ex: Linho, Veludo, Couro" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                            </div>
                        </div>
                    </fieldset>

                    {/* Comercial */}
                    <fieldset className="space-y-4">
                        <legend className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary">payments</span>
                            Dados Comerciais
                        </legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Preço Base (R$) <span className="text-red-400">*</span></label>
                                <input type="number" step="0.01" min="0" value={form.preco} onChange={e => onChange("preco", e.target.value)} required placeholder="0,00" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Condição de Pagamento</label>
                                <input type="text" value={form.condicao_pagamento} onChange={e => onChange("condicao_pagamento", e.target.value)} placeholder="Ex: 30/60/90, À Vista" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Fabricante / Fornecedor</label>
                                <select value={form.fornecedor_id} onChange={e => onChange("fornecedor_id", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer">
                                    <option value="">Selecione ou digite abaixo</option>
                                    {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Ou criar novo fabricante</label>
                                <input type="text" value={form.fornecedor_nome} onChange={e => onChange("fornecedor_nome", e.target.value)} placeholder="Nome do novo fabricante" disabled={!!form.fornecedor_id} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-40" />
                            </div>
                        </div>

                        {/* Ativo toggle */}
                        <div className="flex items-center gap-3 pt-2">
                            <button type="button" onClick={() => onChange("ativo", !form.ativo)} className={cn("relative w-12 h-6 rounded-full transition-colors cursor-pointer", form.ativo ? "bg-emerald-500" : "bg-slate-700")}>
                                <div className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-md", form.ativo ? "translate-x-6" : "translate-x-0.5")} />
                            </button>
                            <span className="text-sm text-slate-300 font-medium">Produto {form.ativo ? "Ativo" : "Inativo"}</span>
                        </div>
                    </fieldset>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-800">
                        <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 rounded-xl border border-slate-700 text-slate-400 font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? (
                                <><span className="material-symbols-outlined animate-spin-slow text-lg">sync</span>Salvando...</>
                            ) : (
                                <><span className="material-symbols-outlined text-lg">{isEditing ? "save" : "add"}</span>{isEditing ? "Salvar Alterações" : "Criar Produto"}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ============================================
// Markup Panel
// ============================================
function MarkupPanel({
    markup,
    onChangeGlobal,
    products,
    onChangePerProduct,
}: {
    markup: MarkupConfig;
    onChangeGlobal: (val: number) => void;
    products: Movel[];
    onChangePerProduct: (productId: number, val: number) => void;
}) {
    const [showPerProduct, setShowPerProduct] = useState(false);

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">percent</span>
                Configuração de Markup
            </h3>

            {/* Global Markup */}
            <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Markup Global (%)</label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="0"
                        max="200"
                        step="1"
                        value={markup.global}
                        onChange={e => onChangeGlobal(Number(e.target.value))}
                        className="flex-1 accent-primary cursor-pointer"
                    />
                    <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 min-w-[80px]">
                        <input
                            type="number"
                            value={markup.global}
                            onChange={e => onChangeGlobal(Math.max(0, Number(e.target.value)))}
                            className="w-12 bg-transparent text-primary font-bold text-sm text-right outline-none"
                        />
                        <span className="text-primary font-bold text-sm">%</span>
                    </div>
                </div>
                {markup.global > 0 && (
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-emerald-400">trending_up</span>
                        Produto de R$ 1.000 → Preço de venda: <strong className="text-emerald-400">{formatCurrency(1000 * (1 + markup.global / 100))}</strong>
                    </p>
                )}
            </div>

            {/* Per Product Toggle */}
            <button onClick={() => setShowPerProduct(!showPerProduct)} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer mb-4">
                <span className="material-symbols-outlined text-lg">{showPerProduct ? "expand_less" : "expand_more"}</span>
                Markup por produto ({Object.keys(markup.perProduct).length} personaliz.)
            </button>

            {showPerProduct && products.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {products.slice(0, 50).map(p => {
                        const productMarkup = markup.perProduct[p.id];
                        const effectiveMarkup = productMarkup !== undefined ? productMarkup : markup.global;
                        const hasCustom = productMarkup !== undefined;
                        return (
                            <div key={p.id} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", hasCustom ? "bg-primary/5 border border-primary/20" : "bg-slate-800/30 border border-slate-800")}>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{p.modelo}</p>
                                    <p className="text-xs text-slate-500">{formatCurrency(p.preco)} → <span className="text-emerald-400 font-bold">{formatCurrency(p.preco * (1 + effectiveMarkup / 100))}</span></p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <input
                                        type="number"
                                        value={hasCustom ? productMarkup : ""}
                                        placeholder={`${markup.global}`}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val === "") {
                                                // Remove custom, fallback to global
                                                onChangePerProduct(p.id, -1);
                                            } else {
                                                onChangePerProduct(p.id, Math.max(0, Number(val)));
                                            }
                                        }}
                                        className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-right text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <span className="text-xs text-slate-500">%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


// ============================================
// Main Page
// ============================================
export default function ProdutosPage() {
    const [products, setProducts] = useState<Movel[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
    const [formLoading, setFormLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingImageUrl, setEditingImageUrl] = useState<string | undefined>();

    // Deps
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [categorias, setCategorias] = useState<string[]>([]);

    // Markup
    const [markup, setMarkup] = useState<MarkupConfig>({ global: 0, perProduct: {} });

    const showToast = (message: string, type: "success" | "error" | "info" = "success") => setToast({ message, type });

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), pageSize: "20" });
            if (search) params.set("busca", search);
            const res = await fetch(`/api/moveis?${params}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.data);
                setTotalPages(data.totalPages);
                setTotalCount(data.count);
            }
        } catch (err) {
            console.error("Fetch products error:", err);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // Fetch deps
    useEffect(() => {
        (async () => {
            try {
                const [fRes, catRes] = await Promise.all([
                    fetch("/api/fornecedores"),
                    fetch("/api/moveis/filters"),
                ]);
                if (fRes.ok) {
                    const fd = await fRes.json();
                    setFornecedores(fd.data || []);
                }
                if (catRes.ok) {
                    const cd = await catRes.json();
                    setCategorias(cd.categorias || []);
                }
            } catch { /* silent */ }
        })();
    }, []);

    // Load markup from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("asisto-markup");
            if (saved) setMarkup(JSON.parse(saved));
        } catch { /* silent */ }
    }, []);

    // Save markup to localStorage
    const saveMarkup = useCallback((newMarkup: MarkupConfig) => {
        setMarkup(newMarkup);
        localStorage.setItem("asisto-markup", JSON.stringify(newMarkup));
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setPage(1), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const handleFormChange = (field: keyof ProductForm, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
        // Clear fornecedor_nome if selecting existing
        if (field === "fornecedor_id" && value) {
            setForm(prev => ({ ...prev, fornecedor_nome: "" }));
        }
    };

    const openNewForm = () => {
        setForm(EMPTY_FORM);
        setEditingImageUrl(undefined);
        setShowForm(true);
    };

    const openEditForm = (product: Movel) => {
        setForm({
            id: product.id,
            categoria: product.categoria || "",
            modelo: product.modelo || "",
            variante: product.variante || "",
            tipo: product.tipo || "",
            comprimento_cm: product.comprimento_cm?.toString() || "",
            largura_cm: product.largura_cm?.toString() || "",
            altura_cm: product.altura_cm?.toString() || "",
            material: product.material || "",
            tecido: product.tecido || "",
            preco: product.preco?.toString() || "",
            condicao_pagamento: product.condicao_pagamento || "",
            fornecedor_id: product.fornecedor_id?.toString() || "",
            fornecedor_nome: "",
            ativo: product.ativo,
        });
        setEditingImageUrl(product.imagem_url);
        setShowForm(true);
    };

    const handleImageUpload = async (file: File) => {
        if (!form.id) {
            // For new products, no immediate upload — will do after creation
            showToast("Imagem será enviada após criar o produto", "info");
            return;
        }

        setIsUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("movel_id", form.id.toString());
            const res = await fetch("/api/moveis/upload-image", { method: "POST", body: fd });
            const data = await res.json();
            if (data.success) {
                setEditingImageUrl(data.imagem_url);
                showToast("Imagem atualizada!", "success");
            } else {
                showToast(data.error || "Erro ao enviar imagem", "error");
            }
        } catch {
            showToast("Erro ao enviar imagem", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const isEditing = !!form.id;
            const method = isEditing ? "PUT" : "POST";
            const payload = {
                ...(isEditing && { id: form.id }),
                categoria: form.categoria,
                modelo: form.modelo,
                variante: form.variante || undefined,
                tipo: form.tipo || undefined,
                comprimento_cm: form.comprimento_cm ? parseFloat(form.comprimento_cm) : null,
                largura_cm: form.largura_cm ? parseFloat(form.largura_cm) : null,
                altura_cm: form.altura_cm ? parseFloat(form.altura_cm) : null,
                material: form.material || undefined,
                tecido: form.tecido || undefined,
                preco: parseFloat(form.preco),
                condicao_pagamento: form.condicao_pagamento || undefined,
                fornecedor_id: form.fornecedor_id ? parseInt(form.fornecedor_id) : null,
                fornecedor_nome: form.fornecedor_nome || undefined,
                ativo: form.ativo,
            };

            const res = await fetch("/api/moveis/manage", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                showToast(isEditing ? "Produto atualizado!" : "Produto criado!", "success");
                setShowForm(false);
                fetchProducts();
                // Reload fornecedores in case a new one was created
                const fRes = await fetch("/api/fornecedores");
                if (fRes.ok) {
                    const fd = await fRes.json();
                    setFornecedores(fd.data || []);
                }
            } else {
                showToast(data.error || "Erro ao salvar", "error");
            }
        } catch {
            showToast("Erro ao salvar produto", "error");
        } finally {
            setFormLoading(false);
        }
    };

    const getEffectiveMarkup = (productId: number): number => {
        return markup.perProduct[productId] !== undefined ? markup.perProduct[productId] : markup.global;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gerenciamento de Produtos</h1>
                    <p className="text-sm text-slate-400 mt-1">{totalCount} produtos cadastrados</p>
                </div>
                <button onClick={openNewForm} className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 cursor-pointer">
                    <span className="material-symbols-outlined">add</span>
                    Novo Produto
                </button>
            </div>

            {/* Layout: Products + Markup sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
                {/* Products Table */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
                    {/* Search */}
                    <div className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">inventory_2</span>
                            Catálogo
                        </h3>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, categoria..." className="pl-10 pr-4 py-2 bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary w-64 text-white placeholder:text-slate-600 outline-none" />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 w-12"></th>
                                    <th className="px-6 py-4">Produto</th>
                                    <th className="px-6 py-4 hidden md:table-cell">Categoria</th>
                                    <th className="px-6 py-4 hidden lg:table-cell">Fabricante</th>
                                    <th className="px-6 py-4">Preço Base</th>
                                    {markup.global > 0 && <th className="px-6 py-4 text-emerald-400">P. Venda</th>}
                                    <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {loading ? (
                                    <tr><td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-500">
                                            <span className="material-symbols-outlined text-3xl animate-spin-slow">sync</span>
                                            <p className="text-sm">Carregando produtos...</p>
                                        </div>
                                    </td></tr>
                                ) : products.length === 0 ? (
                                    <tr><td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-500">
                                            <span className="material-symbols-outlined text-4xl">inbox</span>
                                            <p className="text-sm font-medium">Nenhum produto encontrado</p>
                                            <button onClick={openNewForm} className="mt-2 text-primary hover:underline text-sm font-bold cursor-pointer">Criar primeiro produto</button>
                                        </div>
                                    </td></tr>
                                ) : (
                                    products.map(p => {
                                        const effectiveMarkup = getEffectiveMarkup(p.id);
                                        const sellPrice = p.preco * (1 + effectiveMarkup / 100);
                                        return (
                                            <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                                                <td className="px-6 py-3">
                                                    <div className="w-10 h-10 bg-slate-800 rounded-lg bg-cover bg-center border border-slate-700" style={{ backgroundImage: `url(${p.imagem_url || "/placeholder-furniture.jpg"})` }} />
                                                </td>
                                                <td className="px-6 py-3">
                                                    <p className="text-sm font-bold text-white truncate max-w-[200px]">{p.modelo}</p>
                                                    {p.variante && <p className="text-xs text-slate-500 truncate">{p.variante}</p>}
                                                </td>
                                                <td className="px-6 py-3 hidden md:table-cell">
                                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{p.categoria}</span>
                                                </td>
                                                <td className="px-6 py-3 hidden lg:table-cell">
                                                    <span className="text-sm text-slate-400">{(p.fornecedor as unknown as { nome: string })?.nome || "—"}</span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={cn("text-sm font-bold", markup.global > 0 ? "text-slate-500 line-through" : "text-white")}>{formatCurrency(p.preco)}</span>
                                                </td>
                                                {markup.global > 0 && (
                                                    <td className="px-6 py-3">
                                                        <span className="text-sm font-black text-emerald-400">{formatCurrency(sellPrice)}</span>
                                                        <span className="text-[10px] text-slate-500 ml-1">+{effectiveMarkup}%</span>
                                                    </td>
                                                )}
                                                <td className="px-6 py-3 hidden sm:table-cell">
                                                    <span className={cn("text-xs font-bold px-2 py-1 rounded-full", p.ativo ? "bg-emerald-900/30 text-emerald-400" : "bg-red-900/30 text-red-400")}>
                                                        {p.ativo ? "Ativo" : "Inativo"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <button onClick={() => openEditForm(p)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer" title="Editar produto">
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-6 border-t border-slate-800 flex items-center justify-between">
                            <p className="text-xs text-slate-500">Mostrando {products.length} de {totalCount}</p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                                    <button key={i + 1} onClick={() => setPage(i + 1)} className={cn("size-8 rounded-lg font-bold text-sm transition-colors flex items-center justify-center cursor-pointer", page === i + 1 ? "bg-primary text-white" : "hover:bg-slate-800 text-slate-400")}>
                                        {i + 1}
                                    </button>
                                ))}
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Markup Sidebar */}
                <MarkupPanel
                    markup={markup}
                    onChangeGlobal={val => saveMarkup({ ...markup, global: val })}
                    products={products}
                    onChangePerProduct={(id, val) => {
                        const newPerProduct = { ...markup.perProduct };
                        if (val < 0) {
                            delete newPerProduct[id];
                        } else {
                            newPerProduct[id] = val;
                        }
                        saveMarkup({ ...markup, perProduct: newPerProduct });
                    }}
                />
            </div>

            {/* Form Modal */}
            {showForm && (
                <ProductFormModal
                    form={form}
                    onChange={handleFormChange}
                    onSubmit={handleSubmit}
                    onClose={() => setShowForm(false)}
                    onImageUpload={handleImageUpload}
                    isUploading={isUploading}
                    currentImageUrl={editingImageUrl}
                    fornecedores={fornecedores}
                    categorias={categorias}
                    loading={formLoading}
                    isEditing={!!form.id}
                />
            )}

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
