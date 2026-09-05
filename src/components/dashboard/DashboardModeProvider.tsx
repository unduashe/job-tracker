"use client";

import { createContext, useContext, useMemo } from "react";
import type { DashboardSession } from "@/lib/auth/getDashboardSession";

type DashboardModeContextValue = DashboardSession;

const DashboardModeContext = createContext<DashboardModeContextValue | null>(null);

type DashboardModeProviderProps = {
    session: DashboardSession;
    children: React.ReactNode;
};

/**
 * Provee el modo (auth/guest) y datos básicos de sesión al dashboard.
 *
 * El valor expuesto es estable durante toda la sesión: cambia solo cuando el
 * usuario navega (login/logout disparan un nuevo render del Server Component).
 */
export function DashboardModeProvider({ session, children }: DashboardModeProviderProps) {
    const value = useMemo<DashboardModeContextValue>(() => session, [session]);

    return (
        <DashboardModeContext.Provider value={value}>
            {children}
        </DashboardModeContext.Provider>
    );
}

/**
 * Función para acceder al modo y los datos de sesión.
 * Si se usa fuera del provider, se lanza un error.
 */
export function useDashboardMode(): DashboardModeContextValue {
    const context = useContext(DashboardModeContext);

    if (!context) {
        throw new Error("useDashboardMode debe usarse dentro de DashboardModeProvider");
    }

    return context;
}
