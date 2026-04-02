import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionEdge } from "@/lib/auth-edge";
import { PROFILE_HOME, PROFILE_ROUTES } from "@/lib/routes";

// ============================================
// Rotas que NÃO exigem autenticação
// ============================================
const PUBLIC_PATHS = [
    "/",
    "/login",
    "/cadastro",
    "/api/auth/login",
    "/api/actors/register",
];

// Prefixos públicos (qualquer rota que comece com esses paths)
const PUBLIC_PREFIXES = [
    "/cadastro/",    // /cadastro/fabricante, /cadastro/lojista, etc.
    "/orders/",      // visualização pública de pedidos
];

// ============================================
// Middleware principal
// ============================================
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Permitir rotas públicas exatas
    if (PUBLIC_PATHS.includes(pathname)) {
        return NextResponse.next();
    }

    // 2. Permitir prefixos públicos
    if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        return NextResponse.next();
    }

    // 3. Permitir arquivos estáticos e internals do Next.js
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/assets") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // 4. Permitir todas as rotas de API (auth é feita individualmente por rota)
    if (pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // 5. Verificar sessão
    const sessionCookie = request.cookies.get("asisto-session");
    if (!sessionCookie?.value) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const profile = await verifySessionEdge(sessionCookie.value);
    if (!profile) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("asisto-session");
        return response;
    }

    // 6. Controle de acesso baseado em perfil
    const allowedRoutes = PROFILE_ROUTES[profile.perfil] || ["/search"];
    const isAllowed = allowedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (!isAllowed) {
        // Redireciona para a home do perfil
        const home = PROFILE_HOME[profile.perfil] || "/search";
        return NextResponse.redirect(new URL(home, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
