import { createAdminClient } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import OrdersClient from "./OrdersClient";

export const metadata = {
    title: "Meus Pedidos - Asisto Fab",
    description: "Gerencie seus pedidos.",
};

export default async function OrdersPage() {
    const supabase = createAdminClient();
    
    // Autenticação local
    const user = await getSession();
    if (!user) {
        redirect("/");
    }

    // Query dos pedidos
    let query = supabase
        .from("orcamentos")
        .select("*, vendedor:profiles(nome), itens:itens_orcamento(*)")
        .order("created_at", { ascending: false });
    
    // Se não for admin, vê apenas os dele
    if (user.perfil !== "admin") {
        query = query.eq("vendedor_id", user.id);
    }

    const { data: orders, error } = await query;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans selection:bg-primary/30">
            {/* Header / Navbar style */}
            <div className="max-w-6xl mx-auto flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-xl text-primary border border-primary/30 shadow-lg shadow-primary/10">
                        <span className="material-symbols-outlined text-3xl">list_alt</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">Pedidos Gerados</h1>
                        <p className="text-slate-400 text-sm">Acompanhe e gerencie os pedidos criados</p>
                    </div>
                </div>
                <Link 
                    href="/search" 
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 font-bold transition-all"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Catálogo
                </Link>
            </div>

            <div className="max-w-6xl mx-auto">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6">
                        Erro ao carregar pedidos: {error.message}
                    </div>
                )}

                {!orders || orders.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">inbox</span>
                        <h2 className="text-xl font-bold text-white mb-2">Nenhum pedido encontrado</h2>
                        <p className="text-slate-400 mb-6 max-w-sm">Você ainda não gerou nenhum pedido de compra na plataforma.</p>
                        <Link href="/search" className="bg-primary px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors inline-block cursor-pointer">
                            Criar Novo Pedido
                        </Link>
                    </div>
                ) : (
                    <OrdersClient initialOrders={orders} isAdmin={user.perfil === "admin"} />
                )}
            </div>
        </div>
    );
}
