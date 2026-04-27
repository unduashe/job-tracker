import type { NoteRow } from "./types";

/**
 * Ordena una lista de notas por fecha de actualización descendente.
 */
export function sortNotesByDate(notes: NoteRow[]): NoteRow[] {
    return [...notes].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
}
