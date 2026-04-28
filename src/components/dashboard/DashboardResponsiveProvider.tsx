"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ApplicationStatus } from "@/lib/applications/schema";
import { KANBAN_COLUMNS } from "@/lib/applications/constants";

type DashboardResponsiveContextValue = {
    activeStatus: ApplicationStatus;
    setActiveStatus: (status: ApplicationStatus) => void;
    isMobileSidebarOpen: boolean;
    openMobileSidebar: () => void;
    closeMobileSidebar: () => void;
};

const DashboardResponsiveContext = createContext<DashboardResponsiveContextValue | null>(null);

type DashboardResponsiveProviderProps = {
    children: React.ReactNode;
};

/**
 * Provee estado responsive compartido del dashboard.
 */
export function DashboardResponsiveProvider({ children }: DashboardResponsiveProviderProps) {
    const [activeStatus, setActiveStatus] = useState<ApplicationStatus>(KANBAN_COLUMNS[0].status);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const value = useMemo<DashboardResponsiveContextValue>(
        () => ({
            activeStatus,
            setActiveStatus,
            isMobileSidebarOpen,
            openMobileSidebar: () => setIsMobileSidebarOpen(true),
            closeMobileSidebar: () => setIsMobileSidebarOpen(false),
        }),
        [activeStatus, isMobileSidebarOpen],
    );

    return (
        <DashboardResponsiveContext.Provider value={value}>
            {children}
        </DashboardResponsiveContext.Provider>
    );
}

/**
 * Hook para consumir estado responsive del dashboard.
 */
export function useDashboardResponsive() {
    const context = useContext(DashboardResponsiveContext);

    if (!context) {
        throw new Error("useDashboardResponsive debe usarse dentro de DashboardResponsiveProvider");
    }

    return context;
}
