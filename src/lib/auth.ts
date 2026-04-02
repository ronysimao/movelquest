import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createAdminClient } from "./supabase";
import type { Profile } from "@/types";

function getJwtSecret() {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is missing.");
    }
    return new TextEncoder().encode(process.env.JWT_SECRET);
}

const COOKIE_NAME = "asisto-session";

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
        id: profile.id, // Keeping for backward compatibility
        sub: profile.id, // Required by Supabase for auth.uid()
        role: "authenticated", // Required by Supabase for PostgREST
        email: profile.email,
        nome: profile.nome,
        perfil: profile.perfil,
        organization_id: profile.organization_id || null,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .setIssuedAt()
        .sign(getJwtSecret());

    return token;
}


export async function verifySession(
    token: string
): Promise<Profile | null> {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        return {
            id: payload.id as string,
            email: payload.email as string,
            nome: payload.nome as string,
            perfil: payload.perfil as Profile["perfil"],
            organization_id: (payload.organization_id as string) || undefined,
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

export async function getSessionToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    return sessionCookie?.value || null;
}

// ============================================
// Login / Logout
// ============================================

export async function login(
    email: string,
    password: string
): Promise<{ success: boolean; profile?: Profile; error?: string }> {
    const supabase = createAdminClient();

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
    
    // Explicitly delete sensitive data before returning or logging
    delete profile.senha_hash;

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
            organization_id: profile.organization_id || undefined,
        },
    };
}
