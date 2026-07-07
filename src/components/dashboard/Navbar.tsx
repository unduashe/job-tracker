"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/dashboard/actions";
import { DashboardMobileSidebar } from "@/components/dashboard/DashboardMobileSidebar";
import { useDashboardResponsive } from "@/components/dashboard/DashboardResponsiveProvider";
import { useDashboardMode } from "@/components/dashboard/DashboardModeProvider";
import { IconButton } from "@/components/ui/IconButton";
import { LogOutIcon, MenuIcon, SettingsIcon } from "@/components/ui/icons";

/**
 * Barra superior del dashboard.
 * Adapta su contenido (saludo, acción primaria) al modo activo
 * leído desde el `DashboardModeProvider`.
 */
export function Navbar() {
    const { openMobileSidebar } = useDashboardResponsive();
    const session = useDashboardMode();
    const pathname = usePathname();
    const isProfileActive = pathname === "/dashboard/profile";

    return (
        <>
            <header className="border-b border-brand-700 bg-brand-700 text-white shadow-sm">
                <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
                    {session.mode === "auth" && (
                        <p className="hidden truncate text-sm font-semibold text-white sm:text-base md:block">
                            Hola {session.email}
                        </p>
                    )}

                    {session.mode === "auth" ? (
                        <div className="ml-auto hidden items-center gap-1 lg:flex">
                            <Link
                                href="/dashboard/profile"
                                aria-label="Información de perfil"
                                aria-current={isProfileActive ? "page" : undefined}
                                className={`inline-flex items-center justify-center rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-100 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700 ${
                                    isProfileActive
                                        ? "bg-white/20 text-white"
                                        : "text-white hover:bg-white/10"
                                }`}
                            >
                                <SettingsIcon />
                            </Link>
                            <form action={logoutAction}>
                                <IconButton
                                    type="submit"
                                    ariaLabel="Cerrar sesión"
                                    icon={<LogOutIcon />}
                                    className="inline-flex items-center justify-center p-2 text-white hover:cursor-pointer hover:bg-white/10 focus-visible:ring-accent-100 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700"
                                />
                            </form>
                        </div>
                    ) : (
                        <div className="ml-auto hidden items-center gap-2 lg:flex">
                            <Link
                                href="/login"
                                className="rounded-md px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-100 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700"
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-100 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700"
                            >
                                Crear cuenta
                            </Link>
                        </div>
                    )}

                    <IconButton
                        onClick={openMobileSidebar}
                        ariaLabel="Abrir menú"
                        icon={<MenuIcon />}
                        className="ml-auto inline-flex items-center justify-center p-2 text-white hover:cursor-pointer hover:bg-white/10 focus-visible:ring-accent-100 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700 lg:hidden"
                    />
                </div>
            </header>
            <DashboardMobileSidebar />
        </>
    );
}
