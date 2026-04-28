"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { createNoteAction, deleteNoteAction, updateNoteAction } from "@/app/dashboard/actions";
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
 */
export function useApplicationNotes(
    applicationId: string | undefined,
    initialNotes: NoteRow[],
    onError: OnNotesError,
): UseApplicationNotesResult {
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
        const formData = new FormData();
        formData.set("subject", noteEditor.subject);
        formData.set("content", noteEditor.content);

        if (noteEditor.type === "create") {
            formData.set("applicationId", applicationId);
            const result = await createNoteAction(formData);

            if (result.success) {
                setNotes((prevNotes) => sortNotesByDate([result.note, ...prevNotes]));
                setNoteEditor(null);
                setIsSavingNote(false);
                return;
            }

            onError(result.message, result.details);
            setIsSavingNote(false);
            return;
        }

        formData.set("noteId", noteEditor.noteId);
        const result = await updateNoteAction(formData);

        if (result.success) {
            setNotes((prevNotes) =>
                sortNotesByDate(
                    prevNotes.map((note) => (note.id === result.note.id ? result.note : note)),
                ),
            );
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
        const result = await deleteNoteAction(noteId);

        if (result.success) {
            setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
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
