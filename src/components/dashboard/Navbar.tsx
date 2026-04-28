"use client";

import { logoutAction } from "@/app/dashboard/actions";
import { DashboardMobileSidebar } from "@/components/dashboard/DashboardMobileSidebar";
import { useDashboardResponsive } from "@/components/dashboard/DashboardResponsiveProvider";
import { IconButton } from "@/components/ui/IconButton";
import { LogOutIcon, MenuIcon } from "@/components/ui/icons";

type NavbarProps = {
    email: string;
};

/**
 * Barra superior del dashboard.
 */
export function Navbar({ email }: NavbarProps) {
    const { openMobileSidebar } = useDashboardResponsive();

    return (
        <>
            <header className="border-b border-brand-700 bg-brand-700 text-white shadow-sm">
                <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
                    <p className="hidden truncate text-sm font-semibold text-white sm:text-base md:block">
                        Hola {email}
                    </p>

                    <form action={logoutAction} className="ml-auto hidden lg:block">
                        <IconButton
                            type="submit"
                            ariaLabel="Cerrar sesión"
                            icon={<LogOutIcon />}
                            className="inline-flex items-center justify-center p-2 text-white hover:cursor-pointer hover:bg-white/10 focus-visible:ring-accent-100 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700"
                        />
                    </form>

                    <IconButton
                        onClick={openMobileSidebar}
                        ariaLabel="Abrir menú"
                        icon={<MenuIcon />}
                        className="ml-auto inline-flex items-center justify-center p-2 text-white hover:cursor-pointer hover:bg-white/10 focus-visible:ring-accent-100 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700 lg:hidden"
                    />
                </div>
            </header>
            <DashboardMobileSidebar email={email} />
        </>
    );
}
