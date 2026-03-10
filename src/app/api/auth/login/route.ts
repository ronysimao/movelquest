import { NextRequest, NextResponse } from "next/server";
import { login, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
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

        // Create JWT session
        const token = await createSession(result.profile);

        // Set HTTP-only cookie
        const response = NextResponse.json({
            success: true,
            profile: result.profile,
        });

        response.cookies.set("movelquest-session", token, {
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
