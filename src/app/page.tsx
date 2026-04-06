"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao fazer login");
        return;
      }

      // Redireciona todos os usuários para a Home
      router.push("/home");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/assets/fundo.png")' }}
    >
      {/* Escurecimento sutil do fundo para garantir contraste */}
      <div className="absolute inset-0 bg-slate-900/60" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Branding */}
        <div className="flex flex-col items-center mb-10">
          {/* <div className="bg-primary/10 p-3 rounded-xl mb-4">
            <span className="material-icons-round text-primary text-4xl">
              chair
            </span>
          </div> */}
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Asisto <span className="text-primary">Fab</span>
          </h1>
          <p className="text-slate-200 font-medium mt-2 text-center drop-shadow-sm">
            O Sistema Operacional Comercial da Indústria Moveleira
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden">
          {/* Decorative Header */}
          <div className="h-28 w-full bg-slate-800/40 flex items-center justify-center gap-3 border-b border-slate-700/50 group">
            <span className="text-slate-400 text-xs font-medium ml-2">by</span>
            <div className="relative w-48 h-14 transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/assets/ASISTO-H-AZUL-BRANCO.png"
                alt="Asisto Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold mb-6 text-white">
              Acesse sua conta
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm animate-fade-in">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                  E-mail corporativo
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@asisto.com.br"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-700 bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-300">
                    Senha
                  </label>
                  <a
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    href="#"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    className="w-full pl-11 pr-11 py-3 rounded-lg border border-slate-700 bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Validation Hint */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="material-symbols-outlined text-sm">info</span>
                <span>Sua senha deve conter pelo menos 8 caracteres.</span>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-slate-700 text-primary focus:ring-primary bg-slate-900"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-slate-400 cursor-pointer"
                >
                  Manter conectado
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin-slow text-xl">
                      sync
                    </span>
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <span className="material-symbols-outlined">login</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col items-center gap-4">
              <p className="text-sm text-slate-400">Não possui uma conta?</p>
              <Link
                href="/cadastro"
                className="text-sm font-bold text-primary border border-primary/20 bg-primary/5 px-6 py-2 rounded-full hover:bg-primary/10 transition-colors cursor-pointer"
              >
                Criar conta
              </Link>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center space-y-3">
          <p className="text-sm text-slate-200 font-semibold drop-shadow-sm">
            © 2026 Asisto Fab. Todos os direitos reservados.
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-300 font-medium bg-slate-900/40 backdrop-blur-sm py-2 px-4 rounded-full w-fit mx-auto border border-white/5">
            <a className="hover:text-primary transition-colors cursor-pointer" href="#">
              Termos de Uso
            </a>
            <span className="text-slate-500">•</span>
            <a className="hover:text-primary transition-colors cursor-pointer" href="#">
              Privacidade
            </a>
            <span className="text-slate-500">•</span>
            <a className="hover:text-primary transition-colors cursor-pointer" href="#">
              Suporte
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
