"use client";

import { useMemo } from "react";
import { DashboardDataProvider } from "@/components/dashboard/DashboardDataProvider";
import { DashboardModeProvider } from "@/components/dashboard/DashboardModeProvider";
import { DashboardResponsiveProvider } from "@/components/dashboard/DashboardResponsiveProvider";
import { GuestDataMigrationPrompt } from "@/components/dashboard/GuestDataMigrationPrompt";
import { Navbar } from "@/components/dashboard/Navbar";
import { createServerDataApi } from "@/lib/applications/dataApi/serverDataApi";
import type { DashboardSession } from "@/lib/auth/getDashboardSession";
import type { GroupedApplications } from "@/lib/applications/types";

type DashboardShellProps = {
    session: DashboardSession;
    /**
     * Datos iniciales agrupados ya pre-cargados por el layout en modo auth.
     * En modo guest se ignora: el provider de datos lo monta `GuestKanbanBoard`
     * con `localDataApi` desde dentro de un boundary `dynamic({ ssr: false })`.
     */
    initialGroupedApplications: GroupedApplications;
    children: React.ReactNode;
};

/**
 * Estructura cliente del dashboard.
 * Compone los providers necesarios (mode + responsive + data) y la shell visual.
 */
export function DashboardShell({
    session,
    initialGroupedApplications,
    children,
}: DashboardShellProps) {
    const shellLayout = (
        <DashboardResponsiveProvider>
            <div className="flex h-dvh flex-col overflow-hidden bg-surface-canvas">
                <Navbar />
                <main className="flex min-h-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </DashboardResponsiveProvider>
    );

    if (session.mode === "auth") {
        return (
            <DashboardModeProvider session={session}>
                <AuthDataBoundary initialGroupedApplications={initialGroupedApplications}>
                    {shellLayout}
                    <GuestDataMigrationPrompt />
                </AuthDataBoundary>
            </DashboardModeProvider>
        );
    }

    return (
        <DashboardModeProvider session={session}>
            {shellLayout}
        </DashboardModeProvider>
    );
}

type AuthDataBoundaryProps = {
    initialGroupedApplications: GroupedApplications;
    children: React.ReactNode;
};

/**
 * Monta el `DashboardDataProvider` con el adaptador Supabase y los datos
 * iniciales cargados por el Server Component.
 */
function AuthDataBoundary({ initialGroupedApplications, children }: AuthDataBoundaryProps) {
    const api = useMemo(
        () => createServerDataApi(initialGroupedApplications),
        [initialGroupedApplications],
    );

    return <DashboardDataProvider api={api}>{children}</DashboardDataProvider>;
}
