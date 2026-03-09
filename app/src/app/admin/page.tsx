"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import type { Carga, CargaStatus } from "@/types";

// ============================================
// Status Badge Component
// ============================================
function StatusBadge({ status }: { status: CargaStatus }) {
    const config: Record<
        CargaStatus,
        { label: string; bg: string; text: string; icon?: string }
    > = {
        processando: {
            label: "Processando",
            bg: "bg-amber-900/30",
            text: "text-amber-400",
            icon: "sync",
        },
        sucesso: {
            label: "Sucesso",
            bg: "bg-emerald-900/30",
            text: "text-emerald-400",
        },
        falha: {
            label: "Falha",
            bg: "bg-red-900/30",
            text: "text-red-400",
            icon: "error",
        },
    };

    const c = config[status];

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                c.bg,
                c.text
            )}
        >
            {c.icon && (
                <span
                    className={cn(
                        "material-symbols-outlined text-sm",
                        status === "processando" && "animate-spin-slow"
                    )}
                >
                    {c.icon}
                </span>
            )}
            {c.label}
        </span>
    );
}

// ============================================
// Upload Zone Component
// ============================================
function UploadZone({
    onUpload,
    uploading,
}: {
    onUpload: (file: File) => Promise<void>;
    uploading: boolean;
}) {
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) setSelectedFile(file);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleProcess = async () => {
        if (selectedFile) {
            await onUpload(selectedFile);
            // We clear the file only after the upload process completes
            setSelectedFile(null);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
        return `${(bytes / 1_000).toFixed(0)} KB`;
    };

    const getFileIcon = (type: string) => {
        if (type.includes("spreadsheet") || type.includes("excel"))
            return "table_chart";
        if (type.includes("pdf")) return "picture_as_pdf";
        return "description";
    };

    const getFileIconColor = (type: string) => {
        if (type.includes("spreadsheet") || type.includes("excel"))
            return "text-emerald-400";
        if (type.includes("pdf")) return "text-red-400";
        return "text-primary";
    };

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-white">
                Upload de Arquivos
            </h3>

            {/* Drop zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all group cursor-pointer",
                    dragOver
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-slate-700 bg-slate-900/50 hover:border-primary/50",
                    uploading ? "opacity-50 pointer-events-none" : ""
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".xlsx,.xls,.pdf"
                    onChange={handleFileSelect}
                    onClick={(e) => { (e.target as HTMLInputElement).value = "" }}
                    className="hidden"
                />
                <div
                    className={cn(
                        "size-16 rounded-full flex items-center justify-center mb-4 transition-transform",
                        dragOver
                            ? "bg-primary/20 text-primary scale-110"
                            : "bg-primary/10 text-primary group-hover:scale-110"
                    )}
                >
                    <span className="material-symbols-outlined text-3xl">
                        cloud_upload
                    </span>
                </div>
                <h4 className="text-base font-bold text-white">
                    Arraste e solte seus documentos aqui
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                    Suporta arquivos .xlsx e .pdf (Max 50MB)
                </p>
                <button
                    type="button"
                    className="mt-6 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                >
                    Selecionar Arquivos
                </button>
            </div>

            {/* Selected file preview */}
            {selectedFile && (
                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg flex items-center justify-between border border-slate-800 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <span
                            className={cn(
                                "material-symbols-outlined",
                                getFileIconColor(selectedFile.type)
                            )}
                        >
                            {getFileIcon(selectedFile.type)}
                        </span>
                        <div>
                            <p className="text-sm font-bold text-white">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {formatFileSize(selectedFile.size)} • Pronto para processar
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                        }}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            )}

            {/* Process button */}
            {selectedFile && (
                <div className="mt-6 flex justify-end animate-fade-in">
                    <button
                        onClick={handleProcess}
                        disabled={uploading}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {uploading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin-slow text-sm">
                                    sync
                                </span>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">
                                    play_arrow
                                </span>
                                Processar Dados
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

// ============================================
// HistoryTable Component
// ============================================
function HistoryTable({
    cargas,
    loading,
    search,
    onSearchChange,
    page,
    totalPages,
    totalCount,
    onPageChange,
    onRefreshContext,
    onToast,
}: {
    cargas: Carga[];
    loading: boolean;
    search: string;
    onSearchChange: (v: string) => void;
    page: number;
    totalPages: number;
    totalCount: number;
    onPageChange: (p: number) => void;
    onRefreshContext: () => void;
    onToast: (toast: { message: string, type: "success" | "error" }) => void;
}) {
    const getFileIcon = (filename: string) => {
        if (filename.endsWith(".xlsx") || filename.endsWith(".xls"))
            return { icon: "table_chart", color: "text-emerald-400" };
        if (filename.endsWith(".pdf"))
            return { icon: "picture_as_pdf", color: "text-red-400" };
        return { icon: "description", color: "text-primary" };
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja cancelar e excluir esta importação?")) return;

        try {
            const res = await fetch(`/api/cargas/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (res.ok) {
                onToast({ message: "Importação cancelada com sucesso", type: "success" });
                onRefreshContext();
            } else {
                onToast({ message: data.error || "Erro ao excluir", type: "error" });
            }
        } catch {
            onToast({ message: "Erro de rede ao excluir. Tente novamente.", type: "error" });
        }
    };

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-white">Histórico de Cargas</h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                            search
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Filtrar arquivos..."
                            className="pl-10 pr-4 py-2 bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary w-64 text-white placeholder:text-slate-600 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Data da Carga</th>
                            <th className="px-6 py-4">Arquivo</th>
                            <th className="px-6 py-4">Processados</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-500">
                                        <span className="material-symbols-outlined text-3xl animate-spin-slow">
                                            sync
                                        </span>
                                        <p className="text-sm">Carregando histórico...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : cargas.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-500">
                                        <span className="material-symbols-outlined text-4xl">
                                            inbox
                                        </span>
                                        <p className="text-sm font-medium">
                                            Nenhuma carga encontrada
                                        </p>
                                        <p className="text-xs">
                                            Faça o upload de um arquivo para começar
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            cargas.map((carga) => {
                                const fi = getFileIcon(carga.nome_arquivo);
                                return (
                                    <tr
                                        key={carga.id}
                                        className="hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white">
                                                    {formatDateTime(carga.data_upload).split(",")[0] ||
                                                        formatDateTime(carga.data_upload)}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {formatDateTime(carga.data_upload).includes(",")
                                                        ? formatDateTime(carga.data_upload)
                                                            .split(",")[1]
                                                            ?.trim()
                                                        : ""}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={cn(
                                                        "material-symbols-outlined",
                                                        fi.color
                                                    )}
                                                >
                                                    {fi.icon}
                                                </span>
                                                <span className="text-sm font-medium text-white">
                                                    {carga.nome_arquivo}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {carga.registros_processados?.toLocaleString("pt-BR") || 0}{" "}
                                            registros
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={carga.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                                            {carga.status === "sucesso" && (
                                                <>
                                                    <button
                                                        className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                                        title="Ver detalhes"
                                                    >
                                                        <span className="material-symbols-outlined text-lg opacity-60">
                                                            visibility
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(carga.id)}
                                                        className="text-red-500 hover:text-red-400 transition-colors ml-2 cursor-pointer"
                                                        title="Excluir importação"
                                                    >
                                                        <span className="material-symbols-outlined text-lg opacity-80">
                                                            delete
                                                        </span>
                                                    </button>
                                                </>
                                            )}
                                            {carga.status === "falha" && (
                                                <>
                                                    <button
                                                        className="text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
                                                        title="Ver erro"
                                                    >
                                                        <span className="material-symbols-outlined text-lg opacity-80">
                                                            error
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(carga.id)}
                                                        className="text-red-500 hover:text-red-400 transition-colors ml-2 cursor-pointer"
                                                        title="Excluir"
                                                    >
                                                        <span className="material-symbols-outlined text-lg opacity-80">
                                                            delete
                                                        </span>
                                                    </button>
                                                </>
                                            )}
                                            {carga.status === "processando" && (
                                                <>
                                                    <span className="material-symbols-outlined text-amber-400 animate-spin-slow text-lg">
                                                        sync
                                                    </span>
                                                    <button
                                                        onClick={() => handleDelete(carga.id)}
                                                        className="text-red-500 hover:text-red-400 transition-colors ml-2 cursor-pointer"
                                                        title="Cancelar / Excluir"
                                                    >
                                                        <span className="material-symbols-outlined text-lg opacity-80">
                                                            cancel
                                                        </span>
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="p-6 border-t border-slate-800 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Mostrando {cargas.length} de {totalCount} arquivos carregados
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                            className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-30"
                        >
                            <span className="material-symbols-outlined flex items-center justify-center">chevron_left</span>
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => onPageChange(pageNum)}
                                    className={cn(
                                        "size-8 rounded-lg font-bold text-sm transition-colors flex items-center justify-center",
                                        page === pageNum
                                            ? "bg-primary text-white"
                                            : "hover:bg-slate-800 text-slate-400"
                                    )}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-30 flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// Stats Sidebar
// ============================================
function StatsSidebar({ cargas }: { cargas: Carga[] }) {
    const processing = cargas.filter((c) => c.status === "processando").length;

    return (
        <div className="space-y-6">
            {/* Processing Status */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-white">Status da Fila</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-300">
                            Em processamento
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 bg-amber-900/30 text-amber-400 rounded">
                            {processing} {processing === 1 ? "Arquivo" : "Arquivos"}
                        </span>
                    </div>
                    {processing > 0 && (
                        <>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[45%] animate-pulse rounded-full" />
                            </div>
                            <p className="text-xs text-slate-500">
                                Processamento em andamento...
                            </p>
                        </>
                    )}
                    {processing === 0 && (
                        <p className="text-sm text-slate-500">Nenhum arquivo na fila</p>
                    )}
                </div>
            </div>

            {/* Admin Tip */}
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                    <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined">info</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-primary">Dica do Administrador</h4>
                        <p className="text-sm text-slate-400 mt-1">
                            Certifique-se de que os arquivos XLSX usem o padrão de cabeçalho
                            v2.0 para evitar erros de mapeamento. Consulte o manual de
                            importação para detalhes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Admin Page (Main)
// ============================================
export default function AdminPage() {
    const [cargas, setCargas] = useState<Carga[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    // Fetch cargas
    const fetchCargas = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: "10",
            });
            if (search) params.set("search", search);

            const res = await fetch(`/api/cargas?${params}`);
            if (res.ok) {
                const data = await res.json();
                setCargas(data.data);
                setTotalPages(data.totalPages);
                setTotalCount(data.count);
            }
        } catch (err) {
            console.error("Failed to fetch cargas:", err);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchCargas();
    }, [fetchCargas]);

    // Auto-polling for processing items
    useEffect(() => {
        const hasProcessing = cargas.some((c) => c.status === "processando");
        let timeoutId: NodeJS.Timeout;

        if (hasProcessing) {
            timeoutId = setTimeout(() => {
                fetchCargas();
            }, 3000);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [cargas, fetchCargas]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Upload handler
    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setToast({
                    message: data.message || "Arquivo enviado com sucesso!",
                    type: "success",
                });
                fetchCargas();
            } else {
                setToast({
                    message: data.error || "Erro ao enviar arquivo",
                    type: "error",
                });
            }
        } catch {
            setToast({
                message: "Erro de conexão. Tente novamente.",
                type: "error",
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Toast */}
            {toast && (
                <div
                    className={cn(
                        "fixed top-20 right-8 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl border animate-slide-up",
                        toast.type === "success"
                            ? "bg-emerald-900/80 border-emerald-700/50 text-emerald-300"
                            : "bg-red-900/80 border-red-700/50 text-red-300"
                    )}
                >
                    <span className="material-symbols-outlined text-lg">
                        {toast.type === "success" ? "check_circle" : "error"}
                    </span>
                    <span className="text-sm font-medium">{toast.message}</span>
                    <button
                        onClick={() => setToast(null)}
                        className="ml-2 opacity-60 hover:opacity-100"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            )}

            {/* Page Title */}
            <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white">
                    Painel de Importação
                </h2>
                <p className="text-slate-400 mt-1">
                    Carregue novos arquivos XLSX ou PDF para processamento centralizado.
                </p>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Section (2/3) */}
                <div className="lg:col-span-2">
                    <UploadZone onUpload={handleUpload} uploading={uploading} />
                </div>

                {/* Stats Sidebar (1/3) */}
                <StatsSidebar cargas={cargas} />
            </div>

            {/* History Table */}
            <HistoryTable
                cargas={cargas}
                loading={loading}
                search={search}
                onSearchChange={setSearch}
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={setPage}
                onRefreshContext={fetchCargas}
                onToast={setToast}
            />
        </div>
    );
}
