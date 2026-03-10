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
    const [sidebarOpen, setSidebarOpen] = useState(false); // Default to closed on mobile
    const [loggingOut, setLoggingOut] = useState(false);

    // Responsive sidebar handling
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-50",
                    "fixed inset-y-0 left-0 lg:static lg:h-auto",
                    sidebarOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:w-20 lg:translate-x-0"
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
                    className="mx-4 mb-4 p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors self-end hidden lg:block"
                    title={sidebarOpen ? "Recolher menu" : "Expandir menu"}
                >
                    <span className="material-symbols-outlined text-xl">
                        {sidebarOpen ? "menu_open" : "menu"}
                    </span>
                </button>

                {/* Mobile Close */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors lg:hidden"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
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
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 w-full col-span-full">
                    <div className="flex items-center gap-2 text-sm">
                        <button
                            className="lg:hidden mr-2 text-slate-400 hover:text-white flex items-center justify-center p-1 rounded-md"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <span className="text-slate-500 hidden sm:inline">Admin</span>
                        <span className="material-symbols-outlined text-slate-600 text-sm hidden sm:inline">
                            chevron_right
                        </span>
                        <span className="font-medium text-white truncate max-w-[150px] sm:max-w-none">
                            Gerenciamento
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
                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
            </main>
        </div>
    );
}
