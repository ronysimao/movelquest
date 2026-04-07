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
            label: "Importado",
            bg: "bg-emerald-900/30",
            text: "text-emerald-400",
            icon: "check_circle",
        },
        falha: {
            label: "Falha",
            bg: "bg-red-900/30",
            text: "text-red-400",
            icon: "error",
        },
        needs_human_help: {
            label: "Ajuste Manual",
            bg: "bg-orange-900/30",
            text: "text-orange-400",
            icon: "front_hand",
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

function RevisaoBadge({ count }: { count: number }) {
    if (count === 0) return null;
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-900/40 text-violet-300 border border-violet-700/50">
            <span className="material-symbols-outlined text-sm">rate_review</span>
            {count} p/ revisão
        </span>
    );
}

// ============================================
// Upload Zone Component
// ============================================
function UploadZone({
    onUpload,
    uploading,
    onInvalidFile,
}: {
    onUpload: (file: File) => Promise<void>;
    uploading: boolean;
    onInvalidFile?: (filename: string) => void;
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

    const ACCEPTED_EXTENSIONS = [".xlsx", ".csv", ".pdf"];

    const isValidFile = (file: File): boolean => {
        const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || "";
        return ACCEPTED_EXTENSIONS.includes(ext);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            if (isValidFile(file)) {
                setSelectedFile(file);
            } else {
                onInvalidFile?.(file.name);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onInvalidFile]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (isValidFile(file)) {
                setSelectedFile(file);
            } else {
                onInvalidFile?.(file.name);
            }
        }
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
        if (type.includes("csv") || type.includes("comma"))
            return "csv";
        if (type.includes("pdf")) return "picture_as_pdf";
        return "description";
    };

    const getFileIconColor = (type: string) => {
        if (type.includes("spreadsheet") || type.includes("excel"))
            return "text-emerald-400";
        if (type.includes("csv") || type.includes("comma"))
            return "text-blue-400";
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
                    accept=".xlsx,.csv,.pdf"
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
                    Max 50MB por arquivo
                </p>
                <button
                    type="button"
                    className="mt-6 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                >
                    Selecionar Arquivos
                </button>
            </div>

            {/* Formatos aceitos — banner informativo */}
            <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-slate-800/40 rounded-lg border border-slate-800">
                <span className="material-symbols-outlined text-sm text-slate-400">info</span>
                <div className="flex-1">
                    <p className="text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">Formatos aceitos:</span>{" "}
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">.xlsx</span>{" · "}
                        <span className="inline-flex items-center gap-1 text-blue-400 font-mono">.csv</span>{" · "}
                        <span className="inline-flex items-center gap-1 text-red-400 font-mono">.pdf</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Exportou do Google Sheets? Use "Arquivo → Fazer download → .xlsx" ou ".csv"
                    </p>
                </div>
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

    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        // Primeiro clique: pedir confirmação via toast
        if (pendingDeleteId !== id) {
            setPendingDeleteId(id);
            onToast({ message: "Clique novamente em Excluir para confirmar a exclusão", type: "error" });
            // Reset após 4 segundos se não clicar de novo
            setTimeout(() => setPendingDeleteId(prev => prev === id ? null : prev), 4000);
            return;
        }

        // Segundo clique: executar exclusão
        setPendingDeleteId(null);

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
            <div className="w-full">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider hidden md:table-header-group">
                        <tr>
                            <th className="px-6 py-4">Data da Carga</th>
                            <th className="px-6 py-4">Arquivo</th>
                            <th className="px-6 py-4">Processados</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="flex flex-col md:table-row-group gap-4 p-4 md:p-0 md:gap-0 divide-y-0 md:divide-y divide-slate-800">
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
                                        className="hover:bg-slate-800/60 transition-colors flex flex-col md:table-row bg-slate-800/30 md:bg-transparent rounded-xl md:rounded-none border border-slate-700 md:border-0 overflow-hidden"
                                    >
                                        <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell border-b border-slate-700/50 md:border-0">
                                            <span className="md:hidden text-xs font-bold text-slate-500 uppercase">Data da Carga</span>
                                            <div className="flex flex-col text-right md:text-left">
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
                                        <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell border-b border-slate-700/50 md:border-0">
                                            <span className="md:hidden text-xs font-bold text-slate-500 uppercase">Arquivo</span>
                                            <div className="flex items-center gap-3 justify-end md:justify-start">
                                                <span
                                                    className={cn(
                                                        "material-symbols-outlined shrink-0",
                                                        fi.color
                                                    )}
                                                >
                                                    {fi.icon}
                                                </span>
                                                <span className="text-sm font-medium text-white truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
                                                    {carga.nome_arquivo}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell text-sm text-slate-400 border-b border-slate-700/50 md:border-0">
                                            <span className="md:hidden text-xs font-bold text-slate-500 uppercase">Processados</span>
                                            <span>
                                                {carga.registros_processados?.toLocaleString("pt-BR") || 0}{" "}
                                                registros
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell border-b border-slate-700/50 md:border-0">
                                            <span className="md:hidden text-xs font-bold text-slate-500 uppercase">Status</span>
                                            <div className="flex justify-end md:justify-start gap-2 flex-wrap">
                                                <StatusBadge status={carga.status} />
                                                {(carga.revisao_pendente ?? 0) > 0 && <RevisaoBadge count={carga.revisao_pendente!} />}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 md:px-6 md:py-4 flex justify-end md:table-cell bg-slate-900/30 md:bg-transparent items-center gap-2">
                                            <div className="flex items-center gap-3 md:justify-end w-full md:w-auto justify-end">
                                                {carga.status === "sucesso" && (
                                                    <>
                                                        <a
                                                            href={`/admin/revisao/${carga.id}`}
                                                            className={cn(
                                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold",
                                                                (carga.revisao_pendente ?? 0) > 0
                                                                    ? "bg-violet-600 hover:bg-violet-500 text-white"
                                                                    : "bg-slate-800 hover:bg-slate-700 text-slate-400"
                                                            )}
                                                            title="Ver fila de revisão"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">
                                                                {(carga.revisao_pendente ?? 0) > 0 ? "rate_review" : "visibility"}
                                                            </span>
                                                            <span className="md:hidden">Revisar</span>
                                                        </a>
                                                        <button
                                                            onClick={() => handleDelete(carga.id)}
                                                            className="flex items-center gap-1.5 md:block px-3 py-1.5 md:p-0 rounded-lg md:rounded-none bg-red-900/20 md:bg-transparent text-red-500 hover:text-red-400 transition-colors ml-2 cursor-pointer"
                                                            title="Excluir importação"
                                                        >
                                                            <span className="material-symbols-outlined text-lg opacity-80">
                                                                delete
                                                            </span>
                                                            <span className="md:hidden text-xs font-bold">Excluir</span>
                                                        </button>
                                                    </>
                                                )}
                                                {carga.status === "falha" && (
                                                    <>
                                                        <button
                                                            onClick={() => onToast({
                                                                message: carga.erro_mensagem || "Erro desconhecido no processamento",
                                                                type: "error"
                                                            })}
                                                            className="flex items-center gap-1.5 md:block px-3 py-1.5 md:p-0 rounded-lg md:rounded-none bg-slate-800 md:bg-transparent text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
                                                            title={carga.erro_mensagem || "Ver erro"}
                                                        >
                                                            <span className="material-symbols-outlined text-lg opacity-80">
                                                                error
                                                            </span>
                                                            <span className="md:hidden text-xs font-bold">Erro</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(carga.id)}
                                                            className={`flex items-center gap-1.5 md:block px-3 py-1.5 md:p-0 rounded-lg md:rounded-none transition-colors ml-2 cursor-pointer ${
                                                                pendingDeleteId === carga.id
                                                                    ? "bg-red-600 md:bg-transparent text-yellow-300 animate-pulse"
                                                                    : "bg-red-900/20 md:bg-transparent text-red-500 hover:text-red-400"
                                                            }`}
                                                            title={pendingDeleteId === carga.id ? "Confirmar exclusão" : "Excluir"}
                                                        >
                                                            <span className="material-symbols-outlined text-lg opacity-80">
                                                                delete
                                                            </span>
                                                            <span className="md:hidden text-xs font-bold">Excluir</span>
                                                        </button>
                                                    </>
                                                )}
                                                {carga.status === "needs_human_help" && (
                                                    <>
                                                        <a
                                                            href={`/admin/mapeamento/${carga.id}`}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors cursor-pointer text-xs font-bold"
                                                            title="Ajustar mapeamento manualmente"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">tune</span>
                                                            <span className="md:hidden">Ajustar</span>
                                                        </a>
                                                        <button
                                                            onClick={() => handleDelete(carga.id)}
                                                            className="flex items-center gap-1.5 md:block px-3 py-1.5 md:p-0 rounded-lg md:rounded-none bg-red-900/20 md:bg-transparent text-red-500 hover:text-red-400 transition-colors ml-2 cursor-pointer"
                                                            title="Excluir"
                                                        >
                                                            <span className="material-symbols-outlined text-lg opacity-80">delete</span>
                                                            <span className="md:hidden text-xs font-bold">Excluir</span>
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
                                                            className="flex items-center gap-1.5 md:block px-3 py-1.5 md:p-0 rounded-lg md:rounded-none bg-red-900/20 md:bg-transparent text-red-500 hover:text-red-400 transition-colors ml-2 cursor-pointer"
                                                            title="Cancelar / Excluir"
                                                        >
                                                            <span className="material-symbols-outlined text-lg opacity-80">
                                                                cancel
                                                            </span>
                                                            <span className="md:hidden text-xs font-bold">Cancelar</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
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
                <div className="p-4 md:p-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs md:text-sm text-slate-500 text-center md:text-left">
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
    const pendingReview = cargas.reduce((sum, c) => sum + (c.revisao_pendente ?? 0), 0);
    const successCount = cargas.filter((c) => c.status === "sucesso").length;
    const needsHelpCount = cargas.filter((c) => c.status === "needs_human_help").length;

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
                                <div
                                    className="bg-primary h-full rounded-full"
                                    style={{
                                        width: "30%",
                                        animation: "indeterminate 1.8s ease-in-out infinite",
                                    }}
                                />
                            </div>
                            <style>{`
                                @keyframes indeterminate {
                                    0% { width: 10%; margin-left: 0; }
                                    50% { width: 40%; margin-left: 30%; }
                                    100% { width: 10%; margin-left: 90%; }
                                }
                            `}</style>
                            <p className="text-xs text-slate-500">
                                Processando com Gemini AI...
                            </p>
                        </>
                    )}
                    {processing === 0 && (
                        <p className="text-sm text-slate-500">Nenhum arquivo na fila</p>
                    )}

                    {/* Resumo rápido */}
                    {(pendingReview > 0 || successCount > 0 || needsHelpCount > 0) && (
                        <div className="pt-3 mt-3 border-t border-slate-800 space-y-2">
                            {needsHelpCount > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-orange-400 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm">front_hand</span>
                                        Aguardando ajuste
                                    </span>
                                    <a
                                        href="#"
                                        className="text-xs font-bold px-2 py-0.5 bg-orange-900/30 text-orange-400 rounded cursor-pointer hover:bg-orange-900/50 transition-colors"
                                    >
                                        {needsHelpCount} {needsHelpCount === 1 ? "carga" : "cargas"}
                                    </a>
                                </div>
                            )}
                            {pendingReview > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-violet-300">Pendentes de revisão</span>
                                    <span className="text-xs font-bold px-2 py-0.5 bg-violet-900/30 text-violet-300 rounded">
                                        {pendingReview} {pendingReview === 1 ? "item" : "itens"}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-emerald-400">Importados com sucesso</span>
                                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-900/30 text-emerald-400 rounded">
                                    {successCount}
                                </span>
                            </div>
                        </div>
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
                        <h4 className="font-bold text-primary">Importação Inteligente</h4>
                        <p className="text-sm text-slate-400 mt-1">
                            O Asisto Fab usa IA para mapear automaticamente as colunas do
                            seu catálogo. Itens com baixa confiança vão para a fila de
                            revisão manual.
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

    // Fetch cargas — silent=true faz refresh sem mostrar loading (usado no polling)
    const fetchCargas = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
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
            if (!silent) setLoading(false);
        }
    }, [page, search]);

    // Carga inicial (com loading spinner)
    useEffect(() => {
        fetchCargas(false);
    }, [fetchCargas]);

    // Auto-polling silencioso quando há itens processando (sem flickering)
    useEffect(() => {
        const hasProcessing = cargas.some((c) => c.status === "processando");
        if (!hasProcessing) return;

        const intervalId = setInterval(() => {
            fetchCargas(true);
        }, 5000);

        return () => clearInterval(intervalId);
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
                    <UploadZone
                        onUpload={handleUpload}
                        uploading={uploading}
                        onInvalidFile={(filename) => {
                            const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0] || "";
                            const isXls = ext === ".xls";
                            setToast({
                                message: isXls
                                    ? `O formato .xls não é suportado. Abra "${filename}" no Excel e salve como .xlsx (Arquivo → Salvar como → .xlsx) ou exporte como .csv.`
                                    : `Formato "${ext}" não suportado. Aceitamos apenas .xlsx, .csv e .pdf.`,
                                type: "error",
                            });
                        }}
                    />
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
