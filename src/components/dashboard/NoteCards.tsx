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
        <article className="flex gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex-1 space-y-2">
                <input
                    value={subject}
                    onChange={(event) => onSubjectChange(event.target.value)}
                    placeholder="Asunto de la nota"
                    className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                />
                <textarea
                    value={content}
                    onChange={(event) => onContentChange(event.target.value)}
                    placeholder="Escribe aquí la nota"
                    required
                    rows={4}
                    className="w-full resize-none rounded-md border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500"
                />
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
                <IconButton
                    onClick={onSave}
                    ariaLabel="Guardar nota"
                    icon={<CheckIcon />}
                    disabled={isSaving}
                    className="text-emerald-700 hover:cursor-pointer hover:bg-emerald-50"
                />
                <IconButton
                    onClick={onCancel}
                    ariaLabel="Cancelar edición de nota"
                    icon={<CloseIcon />}
                    disabled={isSaving}
                    className="text-zinc-500 hover:cursor-pointer hover:bg-zinc-100 hover:text-zinc-700"
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
        <article className="flex gap-2 rounded-md border border-zinc-200 bg-white p-3">
            <div className="flex flex-1 flex-col justify-center">
                <p className="text-balance text-justify text-sm font-semibold text-zinc-900">{note.subject}</p>
                <p className="mt-1 max-h-[15rem] overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-words pr-2 text-balance text-justify text-sm leading-6 text-zinc-700">
                    {note.content}
                </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
                <IconButton
                    onClick={onEdit}
                    ariaLabel="Editar nota"
                    icon={<EditIcon />}
                    disabled={isDisabled}
                    className="text-zinc-600 hover:cursor-pointer hover:bg-zinc-100 hover:text-zinc-800"
                />
                <IconButton
                    onClick={onDelete}
                    ariaLabel="Eliminar nota"
                    icon={<TrashIcon />}
                    disabled={isDisabled}
                    className="text-red-600 hover:cursor-pointer hover:bg-red-50 hover:text-red-700"
                />
            </div>
        </article>
    );
}
