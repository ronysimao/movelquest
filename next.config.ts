import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ============================================
  // Security Headers
  // Compliance: OWASP, HSTS, CSP, X-Frame-Options
  // ============================================
  async headers() {
    return [
      {
        // Aplicar a TODAS as rotas
        source: "/(.*)",
        headers: [
          // HSTS — força HTTPS por 1 ano + includeSubDomains + preload
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // CSP — Content Security Policy restritiva
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + inline (Next.js precisa) + eval (dev only seria ideal, mas Next.js usa em prod também)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Estilos: self + inline (CSS-in-JS)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fontes: self + Google Fonts
              "font-src 'self' https://fonts.gstatic.com data:",
              // Imagens: self + Supabase Storage + Cloudinary + data URIs
              `img-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || ""} https://res.cloudinary.com data: blob:`,
              // Conexões: self + Supabase + Cloudinary + Google AI
              `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || ""} https://*.supabase.co wss://*.supabase.co https://api.cloudinary.com https://generativelanguage.googleapis.com`,
              // Frames: nenhum (prevenção contra clickjacking)
              "frame-ancestors 'none'",
              // Forms: apenas para self
              "form-action 'self'",
              // Base URI: apenas self
              "base-uri 'self'",
              // Object: bloquear Flash/Java applets
              "object-src 'none'",
            ].join("; "),
          },
          // X-Frame-Options — prevenção contra clickjacking (backup do frame-ancestors)
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // X-Content-Type-Options — previne MIME sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // X-XSS-Protection — ativa filtro XSS do browser (legacy, mas não custa)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer-Policy — controla vazamento de URLs
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions-Policy — restringe APIs do browser
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // X-DNS-Prefetch-Control — controla prefetch de DNS
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },

  // Forçar HTTPS em produção (desativa HTTP)
  ...(process.env.NODE_ENV === "production"
    ? {
        // Next.js 16+ não tem redirects para HTTPS nativo,
        // mas HSTS + deploy em plataforma com HTTPS (Vercel, etc.) resolve
      }
    : {}),
};

export default nextConfig;
