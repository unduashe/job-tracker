import { z } from "zod";
import { APPLICATION_STATUS } from "@/lib/applications/schema";
import { emptyGroupedApplications } from "@/lib/applications/dataApi/groupedReducers";
import type { ApplicationRow, GroupedApplications } from "@/lib/applications/types";
import type { NoteRow } from "@/lib/applications/notes/types";

/**
 * Clave para versionar localStorage, para que, si se cambia el dato esperado,
 * se pueda modificar la versión y se evite trabajar sobre datos hasta que se actualice
 * la forma de tratarlos.
 */
const STORAGE_KEY = "job-tracker:v1:applications";

const noteRowSchema: z.ZodType<NoteRow> = z.object({
    id: z.string(),
    application_id: z.string(),
    subject: z.string(),
    content: z.string(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
});

const applicationRowSchema: z.ZodType<ApplicationRow> = z.object({
    id: z.string(),
    user_id: z.string(),
    company: z.string(),
    role: z.string().nullable(),
    description: z.string().nullable(),
    status: z.enum(APPLICATION_STATUS),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
    notes: z.array(noteRowSchema).optional(),
});

const persistedShapeSchema = z.object({
    applications: z.array(applicationRowSchema),
});

export type PersistedSnapshot = {
    applications: ApplicationRow[];
};

/**
 * Lectura síncrona del snapshot local.
 * - Devuelve estado vacío si no hay datos, si la lectura falla, o si los
 *   datos no coinciden con el schema
 * - Limpia la clave si el parse falla, para evitar errores recurrentes.
 */
export function readPersistedSnapshot(): PersistedSnapshot {
    if (typeof window === "undefined") {
        return { applications: [] };
    }

    let raw: string | null = null;
    try {
        raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        console.error("readPersistedSnapshot: error leyendo localStorage", error);
        return { applications: [] };
    }

    if (!raw) {
        return { applications: [] };
    }

    try {
        const parsed = persistedShapeSchema.parse(JSON.parse(raw));
        return parsed;
    } catch (error) {
        console.error(
            "readPersistedSnapshot: snapshot inválido en localStorage, limpiando",
            error,
        );
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch {
            /* ignore */
        }
        return { applications: [] };
    }
}

/**
 * Escribe el snapshot completo. La forma persistida es una lista plana de
 * `ApplicationRow` con sus `notes` embebidas para el renderizado, igual que devuelve Supabase
 */
export function writePersistedSnapshot(snapshot: PersistedSnapshot): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (error) {
        console.error("writePersistedSnapshot: error escribiendo localStorage", error);
    }
}

/**
 * Borra el snapshot local, usado tras la importación del usuario al logarse
 */
export function clearPersistedSnapshot(): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error("clearPersistedSnapshot error", error);
    }
}

/**
 * Indica si existe un snapshot no vacío en localStorage con el objetivo
 * de mostrar el modal tras logarse.
 */
export function hasPersistedData(): boolean {
    return readPersistedSnapshot().applications.length > 0;
}

/**
 * Suscribe un callback al evento `storage` para mantener consistencia entre
 * pestañas. Solo dispara cuando el cambio afecta a la clave o cuando
 * la clave se borra desde otra pestaña.
 *
 * Devuelve la función de unsubscribe.
 */
export function subscribeToStorage(callback: () => void): () => void {
    if (typeof window === "undefined") {
        return () => {};
    }

    const handler = (event: StorageEvent) => {
        if (event.key === null || event.key === STORAGE_KEY) {
            callback();
        }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
}

/**
 * Reagrupa por status la lista plana persistida en `GroupedApplications`,
 * orden idéntico al SSR de modo auth (más reciente primero por `updated_at`).
 */
export function snapshotToGrouped(snapshot: PersistedSnapshot): GroupedApplications {
    const grouped = emptyGroupedApplications();
    const sorted = [...snapshot.applications].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );

    for (const application of sorted) {
        grouped[application.status].push(application);
    }

    return grouped;
}

/**
 * Aplana un `GroupedApplications` (el shape que usa el provider) a la lista
 * persistida.
 */
export function groupedToSnapshot(grouped: GroupedApplications): PersistedSnapshot {
    const applications: ApplicationRow[] = [];
    for (const status of Object.keys(grouped) as Array<keyof GroupedApplications>) {
        for (const application of grouped[status]) {
            applications.push(application);
        }
    }
    return { applications };
}
