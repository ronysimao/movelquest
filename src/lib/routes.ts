// ============================================
// Mapa de perfil → dashboard padrão
// Compartilhado entre middleware e rotas de API
// ============================================

export const PROFILE_HOME: Record<string, string> = {
    admin: "/admin",
    fabricante_admin: "/painel/fabricante",
    representante: "/painel/representante",
    lojista: "/search",
    arquiteto: "/search",
    consumidor: "/search",
    vendedor: "/search",
};

// Mapa de perfil → rotas permitidas (usado pelo middleware)
export const PROFILE_ROUTES: Record<string, string[]> = {
    admin: ["/admin", "/search", "/painel"],
    fabricante_admin: ["/painel/fabricante", "/search"],
    representante: ["/painel/representante", "/search"],
    lojista: ["/painel/lojista", "/search", "/quote"],
    arquiteto: ["/search", "/quote"],
    consumidor: ["/search"],
    vendedor: ["/search", "/quote", "/orders"],
};
