import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import QuoteClientPage from "./QuoteClient";

type Props = { params: Promise<{ id: string }> };

export const metadata = {
    title: "Seu Pedido - Asisto Fab",
    description: "Visualização do seu pedido de móveis no Asisto Fab."
};

export default async function QuotePage(props: Props) {
    const params = await props.params;
    const numero = params.id;

    if (!numero) {
        redirect("/");
    }

    const supabase = createAdminClient();

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

    return <QuoteClientPage orcamento={orcamento as any} />;
}
