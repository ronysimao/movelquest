import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/api/auth/login"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (PUBLIC_PATHS.some((p) => pathname === p)) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Check session
    const sessionCookie = request.cookies.get("movelquest-session");
    if (!sessionCookie?.value) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    const profile = await verifySession(sessionCookie.value);
    if (!profile) {
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("movelquest-session");
        return response;
    }

    // Role-based access control
    if (pathname.startsWith("/admin") && profile.perfil !== "admin") {
        return NextResponse.redirect(new URL("/search", request.url));
    }

    if (pathname.startsWith("/search") && profile.perfil === "admin") {
        // Admins can also access search — no redirect needed
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
