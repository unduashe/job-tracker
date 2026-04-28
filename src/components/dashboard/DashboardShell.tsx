"use client";

import { DashboardResponsiveProvider } from "@/components/dashboard/DashboardResponsiveProvider";
import { Navbar } from "@/components/dashboard/Navbar";

type DashboardShellProps = {
    email: string;
    children: React.ReactNode;
};

/**
 * Estructura cliente del dashboard para estado responsive compartido.
 */
export function DashboardShell({ email, children }: DashboardShellProps) {
    return (
        <DashboardResponsiveProvider>
            <div className="flex h-dvh flex-col overflow-hidden bg-surface-canvas">
                <Navbar email={email} />
                <main className="flex min-h-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </DashboardResponsiveProvider>
    );
}
