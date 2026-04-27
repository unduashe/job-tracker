"use client";

import { useState } from "react";
import {
    createNoteAction,
    deleteApplicationAction,
    deleteNoteAction,
    updateNoteAction,
} from "@/app/dashboard/actions";
import { ErrorToast } from "@/components/ErrorToast";
import { Button } from "@/components/ui/Button";
import { DeleteConfirmationPanel } from "@/components/dashboard/DeleteConfirmationPanel";
import { NoteEditorCard, NoteViewCard } from "@/components/dashboard/NoteCards";
import { IconButton } from "@/components/ui/IconButton";
import { CloseIcon, PlusIcon } from "@/components/ui/icons";
import { ApplicationForm } from "@/components/dashboard/ApplicationForm";
import { APPLICATION_STATUS_LABELS } from "@/lib/applications/constants";
import type { NoteRow } from "@/lib/applications/notes/types";
import type { ApplicationRow } from "@/lib/applications/types";

type ApplicationDetailsModalProps = {
    application: ApplicationRow | null;
    isOpen: boolean;
    onClose: () => void;
};

type Mode = "view" | "edit" | "confirmDelete";
type DeleteTarget = { type: "application" } | { type: "note"; noteId: string };
type NoteEditorState =
    | { type: "create"; subject: string; content: string }
    | { type: "edit"; noteId: string; subject: string; content: string };

/**
 * Modal dinámico para visualizar y editar una candidatura.
 */
export function ApplicationDetailsModal({
    application,
    isOpen,
    onClose,
}: ApplicationDetailsModalProps) {
    const [mode, setMode] = useState<Mode>("view");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [notesByApplication, setNotesByApplication] = useState<Record<string, NoteRow[]>>({});
    const [noteEditor, setNoteEditor] = useState<NoteEditorState | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>({ type: "application" });
    const [errorState, setErrorState] = useState<{ title: string; details: string[] } | null>(null);

    const handleClose = () => {
        if (isDeleting || isSavingNote) {
            return;
        }

        setMode("view");
        setIsDeleting(false);
        setIsSavingNote(false);
        setNoteEditor(null);
        setNotesByApplication({});
        setDeleteTarget({ type: "application" });
        setErrorState(null);
        onClose();
    };

    const handleDeleteApplication = async () => {
        if (!application || isDeleting) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteApplicationAction(application.id);

        if (result.success) {
            onClose();
            setMode("view");
            setIsDeleting(false);
            return;
        }

        setErrorState({
            title: "No se pudo eliminar la aplicación",
            details: [result.message ?? "Inténtalo de nuevo en unos segundos."],
        });
        setIsDeleting(false);
    };

    const handleSaveNote = async () => {
        if (!application || !noteEditor || isSavingNote) {
            return;
        }

        setIsSavingNote(true);
        const formData = new FormData();
        formData.set("subject", noteEditor.subject);
        formData.set("content", noteEditor.content);

        if (noteEditor.type === "create") {
            formData.set("applicationId", application.id);
            const result = await createNoteAction(formData);

            if (result.success) {
                setNotesByApplication((prev) => {
                    const baseNotes =
                        prev[application.id] ??
                        [...(application.notes ?? [])].sort(
                            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
                        );

                    return {
                        ...prev,
                        [application.id]: [result.note, ...baseNotes].sort(
                            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
                        ),
                    };
                });
                setNoteEditor(null);
                setIsSavingNote(false);
                return;
            }

            setErrorState({ title: result.message, details: result.details });
            setIsSavingNote(false);
            return;
        }

        formData.set("noteId", noteEditor.noteId);
        const result = await updateNoteAction(formData);

        if (result.success) {
            setNotesByApplication((prev) => {
                const baseNotes =
                    prev[application.id] ??
                    [...(application.notes ?? [])].sort(
                        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
                    );

                return {
                    ...prev,
                    [application.id]: baseNotes
                        .map((note) => (note.id === result.note.id ? result.note : note))
                        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
                };
            });
            setNoteEditor(null);
            setIsSavingNote(false);
            return;
        }

        setErrorState({ title: result.message, details: result.details });
        setIsSavingNote(false);
    };

    const handleConfirmDelete = async () => {
        if (deleteTarget.type === "application") {
            await handleDeleteApplication();
            return;
        }

        if (!application || isDeleting) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteNoteAction(deleteTarget.noteId);

        if (result.success) {
            setNotesByApplication((prev) => {
                const baseNotes =
                    prev[application.id] ??
                    [...(application.notes ?? [])].sort(
                        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
                    );

                return {
                    ...prev,
                    [application.id]: baseNotes.filter((note) => note.id !== deleteTarget.noteId),
                };
            });
            if (noteEditor?.type === "edit" && noteEditor.noteId === deleteTarget.noteId) {
                setNoteEditor(null);
            }
            setDeleteTarget({ type: "application" });
            setMode("view");
            setIsDeleting(false);
            return;
        }

        setErrorState({
            title: "No se pudo eliminar la nota",
            details: [result.message ?? "Inténtalo de nuevo en unos segundos."],
        });
        setIsDeleting(false);
    };

    if (!isOpen || !application) {
        return null;
    }

    const notes = notesByApplication[application.id] ??
        [...(application.notes ?? [])].sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        );

    return (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50 p-4" onClick={handleClose}>
            <div
                className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-900">
                        {mode === "view"
                            ? "Detalle de candidatura"
                            : mode === "edit"
                                ? "Editar candidatura"
                                : "Eliminar"}
                    </h3>
                    <IconButton
                        onClick={handleClose}
                        ariaLabel="Cerrar modal de detalles"
                        icon={<CloseIcon />}
                        disabled={isDeleting || isSavingNote}
                        className="text-zinc-500 hover:cursor-pointer hover:bg-zinc-100 hover:text-zinc-700"
                    />
                </header>

                {mode === "view" ? (
                    <>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm uppercase tracking-wide text-zinc-500">Empresa</p>
                                <p className="text-sm font-semibold text-zinc-900">{application.company}</p>
                            </div>
                            {application.role ? (
                                <div>
                                    <p className="text-sm uppercase tracking-wide text-zinc-500">Puesto</p>
                                    <p className="text-sm italic text-zinc-700">{application.role}</p>
                                </div>
                            ) : null}
                            {application.description ? (
                                <div>
                                    <p className="text-sm uppercase tracking-wide text-zinc-500">Descripción</p>
                                    <p className="text-sm text-zinc-700">{application.description}</p>
                                </div>
                            ) : null}
                            <div>
                                <p className="text-sm uppercase tracking-wide text-zinc-500">Estado</p>
                                <p className="text-sm text-zinc-800">{APPLICATION_STATUS_LABELS[application.status]}</p>
                            </div>
                        </div>

                        <section className="mt-5">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm uppercase tracking-wide text-zinc-500">Notas</p>
                                <IconButton
                                    onClick={() => setNoteEditor({ type: "create", subject: "", content: "" })}
                                    ariaLabel="Añadir nota"
                                    icon={<PlusIcon />}
                                    disabled={noteEditor !== null}
                                    className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                                />
                            </div>

                            <div className="max-h-[290px] space-y-2 overflow-y-auto pr-1">
                                {noteEditor?.type === "create" ? (
                                    <NoteEditorCard
                                        subject={noteEditor.subject}
                                        content={noteEditor.content}
                                        isSaving={isSavingNote}
                                        onSubjectChange={(value) =>
                                            setNoteEditor((prev) => (prev ? { ...prev, subject: value } : prev))
                                        }
                                        onContentChange={(value) =>
                                            setNoteEditor((prev) => (prev ? { ...prev, content: value } : prev))
                                        }
                                        onSave={handleSaveNote}
                                        onCancel={() => setNoteEditor(null)}
                                    />
                                ) : null}

                                {notes.length === 0 && noteEditor?.type !== "create" ? (
                                    <p className="rounded-md border border-dashed border-zinc-300 px-3 py-4 text-sm text-zinc-500">
                                        Todavía no hay notas para esta candidatura.
                                    </p>
                                ) : null}

                                {notes.map((note) => {
                                    const isEditing = noteEditor?.type === "edit" && noteEditor.noteId === note.id;

                                    if (isEditing) {
                                        return (
                                            <NoteEditorCard
                                                key={note.id}
                                                subject={noteEditor.subject}
                                                content={noteEditor.content}
                                                isSaving={isSavingNote}
                                                onSubjectChange={(value) =>
                                                    setNoteEditor((prev) => (prev ? { ...prev, subject: value } : prev))
                                                }
                                                onContentChange={(value) =>
                                                    setNoteEditor((prev) => (prev ? { ...prev, content: value } : prev))
                                                }
                                                onSave={handleSaveNote}
                                                onCancel={() => setNoteEditor(null)}
                                            />
                                        );
                                    }

                                    return (
                                        <NoteViewCard
                                            key={note.id}
                                            note={note}
                                            isDisabled={noteEditor !== null}
                                            onEdit={() =>
                                                setNoteEditor({
                                                    type: "edit",
                                                    noteId: note.id,
                                                    subject: note.subject ?? "",
                                                    content: note.content ?? "",
                                                })
                                            }
                                            onDelete={() => {
                                                setDeleteTarget({ type: "note", noteId: note.id });
                                                setMode("confirmDelete");
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </section>

                        <footer className="mt-6 flex w-full gap-2">
                            <Button
                                variant="danger-outline"
                                onClick={() => {
                                    setDeleteTarget({ type: "application" });
                                    setMode("confirmDelete");
                                }}
                                className="flex-1"
                            >
                                Eliminar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setMode("edit")}
                                className="flex-1"
                            >
                                Editar
                            </Button>
                        </footer>
                    </>
                ) : mode === "edit" ? (
                    <ApplicationForm
                        mode="edit"
                        initialData={application}
                        onCancel={() => setMode("view")}
                        onSuccess={handleClose}
                    />
                ) : (
                    <DeleteConfirmationPanel
                        deleteTargetType={deleteTarget.type}
                        company={application.company}
                        role={application.role}
                        isDeleting={isDeleting}
                        onCancel={() => setMode("view")}
                        onConfirm={handleConfirmDelete}
                    />
                )}
            </div>
            <ErrorToast
                isOpen={errorState !== null}
                title={errorState?.title ?? ""}
                details={errorState?.details ?? []}
                onClose={() => setErrorState(null)}
            />
        </div>
    );
}
