// ============================================
// Verificação JWT leve — compatível com Edge Runtime
// Usado pelo middleware.ts (não pode importar bcrypt/cookies)
// ============================================

import { jwtVerify } from "jose";
import type { Profile } from "@/types";

function getJwtSecret() {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is missing.");
    }
    return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function verifySessionEdge(
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
