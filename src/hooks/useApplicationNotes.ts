"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useDashboardData } from "@/components/dashboard/DashboardDataProvider";
import { sortNotesByDate } from "@/lib/applications/notes/utils";
import type { NoteRow } from "@/lib/applications/notes/types";

type NoteEditorState =
    | { type: "create"; subject: string; content: string }
    | { type: "edit"; noteId: string; subject: string; content: string };

type OnNotesError = (message: string, details: string[]) => void;

type UseApplicationNotesResult = {
    notes: NoteRow[];
    noteEditor: NoteEditorState | null;
    setNoteEditor: Dispatch<SetStateAction<NoteEditorState | null>>;
    isSavingNote: boolean;
    saveNote: () => Promise<void>;
    deleteNote: (noteId: string) => Promise<boolean>;
};

/**
 * Gestiona el estado y operaciones CRUD de notas para la candidatura activa.
 * Delega la persistencia en el `DashboardDataProvider`, que ya mantiene el
 * estado global agrupado; aquí sólo se reflejan las notas de la candidatura
 * actual y se controla el editor inline.
 */
export function useApplicationNotes(
    applicationId: string | undefined,
    initialNotes: NoteRow[],
    onError: OnNotesError,
): UseApplicationNotesResult {
    const {
        createNote: createNoteInStore,
        updateNote: updateNoteInStore,
        deleteNote: deleteNoteInStore,
    } = useDashboardData();
    const [notes, setNotes] = useState<NoteRow[]>(() => sortNotesByDate(initialNotes));
    const [noteEditor, setNoteEditor] = useState<NoteEditorState | null>(null);
    const [isSavingNote, setIsSavingNote] = useState(false);

    useEffect(() => {
        // Esta sincronización es necesaria cuando el modal reutiliza el mismo componente entre candidaturas.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNotes(sortNotesByDate(initialNotes));
        setNoteEditor(null);
        setIsSavingNote(false);
    }, [applicationId, initialNotes]);

    const saveNote = async () => {
        if (!applicationId || !noteEditor || isSavingNote) {
            return;
        }

        setIsSavingNote(true);

        if (noteEditor.type === "create") {
            const result = await createNoteInStore(applicationId, {
                subject: noteEditor.subject,
                content: noteEditor.content,
            });

            if (result.success) {
                setNoteEditor(null);
                setIsSavingNote(false);
                return;
            }

            onError(result.message, result.details);
            setIsSavingNote(false);
            return;
        }

        const result = await updateNoteInStore(noteEditor.noteId, {
            subject: noteEditor.subject,
            content: noteEditor.content,
        });

        if (result.success) {
            setNoteEditor(null);
            setIsSavingNote(false);
            return;
        }

        onError(result.message, result.details);
        setIsSavingNote(false);
    };

    const deleteNote = async (noteId: string): Promise<boolean> => {
        if (!applicationId || isSavingNote) {
            return false;
        }

        setIsSavingNote(true);
        const result = await deleteNoteInStore(applicationId, noteId);

        if (result.success) {
            setNoteEditor((prevEditor) => {
                if (prevEditor?.type === "edit" && prevEditor.noteId === noteId) {
                    return null;
                }

                return prevEditor;
            });
            setIsSavingNote(false);
            return true;
        }

        onError(result.message, result.details);
        setIsSavingNote(false);
        return false;
    };

    return {
        notes,
        noteEditor,
        setNoteEditor,
        isSavingNote,
        saveNote,
        deleteNote,
    };
}
