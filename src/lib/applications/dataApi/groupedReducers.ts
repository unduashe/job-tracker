import { KANBAN_COLUMNS } from "@/lib/applications/constants";
import type { ApplicationRow, GroupedApplications } from "@/lib/applications/types";
import type { NoteRow } from "@/lib/applications/notes/types";

/**
 * Devuelve un `GroupedApplications` vacío preservando el orden de las columnas
 */
export function emptyGroupedApplications(): GroupedApplications {
    return {
        applied: [],
        interview: [],
        offer: [],
        rejected: [],
        ghosted: [],
    };
}

/**
 * Inserta candidatura nueva al inicio de su columna por status
 */
export function applyApplicationCreate(
    state: GroupedApplications,
    application: ApplicationRow,
): GroupedApplications {
    return {
        ...state,
        [application.status]: [application, ...state[application.status]],
    };
}

/**
 * Reemplaza una candidatura por id. Si su status cambió, la mueve a la columna
 * correspondiente preservando el resto del estado
 */
export function applyApplicationUpdate(
    state: GroupedApplications,
    application: ApplicationRow,
): GroupedApplications {
    let removedFromStatus: keyof GroupedApplications | null = null;
    let previousNotes: NoteRow[] | undefined;
    const next: GroupedApplications = {
        applied: [...state.applied],
        interview: [...state.interview],
        offer: [...state.offer],
        rejected: [...state.rejected],
        ghosted: [...state.ghosted],
    };

    for (const column of KANBAN_COLUMNS) {
        const list = next[column.status];
        const index = list.findIndex((item) => item.id === application.id);

        if (index !== -1) {
            previousNotes = list[index].notes;
            list.splice(index, 1);
            removedFromStatus = column.status;
            break;
        }
    }

    const merged: ApplicationRow = {
        ...application,
        notes: application.notes ?? previousNotes ?? [],
    };

    if (removedFromStatus === application.status) {
        // Mantenemos posición original si el status no cambió
        const originalList = state[application.status];
        const originalIndex = originalList.findIndex((item) => item.id === application.id);
        const target = next[application.status];
        const insertAt = originalIndex >= 0 ? originalIndex : 0;
        target.splice(insertAt, 0, merged);
        return next;
    }

    next[application.status] = [merged, ...next[application.status]];
    return next;
}

/**
 * Elimina candidatura por id
 */
export function applyApplicationDelete(
    state: GroupedApplications,
    id: string,
): GroupedApplications {
    const next: GroupedApplications = { ...state };

    for (const column of KANBAN_COLUMNS) {
        const list = state[column.status];
        const filtered = list.filter((item) => item.id !== id);

        if (filtered.length !== list.length) {
            next[column.status] = filtered;
            break;
        }
    }

    return next;
}

// Función auxiliar para buscar una nota
function withApplicationNotes(
    state: GroupedApplications,
    applicationId: string,
    transform: (notes: NoteRow[]) => NoteRow[],
): GroupedApplications {
    const next: GroupedApplications = { ...state };

    for (const column of KANBAN_COLUMNS) {
        const list = state[column.status];
        const index = list.findIndex((application) => application.id === applicationId);

        if (index === -1) {
            continue;
        }

        const target = list[index];
        const updated: ApplicationRow = {
            ...target,
            notes: transform(target.notes ?? []),
        };

        next[column.status] = [
            ...list.slice(0, index),
            updated,
            ...list.slice(index + 1),
        ];
        return next;
    }

    return state;
}

/**
 * Añade una nota a la candidatura asociada
 */
export function applyNoteCreate(
    state: GroupedApplications,
    applicationId: string,
    note: NoteRow,
): GroupedApplications {
    return withApplicationNotes(state, applicationId, (notes) => [note, ...notes]);
}

/**
 * Actualiza la nota dentro de su candidatura asociada
 */
export function applyNoteUpdate(
    state: GroupedApplications,
    note: NoteRow,
): GroupedApplications {
    return withApplicationNotes(state, note.application_id, (notes) =>
        notes.map((current) => (current.id === note.id ? note : current)),
    );
}

/**
 * Elimina una nota por id de la candidatura asociada
 */
export function applyNoteDelete(
    state: GroupedApplications,
    applicationId: string,
    noteId: string,
): GroupedApplications {
    return withApplicationNotes(state, applicationId, (notes) =>
        notes.filter((note) => note.id !== noteId),
    );
}
