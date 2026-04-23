import type { ApplicationStatus } from "./schema";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
    applied: "Aplicado",
    interview: "Entrevista",
    offer: "Oferta",
    rejected: "Rechazado",
    archived: "Archivado",
};

export const KANBAN_COLUMNS: ReadonlyArray<{ title: string; status: ApplicationStatus }> = [
    { title: "Aplicado", status: "applied" },
    { title: "Entrevista", status: "interview" },
    { title: "Oferta", status: "offer" },
    { title: "Rechazado", status: "rejected" },
    { title: "Archivado", status: "archived" },
];
