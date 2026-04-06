import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { ActorType } from "@/types";

// Register: max 3 registros por IP a cada hora
const REGISTER_MAX_ATTEMPTS = 3;
const REGISTER_WINDOW_MS = 60 * 60 * 1000; // 1 hora

// ============================================
// POST /api/actors/register
// Cadastro de novos atores da plataforma
// ============================================

const VALID_ACTOR_TYPES: ActorType[] = [
    "fabricante",
    "representante",
    "lojista",
    "arquiteto",
    "consumidor",
];

// Campos obrigatórios por tipo de ator
const REQUIRED_FIELDS: Record<ActorType, string[]> = {
    fabricante: ["nome", "email", "senha", "cnpj", "razao_social"],
    representante: ["nome", "email", "senha", "creci", "fabricante_vinculado_id"],
    lojista: ["nome", "email", "senha", "loja_nome"],
    arquiteto: ["nome", "email", "senha", "organization_id"],
    consumidor: ["nome", "email", "senha"],
};

// Mapeamento de actor_type para perfil do profiles
const ACTOR_TO_PERFIL: Record<ActorType, string> = {
    fabricante: "fabricante_admin",
    representante: "representante",
    lojista: "lojista",
    arquiteto: "arquiteto",
    consumidor: "consumidor",
};

// Tipos que criam uma nova organização automaticamente
const CREATES_ORG: ActorType[] = ["fabricante", "lojista"];

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/[^a-z0-9]+/g, "-")     // substitui caracteres especiais por hifens
        .replace(/^-|-$/g, "");           // remove hifens no início/fim
}

function validateFields(
    body: Record<string, unknown>,
    actorType: ActorType
): string[] {
    const required = REQUIRED_FIELDS[actorType];
    const missing: string[] = [];

    for (const field of required) {
        if (!body[field] || String(body[field]).trim() === "") {
            missing.push(field);
        }
    }

    return missing;
}

export async function POST(request: Request) {
    try {
        // Rate limiting
        const ip = getClientIp(request);
        const { allowed, retryAfterMs } = checkRateLimit(
            `register:${ip}`,
            REGISTER_MAX_ATTEMPTS,
            REGISTER_WINDOW_MS
        );

        if (!allowed) {
            const retryAfterSec = Math.ceil(retryAfterMs / 1000);
            return NextResponse.json(
                {
                    error: `Muitos cadastros realizados. Tente novamente em ${Math.ceil(retryAfterSec / 60)} minutos.`,
                },
                {
                    status: 429,
                    headers: { "Retry-After": String(retryAfterSec) },
                }
            );
        }

        const body = await request.json();
        const rawType = body.actor_type;

        // 1. Validar tipo de ator
        if (!rawType || !VALID_ACTOR_TYPES.includes(rawType as ActorType)) {
            return NextResponse.json(
                {
                    error: "Tipo de ator inválido",
                    tipos_validos: VALID_ACTOR_TYPES,
                },
                { status: 400 }
            );
        }

        const actor_type: ActorType = rawType as ActorType;

        // 2. Validar campos obrigatórios
        const missingFields = validateFields(body, actor_type);
        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    error: "Campos obrigatórios faltando",
                    campos_faltantes: missingFields,
                },
                { status: 400 }
            );
        }

        // 3. Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                { error: "Formato de email inválido" },
                { status: 400 }
            );
        }

        // 4. Validar senha (mínimo 8 caracteres)
        if (String(body.senha).length < 8) {
            return NextResponse.json(
                { error: "A senha deve ter no mínimo 8 caracteres" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // 5. Verificar se email já existe
        const { data: existingUser } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", body.email)
            .limit(1);

        if (existingUser && existingUser.length > 0) {
            return NextResponse.json(
                { error: "Este email já está cadastrado" },
                { status: 409 }
            );
        }

        let organizationId: string | null = null;

        // 6. Criar organização (se aplicável)
        if (CREATES_ORG.includes(actor_type)) {
            const orgName = actor_type === "fabricante"
                ? body.razao_social
                : body.loja_nome;

            const slug = generateSlug(orgName) + "-" + Date.now().toString(36);

            const orgType = actor_type === "fabricante" ? "fabricante" : "lojista";

            const { data: org, error: orgError } = await supabase
                .from("organizations")
                .insert({
                    name: orgName,
                    type: orgType,
                    slug,
                })
                .select("id")
                .single();

            if (orgError) {
                console.error("[Register] Erro ao criar organização:", orgError);
                return NextResponse.json(
                    { error: "Erro ao criar organização", details: orgError.message, hint: orgError.hint, code: orgError.code },
                    { status: 500 }
                );
            }

            organizationId = org.id;
        } else if (actor_type === "representante") {
            // Representante se vincula a um fabricante existente
            organizationId = body.fabricante_vinculado_id || null;

            // Verificar se o fabricante existe
            if (organizationId) {
                const { data: fab } = await supabase
                    .from("organizations")
                    .select("id, type")
                    .eq("id", organizationId)
                    .eq("type", "fabricante")
                    .single();

                if (!fab) {
                    return NextResponse.json(
                        { error: "Fabricante vinculado não encontrado" },
                        { status: 404 }
                    );
                }
            }
        } else if (actor_type === "arquiteto") {
            // Arquiteto vinculado a uma organização (deve ser lojista)
            organizationId = body.organization_id || null;

            if (organizationId) {
                const { data: org } = await supabase
                    .from("organizations")
                    .select("id, type")
                    .eq("id", organizationId)
                    .eq("type", "lojista")
                    .single();

                if (!org) {
                    return NextResponse.json(
                        { error: "Lojista vinculado não encontrado" },
                        { status: 404 }
                    );
                }
            }
        }

        // 7. Criar perfil na tabela profiles
        const senhaHash = await hashPassword(body.senha);

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .insert({
                email: body.email,
                senha_hash: senhaHash,
                nome: body.nome,
                perfil: ACTOR_TO_PERFIL[actor_type],
                ativo: true,
                organization_id: organizationId,
            })
            .select("id")
            .single();

        if (profileError) {
            console.error("[Register] Erro ao criar perfil:", profileError.message);
            return NextResponse.json(
                { error: "Erro ao criar perfil" },
                { status: 500 }
            );
        }

        // 8. Criar actor_profile com campos específicos
        const actorData: Record<string, unknown> = {
            user_id: profile.id,
            organization_id: organizationId,
            actor_type,
        };

        // Atribuir campos específicos por tipo
        if (actor_type === "fabricante") {
            actorData.cnpj = body.cnpj;
            actorData.razao_social = body.razao_social;
            actorData.regiao_atuacao = body.regiao_atuacao || null;
        } else if (actor_type === "representante") {
            actorData.creci = body.creci;
            actorData.fabricante_vinculado_id = body.fabricante_vinculado_id;
        } else if (actor_type === "lojista") {
            actorData.loja_nome = body.loja_nome;
            actorData.endereco = body.endereco || null;
            actorData.markup_padrao = body.markup_padrao || null;
        } else if (actor_type === "arquiteto") {
            actorData.portfolio_url = body.portfolio_url || null;
            actorData.especialidade = body.especialidade || null;
        } else if (actor_type === "consumidor") {
            actorData.telefone = body.telefone || null;
            actorData.endereco_entrega = body.endereco_entrega || null;
        }

        const { error: actorError } = await supabase
            .from("actor_profiles")
            .insert(actorData);

        if (actorError) {
            // Rollback: remover o perfil criado caso o actor_profile falhe
            await supabase.from("profiles").delete().eq("id", profile.id);
            if (organizationId && CREATES_ORG.includes(actor_type)) {
                await supabase.from("organizations").delete().eq("id", organizationId);
            }

            console.error("[Register] Erro ao criar actor_profile:", actorError.message);
            return NextResponse.json(
                { error: "Erro ao criar perfil de ator" },
                { status: 500 }
            );
        }

        // 9. Retorno de sucesso
        return NextResponse.json(
            {
                success: true,
                message: `${actor_type.charAt(0).toUpperCase() + actor_type.slice(1)} cadastrado com sucesso`,
                data: {
                    profile_id: profile.id,
                    organization_id: organizationId,
                    actor_type,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[POST /api/actors/register] Erro inesperado:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
