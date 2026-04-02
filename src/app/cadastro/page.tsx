"use client";

import Link from "next/link";

const ACTOR_TYPES = [
    {
        type: "fabricante",
        title: "Fabricante",
        description:
            "Cadastre seus produtos, defina preços base, configure regiões de venda e gerencie pedidos recebidos.",
        icon: "factory",
        gradient: "from-blue-600 to-cyan-500",
    },
    {
        type: "representante",
        title: "Representante",
        description:
            "Atue como canal comercial vinculado a um fabricante, acesse pedidos da sua região.",
        icon: "handshake",
        gradient: "from-violet-600 to-purple-500",
    },
    {
        type: "lojista",
        title: "Lojista",
        description:
            "Consuma catálogos, defina markup de venda, configure acesso para sua equipe e gere orçamentos.",
        icon: "storefront",
        gradient: "from-emerald-600 to-green-500",
    },
    {
        type: "arquiteto",
        title: "Arquiteto",
        description:
            "Consulte produtos liberados pelo lojista, monte listas de especificação e solicite orçamentos.",
        icon: "architecture",
        gradient: "from-amber-600 to-orange-500",
    },
    {
        type: "consumidor",
        title: "Consumidor Final",
        description:
            "Visualize catálogos e orçamentos compartilhados pelo lojista.",
        icon: "person",
        gradient: "from-rose-600 to-pink-500",
    },
];

export default function CadastroPage() {
    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] flex flex-col items-center justify-center px-4 py-12">
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                    Cadastre-se no{" "}
                    <span className="bg-gradient-to-r from-[var(--color-primary)] to-cyan-400 bg-clip-text text-transparent">
                        Asisto Fab
                    </span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                    Selecione o tipo de conta para começar sua jornada na
                    plataforma.
                </p>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
                {ACTOR_TYPES.map((actor, index) => (
                    <Link
                        key={actor.type}
                        href={`/cadastro/${actor.type}`}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[var(--color-primary)]/10"
                        style={{
                            animationDelay: `${index * 80}ms`,
                            animationFillMode: "both",
                            cursor: "pointer",
                        }}
                    >
                        {/* Gradiente decorativo */}
                        <div
                            className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${actor.gradient} opacity-10 rounded-bl-full transition-opacity duration-300 group-hover:opacity-20`}
                        />

                        {/* Ícone */}
                        <div
                            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${actor.gradient} flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110`}
                        >
                            <span className="material-symbols-outlined text-white text-2xl">
                                {actor.icon}
                            </span>
                        </div>

                        {/* Texto */}
                        <h2 className="text-xl font-semibold text-white mb-2 transition-colors duration-300 group-hover:text-[var(--color-primary)]">
                            {actor.title}
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {actor.description}
                        </p>

                        {/* Seta */}
                        <div className="mt-4 flex items-center gap-1 text-[var(--color-primary)] text-sm font-medium opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                            Cadastrar
                            <span className="material-symbols-outlined text-lg">
                                arrow_forward
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Link para login */}
            <p className="mt-10 text-gray-500 text-sm animate-fade-in">
                Já tem uma conta?{" "}
                <Link
                    href="/login"
                    className="text-[var(--color-primary)] hover:underline font-medium"
                    style={{ cursor: "pointer" }}
                >
                    Faça login
                </Link>
            </p>
        </div>
    );
}
