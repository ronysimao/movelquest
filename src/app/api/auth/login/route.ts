import { NextRequest, NextResponse } from "next/server";
import { login, createSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import { PROFILE_HOME } from "@/lib/routes";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Login: max 5 tentativas por IP a cada 15 minutos
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 min

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIp(request);
        const { allowed, retryAfterMs } = checkRateLimit(
            `login:${ip}`,
            LOGIN_MAX_ATTEMPTS,
            LOGIN_WINDOW_MS
        );

        if (!allowed) {
            const retryAfterSec = Math.ceil(retryAfterMs / 1000);
            return NextResponse.json(
                {
                    error: `Muitas tentativas de login. Tente novamente em ${Math.ceil(retryAfterSec / 60)} minutos.`,
                },
                {
                    status: 429,
                    headers: { "Retry-After": String(retryAfterSec) },
                }
            );
        }

        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "E-mail e senha são obrigatórios" },
                { status: 400 }
            );
        }

        const result = await login(email, password);

        if (!result.success || !result.profile) {
            return NextResponse.json(
                { error: result.error || "Credenciais inválidas" },
                { status: 401 }
            );
        }

        // Buscar dados do ator (se existir)
        const supabase = createAdminClient();
        const { data: actorProfile } = await supabase
            .from("actor_profiles")
            .select("actor_type")
            .eq("user_id", result.profile.id)
            .limit(1)
            .maybeSingle();

        // Create JWT session
        const token = await createSession(result.profile);

        // Determinar a URL de redirecionamento com base no perfil
        const redirectTo =
            PROFILE_HOME[result.profile.perfil] || "/search";

        // Set HTTP-only cookie
        const response = NextResponse.json({
            success: true,
            profile: result.profile,
            actor_type: actorProfile?.actor_type || null,
            redirect_to: redirectTo,
        });

        response.cookies.set("asisto-session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
