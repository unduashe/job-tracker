"use client";

import type { NoteRow } from "@/lib/applications/notes/types";
import { IconButton } from "@/components/ui/IconButton";
import { CheckIcon, CloseIcon, EditIcon, TrashIcon } from "@/components/ui/icons";

type NoteEditorCardProps = {
    subject: string;
    content: string;
    isSaving: boolean;
    onSubjectChange: (value: string) => void;
    onContentChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
};

type NoteViewCardProps = {
    note: NoteRow;
    isDisabled: boolean;
    onEdit: () => void;
    onDelete: () => void;
};

/**
 * Card editable para crear o actualizar una nota inline.
 */
export function NoteEditorCard({
    subject,
    content,
    isSaving,
    onSubjectChange,
    onContentChange,
    onSave,
    onCancel,
}: NoteEditorCardProps) {
    return (
        <article className="flex gap-2 rounded-md border border-border-subtle bg-surface-muted p-3">
            <div className="flex-1 space-y-2">
                <input
                    value={subject}
                    onChange={(event) => onSubjectChange(event.target.value)}
                    placeholder="Asunto de la nota"
                    className="w-full rounded-md border border-border-strong bg-surface-card px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-foreground-subtle focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <textarea
                    value={content}
                    onChange={(event) => onContentChange(event.target.value)}
                    placeholder="Escribe aquí la nota"
                    required
                    rows={4}
                    className="w-full resize-none rounded-md border border-border-strong bg-surface-card px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-foreground-subtle focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
                <IconButton
                    onClick={onSave}
                    ariaLabel="Guardar nota"
                    icon={<CheckIcon />}
                    disabled={isSaving}
                    className="text-success-700 hover:cursor-pointer hover:bg-success-100"
                />
                <IconButton
                    onClick={onCancel}
                    ariaLabel="Cancelar edición de nota"
                    icon={<CloseIcon />}
                    disabled={isSaving}
                    className="text-danger-700 hover:cursor-pointer hover:bg-danger-100"
                />
            </div>
        </article>
    );
}

/**
 * Card en modo lectura para mostrar una nota con acciones.
 */
export function NoteViewCard({ note, isDisabled, onEdit, onDelete }: NoteViewCardProps) {
    return (
        <article className="flex gap-2 rounded-md border border-border-subtle bg-surface-card p-3">
            <div className="flex flex-1 flex-col justify-center">
                <p className="text-balance text-justify text-sm font-semibold text-foreground">{note.subject}</p>
                <p className="mt-1 max-h-[15rem] overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-words pr-2 text-balance text-justify text-sm leading-6 text-foreground-muted">
                    {note.content}
                </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
                <IconButton
                    onClick={onEdit}
                    ariaLabel="Editar nota"
                    icon={<EditIcon />}
                    disabled={isDisabled}
                    className="text-foreground-muted hover:cursor-pointer hover:bg-brand-50 hover:text-brand-700"
                />
                <IconButton
                    onClick={onDelete}
                    ariaLabel="Eliminar nota"
                    icon={<TrashIcon />}
                    disabled={isDisabled}
                    className="text-danger-600 hover:cursor-pointer hover:bg-danger-50 hover:text-danger-700"
                />
            </div>
        </article>
    );
}
