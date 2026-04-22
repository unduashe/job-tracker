"use client";

import type { GroupedApplications } from "@/lib/applications/types";
import { KanbanColumn } from "@/components/dashboard/KanbanColumn";

type KanbanBoardProps = {
    groupedApplications: GroupedApplications;
};

/**
 * Renderiza la estructura base del tablero Kanban.
 */
export function KanbanBoard({ groupedApplications }: KanbanBoardProps) {
    return (
        <section className="flex h-full w-full gap-4 overflow-x-auto pb-2">
            <KanbanColumn title="Aplicado" status="applied" applications={groupedApplications.applied} />
            <KanbanColumn title="Entrevista" status="interview" applications={groupedApplications.interview} />
            <KanbanColumn title="Oferta" status="offer" applications={groupedApplications.offer} />
            <KanbanColumn title="Rechazado" status="rejected" applications={groupedApplications.rejected} />
            <KanbanColumn title="Archivado" status="archived" applications={groupedApplications.archived} />
        </section>
    );
}
