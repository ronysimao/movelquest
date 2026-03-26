import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { formatCurrency, cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export const metadata = {
    title: "Seu Pedido - MóvelQuest",
    description: "Visualização do seu pedido de móveis na MóvelQuest."
};

export default async function QuotePage(props: Props) {
    const params = await props.params;
    const numero = params.id;

    if (!numero) {
        redirect("/");
    }

    const supabase = createServerClient();

    // Fetch orcamento using Service Role to bypass RLS for public viewing
    const { data: orcamento, error } = await supabase
        .from("orcamentos")
        .select("*, vendedor:profiles(nome, email), itens:itens_orcamento(*)")
        .eq("numero", numero)
        .single();

    if (error || !orcamento) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
                <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">search_off</span>
                <h1 className="text-2xl font-bold mb-2">Pedido não encontrado</h1>
                <p className="text-slate-400 text-center max-w-md">
                    Não conseguimos localizar o pedido <strong className="text-white">{numero}</strong>. Verifique se o link está correto.
                </p>
                <a href="/" className="mt-8 px-6 py-3 bg-primary/20 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer">
                    Voltar ao Início
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-primary/30">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full" />
            </div>

            <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-16">
                
                {/* Header */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-white text-2xl block">chair</span>
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight uppercase">
                                Móvel<span className="text-primary">Quest</span>
                            </span>
                        </div>
                        <h1 className="text-slate-400 text-sm font-medium uppercase tracking-widest">Resumo do Pedido</h1>
                        <p className="text-3xl sm:text-4xl font-black text-white mt-1">
                            {orcamento.numero}
                        </p>
                        <p className="text-slate-400 mt-2 text-sm max-w-md line-clamp-2">
                            Preparado por <strong className="text-white">{(orcamento.vendedor as any)?.nome || "MóvelQuest"}</strong>
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
                        {orcamento.itens.map((item: any, idx: number) => {
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

                {/* Footer Total */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-slate-400 font-medium uppercase tracking-widest text-sm mb-1">Total do Pedido</h3>
                            <p className="text-4xl sm:text-5xl font-black text-white">
                                {formatCurrency(orcamento.valor_total)}
                            </p>
                        </div>
                        
                        <div className="w-full sm:w-auto">
                            <a 
                                href={`https://wa.me/?text=Ol%C3%A1!%20Finalizei%20a%20an%C3%A1lise%20do%20meu%20pedido%20${orcamento.numero}.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-white">chat</span>
                                Falar com Vendedor
                            </a>
                        </div>
                    </div>
                </div>
                
                {/* Branding Footer */}
                <div className="mt-12 text-center pb-8">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Gerado por MóvelQuest
                    </p>
                </div>
            </main>
        </div>
    );
}
