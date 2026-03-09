"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

const NAV_ITEMS = [
    { icon: "dashboard", label: "Dashboard", href: "/admin" },
    { icon: "upload_file", label: "Upload de Dados", href: "/admin", section: "upload" },
    { icon: "history", label: "Histórico de Cargas", href: "/admin", section: "history" },
    { icon: "search", label: "Catálogo", href: "/search" },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<Profile | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.profile);
                }
            } catch {
                // Silently fail — middleware handles auth
            }
        }
        fetchUser();
    }, []);

    async function handleLogout() {
        setLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
        } catch {
            setLoggingOut(false);
        }
    }

    return (
        <div className="flex min-h-screen overflow-hidden">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-slate-900/50 border-r border-slate-800 flex flex-col transition-all duration-300",
                    sidebarOpen ? "w-72" : "w-20"
                )}
            >
                {/* Logo */}
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                        <span className="material-symbols-outlined">database</span>
                    </div>
                    {sidebarOpen && (
                        <div className="animate-fade-in">
                            <h1 className="text-base font-bold leading-tight text-white">
                                MóvelQuest
                            </h1>
                            <p className="text-xs text-slate-400">Admin Console</p>
                        </div>
                    )}
                </div>

                {/* Toggle */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="mx-4 mb-4 p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors self-end"
                    title={sidebarOpen ? "Recolher menu" : "Expandir menu"}
                >
                    <span className="material-symbols-outlined text-xl">
                        {sidebarOpen ? "menu_open" : "menu"}
                    </span>
                </button>

                {/* Nav */}
                <nav className="flex-1 px-4 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.href === pathname && !item.section;
                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                                    isActive
                                        ? "text-primary bg-primary/10"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                                title={!sidebarOpen ? item.label : undefined}
                            >
                                <span className="material-symbols-outlined shrink-0">
                                    {item.icon}
                                </span>
                                {sidebarOpen && <span>{item.label}</span>}
                            </a>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex items-center gap-3 px-3 py-2 w-full text-slate-400 hover:text-red-400 transition-colors font-medium rounded-lg hover:bg-slate-800/50 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-red-500 shrink-0">
                            {loggingOut ? "sync" : "logout"}
                        </span>
                        {sidebarOpen && (
                            <span>{loggingOut ? "Saindo..." : "Sair do Sistema"}</span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-bg-dark/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500">Admin</span>
                        <span className="material-symbols-outlined text-slate-600 text-sm">
                            chevron_right
                        </span>
                        <span className="font-medium text-white">
                            Gerenciamento de Dados
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="size-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="h-8 w-[1px] bg-slate-800" />
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-white">
                                    {user?.nome || "Carregando..."}
                                </p>
                                <p className="text-xs text-slate-500 capitalize">
                                    {user?.perfil || ""}
                                </p>
                            </div>
                            <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                {user?.nome?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 max-w-7xl mx-auto w-full">{children}</div>
            </main>
        </div>
    );
}
