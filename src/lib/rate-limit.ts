// ============================================
// Rate Limiter in-memory
// Proteção contra brute force e spam
// ============================================

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpa entradas expiradas a cada 5 minutos para evitar memory leak
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    for (const [key, entry] of store) {
        if (now > entry.resetAt) {
            store.delete(key);
        }
    }
}

/**
 * Verifica se uma ação está dentro do limite de rate.
 * 
 * @param key - Identificador único (ex: "login:192.168.1.1" ou "register:192.168.1.1")
 * @param maxAttempts - Número máximo de tentativas dentro da janela
 * @param windowMs - Janela de tempo em milissegundos
 * @returns { allowed: boolean, remaining: number, retryAfterMs: number }
 */
export function checkRateLimit(
    key: string,
    maxAttempts: number,
    windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
    cleanup();

    const now = Date.now();
    const entry = store.get(key);

    // Primeira tentativa ou janela expirada
    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxAttempts - 1, retryAfterMs: 0 };
    }

    // Dentro da janela
    if (entry.count >= maxAttempts) {
        const retryAfterMs = entry.resetAt - now;
        return { allowed: false, remaining: 0, retryAfterMs };
    }

    entry.count++;
    return {
        allowed: true,
        remaining: maxAttempts - entry.count,
        retryAfterMs: 0,
    };
}

/**
 * Extrai IP do request (compatível com Next.js)
 */
export function getClientIp(request: Request): string {
    // Vercel / Cloudflare / proxies padrão
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) return realIp;

    // Fallback para desenvolvimento local
    return "127.0.0.1";
}
