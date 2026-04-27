"use client";

import type { ReactNode } from "react";
import type { NoteRow } from "@/lib/applications/notes/types";

type NoteEditorCardProps = {
    subject: string;
    content: string;
    isSaving: boolean;
    onSubjectChange: (value: string) => void;
    onContentChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    closeIcon: ReactNode;
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
    closeIcon,
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
                <button
                    type="button"
                    onClick={onSave}
                    disabled={isSaving}
                    className="rounded-md p-1 text-emerald-700 transition-colors hover:cursor-pointer hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-check-icon lucide-check"
                    >
                        <path d="M20 6 9 17l-5-5" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="rounded-md p-1 text-zinc-500 transition-colors hover:cursor-pointer hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {closeIcon}
                </button>
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
                <button
                    type="button"
                    onClick={onEdit}
                    disabled={isDisabled}
                    className="rounded-md p-1 text-zinc-600 transition-colors hover:cursor-pointer hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-pencil-icon lucide-pencil"
                    >
                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                        <path d="m15 5 4 4" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDisabled}
                    className="rounded-md p-1 text-red-600 transition-colors hover:cursor-pointer hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-trash-icon lucide-trash"
                    >
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </div>
        </article>
    );
}
