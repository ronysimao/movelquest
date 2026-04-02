"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { ActorType } from "@/types";

// ============================================
// Configuração de campos por tipo de ator
// ============================================

interface FieldConfig {
    name: string;
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
    helpText?: string;
    mask?: "cnpj";
}

const COMMON_FIELDS: FieldConfig[] = [
    {
        name: "nome",
        label: "Nome completo",
        type: "text",
        placeholder: "Seu nome completo",
        required: true,
    },
    {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "seu@email.com",
        required: true,
    },
    {
        name: "senha",
        label: "Senha",
        type: "password",
        placeholder: "Mínimo 8 caracteres",
        required: true,
        helpText: "Use pelo menos 8 caracteres com letras e números.",
    },
];

const ACTOR_FIELDS: Record<ActorType, FieldConfig[]> = {
    fabricante: [
        {
            name: "razao_social",
            label: "Razão Social",
            type: "text",
            placeholder: "Razão social da empresa",
            required: true,
        },
        {
            name: "cnpj",
            label: "CNPJ",
            type: "text",
            placeholder: "00.000.000/0001-00",
            required: true,
            mask: "cnpj",
        },
        {
            name: "regiao_atuacao",
            label: "Região de Atuação",
            type: "text",
            placeholder: "Ex: Sul, Sudeste",
            required: false,
        },
    ],
    representante: [
        {
            name: "creci",
            label: "CRECI / Registro Profissional",
            type: "text",
            placeholder: "Número do registro",
            required: true,
        },
        {
            name: "fabricante_vinculado_id",
            label: "ID do Fabricante Vinculado",
            type: "text",
            placeholder: "UUID do fabricante",
            required: true,
            helpText: "Informe o identificador da empresa fabricante.",
        },
    ],
    lojista: [
        {
            name: "loja_nome",
            label: "Nome da Loja",
            type: "text",
            placeholder: "Nome comercial da loja",
            required: true,
        },
        {
            name: "endereco",
            label: "Endereço",
            type: "text",
            placeholder: "Endereço completo",
            required: false,
        },
        {
            name: "markup_padrao",
            label: "Markup Padrão (%)",
            type: "number",
            placeholder: "Ex: 30",
            required: false,
            helpText:
                "Percentual de markup aplicado sobre o preço de fábrica.",
        },
    ],
    arquiteto: [
        {
            name: "organization_id",
            label: "ID do Lojista Vinculado",
            type: "text",
            placeholder: "UUID do lojista que liberou o acesso",
            required: true,
            helpText:
                "O lojista precisa ter uma conta ativa na plataforma.",
        },
        {
            name: "portfolio_url",
            label: "URL do Portfólio",
            type: "url",
            placeholder: "https://meuportfolio.com",
            required: false,
        },
        {
            name: "especialidade",
            label: "Especialidade",
            type: "text",
            placeholder: "Ex: Residencial, Corporativo",
            required: false,
        },
    ],
    consumidor: [
        {
            name: "telefone",
            label: "Telefone",
            type: "tel",
            placeholder: "(00) 00000-0000",
            required: false,
        },
        {
            name: "endereco_entrega",
            label: "Endereço de Entrega",
            type: "text",
            placeholder: "Endereço completo para entregas",
            required: false,
        },
    ],
};

const ACTOR_META: Record<
    ActorType,
    { title: string; icon: string; gradient: string }
> = {
    fabricante: {
        title: "Fabricante",
        icon: "factory",
        gradient: "from-blue-600 to-cyan-500",
    },
    representante: {
        title: "Representante",
        icon: "handshake",
        gradient: "from-violet-600 to-purple-500",
    },
    lojista: {
        title: "Lojista",
        icon: "storefront",
        gradient: "from-emerald-600 to-green-500",
    },
    arquiteto: {
        title: "Arquiteto",
        icon: "architecture",
        gradient: "from-amber-600 to-orange-500",
    },
    consumidor: {
        title: "Consumidor Final",
        icon: "person",
        gradient: "from-rose-600 to-pink-500",
    },
};

const VALID_TYPES: ActorType[] = [
    "fabricante",
    "representante",
    "lojista",
    "arquiteto",
    "consumidor",
];

// ============================================
// Máscara de CNPJ
// ============================================

function applyCnpjMask(value: string): string {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, "").slice(0, 14);

    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8)
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12)
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

// ============================================
// Componente principal
// ============================================

export default function CadastroFormPage() {
    const params = useParams();
    const router = useRouter();
    const type = params.type as string;

    const [formData, setFormData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Verificar se o tipo é válido
    if (!VALID_TYPES.includes(type as ActorType)) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <span className="material-symbols-outlined text-6xl text-red-400 mb-4 block">
                        error
                    </span>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Tipo de ator inválido
                    </h1>
                    <p className="text-gray-400 mb-6">
                        O tipo &quot;{type}&quot; não é reconhecido pela
                        plataforma.
                    </p>
                    <Link
                        href="/cadastro"
                        className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline font-medium"
                        style={{ cursor: "pointer" }}
                    >
                        <span className="material-symbols-outlined text-lg">
                            arrow_back
                        </span>
                        Voltar à seleção
                    </Link>
                </div>
            </div>
        );
    }

    const actorType = type as ActorType;
    const meta = ACTOR_META[actorType];
    const specificFields = ACTOR_FIELDS[actorType];

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement>,
        field: FieldConfig
    ) {
        let value = e.target.value;

        // Aplica máscara de CNPJ
        if (field.mask === "cnpj") {
            value = applyCnpjMask(value);
        }

        setFormData((prev) => ({
            ...prev,
            [e.target.name]: value,
        }));
        if (error) setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/actors/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    actor_type: actorType,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(
                    result.error ||
                        "Ocorreu um erro ao processar o cadastro."
                );
                if (result.campos_faltantes) {
                    setError(
                        `Campos obrigatórios faltando: ${result.campos_faltantes.join(", ")}`
                    );
                }
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch {
            setError("Erro de conexão. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    // Tela de sucesso
    if (success) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center px-4">
                <div className="text-center animate-slide-up">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-emerald-400 text-4xl">
                            check_circle
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">
                        Cadastro realizado!
                    </h1>
                    <p className="text-gray-400 mb-2">
                        Seu cadastro como{" "}
                        <strong className="text-white">{meta.title}</strong>{" "}
                        foi concluído com sucesso.
                    </p>
                    <p className="text-gray-500 text-sm">
                        Redirecionando para o login em instantes...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link
                        href="/cadastro"
                        className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
                        style={{ cursor: "pointer" }}
                    >
                        <span className="material-symbols-outlined text-lg">
                            arrow_back
                        </span>
                        Voltar
                    </Link>

                    <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                    >
                        <span className="material-symbols-outlined text-white text-3xl">
                            {meta.icon}
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-1">
                        Cadastro de {meta.title}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Preencha os campos abaixo para criar sua conta.
                    </p>
                </div>

                {/* Formulário */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8"
                >
                    {/* Erro global */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
                            <span className="material-symbols-outlined text-red-400 text-xl mt-0.5">
                                error
                            </span>
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Seção: Dados de Acesso */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                            Dados de Acesso
                        </h3>
                        {COMMON_FIELDS.map((field) => (
                            <div key={field.name}>
                                <label
                                    htmlFor={field.name}
                                    className="block text-sm font-medium text-gray-300 mb-1.5"
                                >
                                    {field.label}
                                    {field.required && (
                                        <span className="text-red-400 ml-1">
                                            *
                                        </span>
                                    )}
                                </label>

                                {field.type === "password" ? (
                                    /* Campo de senha com olhinho */
                                    <div className="relative">
                                        <input
                                            id={field.name}
                                            name={field.name}
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            value={
                                                formData[field.name] || ""
                                            }
                                            onChange={(e) =>
                                                handleChange(e, field)
                                            }
                                            className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            style={{ cursor: "pointer" }}
                                            aria-label={
                                                showPassword
                                                    ? "Ocultar senha"
                                                    : "Mostrar senha"
                                            }
                                        >
                                            <span className="material-symbols-outlined text-xl">
                                                {showPassword
                                                    ? "visibility_off"
                                                    : "visibility"}
                                            </span>
                                        </button>
                                    </div>
                                ) : (
                                    <input
                                        id={field.name}
                                        name={field.name}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        value={formData[field.name] || ""}
                                        onChange={(e) =>
                                            handleChange(e, field)
                                        }
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                                    />
                                )}

                                {field.helpText && (
                                    <p className="text-gray-500 text-xs mt-1">
                                        {field.helpText}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Separador */}
                    <div className="border-t border-white/5" />

                    {/* Seção: Dados Específicos */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                            Dados de {meta.title}
                        </h3>
                        {specificFields.map((field) => (
                            <div key={field.name}>
                                <label
                                    htmlFor={field.name}
                                    className="block text-sm font-medium text-gray-300 mb-1.5"
                                >
                                    {field.label}
                                    {field.required && (
                                        <span className="text-red-400 ml-1">
                                            *
                                        </span>
                                    )}
                                </label>
                                <input
                                    id={field.name}
                                    name={field.name}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    value={formData[field.name] || ""}
                                    onChange={(e) =>
                                        handleChange(e, field)
                                    }
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                                />
                                {field.helpText && (
                                    <p className="text-gray-500 text-xs mt-1">
                                        {field.helpText}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Botão de submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-300 ${
                            loading
                                ? "bg-gray-600"
                                : `bg-gradient-to-r ${meta.gradient} hover:shadow-lg hover:shadow-[var(--color-primary)]/20 hover:scale-[1.01] active:scale-[0.99]`
                        }`}
                        style={{
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined animate-spin-slow text-lg">
                                    progress_activity
                                </span>
                                Cadastrando...
                            </span>
                        ) : (
                            `Criar conta como ${meta.title}`
                        )}
                    </button>

                    {/* Link login */}
                    <p className="text-center text-gray-500 text-xs">
                        Já tem uma conta?{" "}
                        <Link
                            href="/login"
                            className="text-[var(--color-primary)] hover:underline font-medium"
                            style={{ cursor: "pointer" }}
                        >
                            Faça login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
