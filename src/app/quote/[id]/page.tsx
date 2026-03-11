"use client";

import { useState, useEffect, use } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface QuoteItem {
    id: number;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
    movel: {
        modelo: string;
        variante: string | null;
        categoria: string;
        material: string | null;
        tecido: string | null;
        altura_cm: number | null;
        largura_cm: number | null;
        comprimento_cm: number | null;
        imagem_url: string | null;
    } | null;
}

interface Quote {
    id: number;
    numero: string;
    data: string;
    cliente_nome: string;
    cliente_email: string | null;
    cliente_endereco: string | null;
    valor_total: number;
    vendedor: { nome: string; email: string } | null;
    itens: QuoteItem[];
}

export default function QuotePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchQuote() {
            try {
                const res = await fetch(`/api/orcamentos/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setQuote(data.data);
                } else {
                    setError("Orçamento não encontrado");
                }
            } catch {
                setError("Erro ao carregar orçamento");
            } finally {
                setLoading(false);
            }
        }
        fetchQuote();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <span className="material-symbols-outlined text-4xl animate-spin-slow">
                        sync
                    </span>
                    <p className="text-sm">Carregando orçamento...</p>
                </div>
            </div>
        );
    }

    if (error || !quote) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <span className="material-symbols-outlined text-5xl">
                        error_outline
                    </span>
                    <p className="text-lg font-bold">{error || "Erro desconhecido"}</p>
                    <a
                        href="/search"
                        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium cursor-pointer"
                    >
                        Voltar ao catálogo
                    </a>
                </div>
            </div>
        );
    }

    // First item image for the product section (if available)
    const firstItemWithImage = quote.itens.find(
        (i) => i.movel?.imagem_url
    );

    return (
        <div className="min-h-screen flex flex-col items-center py-10 px-4">
            {/* Action Bar */}
            <div className="no-print w-full max-w-[800px] mb-6 flex flex-wrap justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700 gap-3">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">
                        description
                    </span>
                    <span className="font-bold text-sm uppercase tracking-wider text-white">
                        Pré-visualização do Orçamento
                    </span>
                </div>
                <div className="flex gap-3">
                    <a
                        href="/search"
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold transition-all text-sm cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            arrow_back
                        </span>
                        Voltar
                    </a>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold transition-all text-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            print
                        </span>
                        Imprimir PDF
                    </button>
                </div>
            </div>

            {/* A4 Paper */}
            <div className="print-container w-full max-w-[800px] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col p-12 border border-slate-200 dark:border-slate-800">
                {/* Header */}
                <header className="flex justify-between items-start border-b-2 border-primary/20 pb-8 mb-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary p-2 rounded-lg">
                                <span className="material-symbols-outlined text-white text-3xl">
                                    chair
                                </span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
                                    CATÁLOGO DE PRODUTOS
                                </h1>
                                <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                                    Soluções Premium em Móveis
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            <p>Rua das Madeiras, 123</p>
                            <p>São Paulo, SP - 01234-567</p>
                            <p>Tel: (11) 9999-8888</p>
                            <p>contato@movelquest.com.br</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-lg inline-block mb-4">
                            <p className="text-xs font-bold text-primary uppercase">
                                Nº do Orçamento
                            </p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">
                                {quote.numero}
                            </p>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            <p className="font-bold">Data de Emissão:</p>
                            <p>{formatDate(quote.data)}</p>
                        </div>
                    </div>
                </header>

                {/* Client Info */}
                <div className="grid grid-cols-2 gap-8 mb-10">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Cliente
                        </p>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
                            {quote.cliente_nome}
                        </h3>
                        {quote.cliente_endereco && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 pt-2">
                                {quote.cliente_endereco}
                            </p>
                        )}
                        {quote.cliente_email && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {quote.cliente_email}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Vendedor
                        </p>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
                            {quote.vendedor
                                ? (quote.vendedor as unknown as { nome: string }).nome
                                : "—"}
                        </h3>
                        {quote.vendedor && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 pt-2">
                                {
                                    (quote.vendedor as unknown as { email: string })
                                        .email
                                }
                            </p>
                        )}
                    </div>
                </div>

                {/* Product Details (first item with image) */}
                {firstItemWithImage?.movel && (
                    <div className="mb-10">
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full" />
                            Detalhes do Produto
                        </h2>
                        <div className="flex gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                            {firstItemWithImage.movel.imagem_url && (
                                <div className="w-1/3 aspect-square rounded-lg bg-white overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <div
                                        className="w-full h-full bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url(${firstItemWithImage.movel.imagem_url})`,
                                        }}
                                    />
                                </div>
                            )}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {firstItemWithImage.movel.modelo}
                                        {firstItemWithImage.movel.variante &&
                                            ` — ${firstItemWithImage.movel.variante}`}
                                    </h3>
                                    <p className="text-xs text-primary font-bold uppercase mt-1">
                                        {firstItemWithImage.movel.categoria}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {firstItemWithImage.movel.material && (
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                Material
                                            </p>
                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                {firstItemWithImage.movel.material}
                                            </p>
                                        </div>
                                    )}
                                    {firstItemWithImage.movel.tecido && (
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                Tecido
                                            </p>
                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                {firstItemWithImage.movel.tecido}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {/* Dimensions */}
                                {(firstItemWithImage.movel.altura_cm ||
                                    firstItemWithImage.movel.largura_cm ||
                                    firstItemWithImage.movel.comprimento_cm) && (
                                        <div className="pt-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                                                Dimensões
                                            </p>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                {firstItemWithImage.movel.altura_cm && (
                                                    <div className="border border-slate-200 dark:border-slate-700 rounded py-1 bg-white dark:bg-slate-900">
                                                        <p className="text-[9px] text-slate-400 uppercase">
                                                            Altura
                                                        </p>
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                            {firstItemWithImage.movel.altura_cm} cm
                                                        </p>
                                                    </div>
                                                )}
                                                {firstItemWithImage.movel.largura_cm && (
                                                    <div className="border border-slate-200 dark:border-slate-700 rounded py-1 bg-white dark:bg-slate-900">
                                                        <p className="text-[9px] text-slate-400 uppercase">
                                                            Largura
                                                        </p>
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                            {firstItemWithImage.movel.largura_cm} cm
                                                        </p>
                                                    </div>
                                                )}
                                                {firstItemWithImage.movel.comprimento_cm && (
                                                    <div className="border border-slate-200 dark:border-slate-700 rounded py-1 bg-white dark:bg-slate-900">
                                                        <p className="text-[9px] text-slate-400 uppercase">
                                                            Profund.
                                                        </p>
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                            {firstItemWithImage.movel.comprimento_cm} cm
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Table */}
                <div className="mb-10">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-slate-900 dark:border-white">
                                <th className="text-left py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Descrição do Item
                                </th>
                                <th className="text-right py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Qtd
                                </th>
                                <th className="text-right py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Preço Unit.
                                </th>
                                <th className="text-right py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {quote.itens.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-4 text-sm font-bold text-slate-900 dark:text-white">
                                        {item.movel
                                            ? `${item.movel.modelo}${item.movel.variante ? ` — ${item.movel.variante}` : ""}`
                                            : "Produto removido"}
                                    </td>
                                    <td className="py-4 text-right text-sm text-slate-700 dark:text-slate-300">
                                        {String(item.quantidade).padStart(2, "0")}
                                    </td>
                                    <td className="py-4 text-right text-sm text-slate-700 dark:text-slate-300">
                                        {formatCurrency(item.preco_unitario)}
                                    </td>
                                    <td className="py-4 text-right text-sm font-bold text-slate-900 dark:text-white">
                                        {formatCurrency(item.subtotal)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="py-6" colSpan={2} />
                                <td className="py-6 text-right text-sm text-slate-500">
                                    Subtotal:
                                </td>
                                <td className="py-6 text-right text-sm font-semibold text-slate-900 dark:text-white">
                                    {formatCurrency(quote.valor_total)}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} />
                                <td className="py-2 text-right text-sm text-slate-500 border-t border-slate-100 dark:border-slate-800">
                                    Frete:
                                </td>
                                <td className="py-2 text-right text-sm font-semibold border-t border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
                                    A combinar
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} />
                                <td className="py-4 text-right text-lg font-bold text-slate-900 dark:text-white uppercase">
                                    Total:
                                </td>
                                <td className="py-4 text-right text-xl font-black text-primary">
                                    {formatCurrency(quote.valor_total)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Spacer */}
                <div className="grow" />

                {/* Footer */}
                <footer className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-auto">
                    <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-2">
                                    Termos e Condições
                                </h4>
                                <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
                                    <li>
                                        • Este orçamento é válido por 7 dias a partir da data de
                                        emissão.
                                    </li>
                                    <li>
                                        • Preços sujeitos a alteração conforme disponibilidade de
                                        materiais.
                                    </li>
                                    <li>
                                        • Serviço de montagem não incluso, salvo indicação
                                        contrária.
                                    </li>
                                    <li>
                                        • Garantia: 12 meses contra defeitos de fabricação.
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-end">
                            <div className="w-full border-t border-slate-900 dark:border-white pt-2 text-center">
                                <p className="text-[10px] font-bold uppercase text-slate-900 dark:text-white">
                                    Assinatura do Cliente
                                </p>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500">
                                    Data: ____ / ____ / ________
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 text-center">
                        <p className="text-[9px] text-slate-400 dark:text-slate-600">
                            CATÁLOGO DE PRODUTOS Soluções em Móveis LTDA | CNPJ: 12.345.678/0001-99 |
                            Obrigado por escolher nossos móveis de qualidade.
                        </p>
                    </div>
                </footer>
            </div>

            {/* Print note */}
            <div className="no-print mt-8 text-slate-500 text-xs italic">
                Layout otimizado para impressão em papel A4. Use Ctrl+P ou o botão
                acima para imprimir.
            </div>
        </div>
    );
}
