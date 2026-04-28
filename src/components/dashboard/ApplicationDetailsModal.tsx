"use client";

import { useState } from "react";
import {
    deleteApplicationAction,
} from "@/app/dashboard/actions";
import { ErrorToast } from "@/components/ErrorToast";
import { Button } from "@/components/ui/Button";
import { DeleteConfirmationPanel } from "@/components/dashboard/DeleteConfirmationPanel";
import { NoteEditorCard, NoteViewCard } from "@/components/dashboard/NoteCards";
import { IconButton } from "@/components/ui/IconButton";
import { CloseIcon, PlusIcon } from "@/components/ui/icons";
import { ApplicationForm } from "@/components/dashboard/ApplicationForm";
import { useApplicationNotes } from "@/hooks/useApplicationNotes";
import { APPLICATION_STATUS_LABELS } from "@/lib/applications/constants";
import type { ApplicationRow } from "@/lib/applications/types";

type ApplicationDetailsModalProps = {
    application: ApplicationRow | null;
    isOpen: boolean;
    onClose: () => void;
};

type Mode = "view" | "edit" | "confirmDelete";
type DeleteTarget = { type: "application" } | { type: "note"; noteId: string };

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
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>({ type: "application" });
    const [errorState, setErrorState] = useState<{ title: string; details: string[] } | null>(null);

    const handleError = (title: string, details: string[]) => {
        setErrorState({ title, details });
    };

    const { notes, noteEditor, setNoteEditor, isSavingNote, saveNote, deleteNote } = useApplicationNotes(
        application?.id,
        application?.notes ?? [],
        handleError,
    );

    const handleClose = () => {
        if (isDeleting || isSavingNote) {
            return;
        }

        setMode("view");
        setIsDeleting(false);
        setNoteEditor(null);
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

    const handleConfirmDelete = async () => {
        if (deleteTarget.type === "application") {
            await handleDeleteApplication();
            return;
        }

        if (isDeleting) {
            return;
        }

        setIsDeleting(true);
        const wasDeleted = await deleteNote(deleteTarget.noteId);
        setIsDeleting(false);

        if (wasDeleted) {
            setDeleteTarget({ type: "application" });
            setMode("view");
        }
    };

    if (!isOpen || !application) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-foreground/45 p-4" onClick={handleClose}>
            <div
                className="w-full max-w-lg rounded-xl border border-border-subtle bg-surface-panel p-6 shadow-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
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
                        className="text-foreground-muted hover:cursor-pointer hover:bg-surface-muted hover:text-foreground"
                    />
                </header>

                {mode === "view" ? (
                    <>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm uppercase tracking-wide text-foreground-subtle">Empresa</p>
                                <p className="text-sm font-semibold text-foreground">{application.company}</p>
                            </div>
                            {application.role ? (
                                <div>
                                    <p className="text-sm uppercase tracking-wide text-foreground-subtle">Puesto</p>
                                    <p className="text-sm italic text-foreground-muted">{application.role}</p>
                                </div>
                            ) : null}
                            {application.description ? (
                                <div>
                                    <p className="text-sm uppercase tracking-wide text-foreground-subtle">Descripción</p>
                                    <p className="text-sm text-foreground-muted">{application.description}</p>
                                </div>
                            ) : null}
                            <div>
                                <p className="text-sm uppercase tracking-wide text-foreground-subtle">Estado</p>
                                <p className="text-sm text-foreground">{APPLICATION_STATUS_LABELS[application.status]}</p>
                            </div>
                        </div>

                        <section className="mt-5">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm uppercase tracking-wide text-foreground-subtle">Notas</p>
                                <IconButton
                                    onClick={() => setNoteEditor({ type: "create", subject: "", content: "" })}
                                    ariaLabel="Añadir nota"
                                    icon={<PlusIcon />}
                                    disabled={noteEditor !== null}
                                    className="text-foreground-muted hover:bg-brand-50 hover:text-brand-700"
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
                                        onSave={saveNote}
                                        onCancel={() => setNoteEditor(null)}
                                    />
                                ) : null}

                                {notes.length === 0 && noteEditor?.type !== "create" ? (
                                    <p className="rounded-md border border-dashed border-border-strong bg-surface-muted px-3 py-4 text-sm text-foreground-muted">
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
                                                onSave={saveNote}
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
