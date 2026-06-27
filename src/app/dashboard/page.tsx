"use client";

import { useDashboardMode } from "@/components/dashboard/DashboardModeProvider";
import { GuestKanbanBoard } from "@/components/dashboard/GuestKanbanBoard";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";

/**
 * Página del dashboard.
 * El modo (auth/guest) se lee del `DashboardModeProvider`, sembrado por el layout.
 * En modo auth renderiza `KanbanBoard`; en guest, `GuestKanbanBoard` con carga
 * cliente vía `next/dynamic({ ssr: false })` para leer localStorage.
 */
export default function DashboardPage() {
    const session = useDashboardMode();

    return (
        <section className="flex h-full min-h-0 w-full">
            {session.mode === "guest" ? <GuestKanbanBoard /> : <KanbanBoard />}
        </section>
    );
}
