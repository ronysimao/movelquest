import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createServerClient } from "./supabase";
import type { Profile } from "@/types";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "movelquest-secret-change-in-production"
);

const COOKIE_NAME = "movelquest-session";

// ============================================
// Password hashing
// ============================================

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// ============================================
// JWT Session
// ============================================

export async function createSession(profile: Profile): Promise<string> {
    const token = await new SignJWT({
        id: profile.id,
        email: profile.email,
        nome: profile.nome,
        perfil: profile.perfil,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .setIssuedAt()
        .sign(JWT_SECRET);

    return token;
}

export async function verifySession(
    token: string
): Promise<Profile | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return {
            id: payload.id as string,
            email: payload.email as string,
            nome: payload.nome as string,
            perfil: payload.perfil as "admin" | "vendedor",
        };
    } catch {
        return null;
    }
}

export async function getSession(): Promise<Profile | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) return null;
    return verifySession(sessionCookie.value);
}

// ============================================
// Login / Logout
// ============================================

export async function login(
    email: string,
    password: string
): Promise<{ success: boolean; profile?: Profile; error?: string }> {
    const supabase = createServerClient();

    // Find user by email in profiles table
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .eq("ativo", true)
        .limit(1);

    if (error || !profiles || profiles.length === 0) {
        return { success: false, error: "Credenciais inválidas" };
    }

    const profile = profiles[0];

    // Verify password
    const isValid = await verifyPassword(password, profile.senha_hash);
    if (!isValid) {
        return { success: false, error: "Credenciais inválidas" };
    }

    return {
        success: true,
        profile: {
            id: profile.id,
            email: profile.email,
            nome: profile.nome,
            perfil: profile.perfil,
        },
    };
}
