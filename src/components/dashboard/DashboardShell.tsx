"use client";

import { useMemo } from "react";
import { DashboardModeProvider } from "@/components/dashboard/DashboardModeProvider";
import { DashboardResponsiveProvider } from "@/components/dashboard/DashboardResponsiveProvider";
import { Navbar } from "@/components/dashboard/Navbar";
import { createServerDataApi } from "@/lib/applications/dataApi/serverDataApi";
import type { DashboardSession } from "@/lib/auth/getDashboardSession";
import { GroupedApplications } from "@/lib/applications/types";
import { DashboardDataProvider } from "./DashboardDataProvider";

type DashboardShellProps = {
    session: DashboardSession;
    children: React.ReactNode;
};

/**
 * Shell visual del dashboard (cliente): modo de sesión, layout responsive y navbar.
 * El provider de datos del kanban auth vive en `AuthDataBoundary`, montado por la page.
 */
export function DashboardShell({
    session,
    children,
}: DashboardShellProps) {
    return (
        <DashboardModeProvider session={session}>
            <DashboardResponsiveProvider>
                <div className="flex h-dvh flex-col overflow-hidden bg-surface-canvas">
                    <Navbar />
                    <main className="flex min-h-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
                        {children}
                    </main>
                </div>
            </DashboardResponsiveProvider>
        </DashboardModeProvider>
    );
}

type AuthDataBoundaryProps = {
    initialGroupedApplications: GroupedApplications;
    children: React.ReactNode;
};

/**
 * Boundary cliente del kanban autenticado: adapta datos iniciales del Server Component
 * a `DashboardDataProvider` vía `createServerDataApi`.
 * Exportado desde este módulo `"use client"` para poder usarlo desde la page server.
 */
export function AuthDataBoundary({ initialGroupedApplications, children }: AuthDataBoundaryProps) {
    const api = useMemo(
        () => createServerDataApi(initialGroupedApplications),
        [initialGroupedApplications],
    );
    
    return <DashboardDataProvider api={api}>{children}</DashboardDataProvider>;
}