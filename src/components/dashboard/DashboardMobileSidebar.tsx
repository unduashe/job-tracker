"use client";

import { logoutAction } from "@/app/dashboard/actions";
import { useDashboardResponsive } from "@/components/dashboard/DashboardResponsiveProvider";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { CloseIcon, LogOutIcon } from "@/components/ui/icons";
import { KANBAN_COLUMNS } from "@/lib/applications/constants";
import type { ApplicationStatus } from "@/lib/applications/schema";

type DashboardMobileSidebarProps = {
    email: string;
};

/**
 * Sidebar móvil con selector de columna activa y cierre de sesión.
 */
export function DashboardMobileSidebar({ email }: DashboardMobileSidebarProps) {
    const {
        activeStatus,
        setActiveStatus,
        isMobileSidebarOpen,
        closeMobileSidebar,
    } = useDashboardResponsive();

    const handleSelectStatus = (status: ApplicationStatus) => {
        if (status === activeStatus) {
            return;
        }

        setActiveStatus(status);
        closeMobileSidebar();
    };

    return (
        <div className="lg:hidden">
            <button
                type="button"
                aria-label="Cerrar menú"
                onClick={closeMobileSidebar}
                className={`fixed inset-0 z-[58] bg-foreground/35 transition-opacity duration-300 ease-out ${
                    isMobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            <aside
                className={`fixed inset-y-0 right-0 z-[60] flex w-full max-w-xs flex-col border-l border-border-subtle bg-surface-panel p-4 transition-transform duration-300 ease-out ${
                    isMobileSidebarOpen
                        ? "translate-x-0 shadow-modal pointer-events-auto"
                        : "translate-x-full shadow-none pointer-events-none"
                }`}
                aria-hidden={!isMobileSidebarOpen}
            >
                <div className="relative mb-4 min-h-8 border-b border-border-subtle pb-3">
                    <p className="hidden truncate pr-10 text-sm font-semibold text-foreground max-md:block">
                        Hola {email}
                    </p>
                    <IconButton
                        onClick={closeMobileSidebar}
                        ariaLabel="Cerrar panel"
                        icon={<CloseIcon />}
                        className="absolute right-0 top-0 text-foreground-muted hover:cursor-pointer hover:bg-surface-muted hover:text-foreground"
                    />
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto">
                    {KANBAN_COLUMNS.map((column) => {
                        const isActive = column.status === activeStatus;

                        return (
                            <button
                                key={column.status}
                                type="button"
                                onClick={() => handleSelectStatus(column.status)}
                                aria-current={isActive ? "page" : undefined}
                                className={`w-full rounded-md border px-3 py-2 text-left text-sm font-medium transition-colors ${
                                    isActive
                                        ? "border-brand-100 bg-brand-50 text-brand-700"
                                        : "border-border-subtle bg-surface-card text-foreground hover:cursor-pointer hover:border-brand-100 hover:bg-brand-50"
                                }`}
                            >
                                {column.title}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-4 flex justify-end border-t border-border-subtle pt-4">
                    <form action={logoutAction}>
                        <Button
                            type="submit"
                            variant="secondary"
                            className="inline-flex items-center gap-2"
                        >
                            <LogOutIcon size={18} />
                            Cerrar sesión
                        </Button>
                    </form>
                </div>
            </aside>
        </div>
    );
}
