import type { ApplicationStatus } from "./schema";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
    applied: "Aplicado",
    interview: "Entrevista",
    offer: "Oferta",
    rejected: "Rechazado",
    ghosted: "Sin respuesta",
};

export const KANBAN_COLUMNS: ReadonlyArray<{ title: string; status: ApplicationStatus }> = [
    { title: "Aplicado", status: "applied" },
    { title: "Entrevista", status: "interview" },
    { title: "Oferta", status: "offer" },
    { title: "Rechazado", status: "rejected" },
    { title: "Sin respuesta", status: "ghosted" },
];
