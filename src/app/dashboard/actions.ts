"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ApplicationStatus } from "@/lib/applications/schema";
import { createApplication } from "@/lib/applications/createApplication";
import { deleteApplication } from "@/lib/applications/deleteApplication";
import { failFromError, ok, type Result } from "@/lib/applications/dataApi/result";
import { createNote } from "@/lib/applications/notes/createNote";
import { deleteNote } from "@/lib/applications/notes/deleteNote";
import type { NoteRow } from "@/lib/applications/notes/types";
import { updateNote } from "@/lib/applications/notes/updateNote";
import type { ApplicationRow } from "@/lib/applications/types";
import { updateApplication } from "@/lib/applications/updateApplication";
import { createClient } from "@/lib/supabase/server";

/**
 * Cierra la sesión del usuario actual y redirige al login.
 */
export async function logoutAction(): Promise<void> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("logoutAction error:", error.message);
        throw new Error("No se pudo cerrar sesión");
    }

    redirect("/login");
}

function getStringField(formData: FormData, field: string): string | undefined {
    const value = formData.get(field);
    return typeof value === "string" ? value : undefined;
}

/**
 * Crea una aplicación desde los datos del formulario del dashboard.
 * @param formData Información del formulario
 * @returns La aplicación creada
 */
export async function createApplicationAction(
    formData: FormData,
): Promise<Result<ApplicationRow>> {
    const company = getStringField(formData, "company");
    const role = getStringField(formData, "role");
    const description = getStringField(formData, "description");
    const status = getStringField(formData, "status");

    try {
        const application = await createApplication({
            company,
            role,
            description,
            status,
        });

        return ok(application);
    } catch (error) {
        console.error("createApplicationAction error:", error);
        return failFromError("No se pudo crear la aplicación", error);
    }
}

/**
 * Actualiza una aplicación existente desde el formulario del dashboard.
 * Devuelve la fila actualizada para que el cliente sincronice su estado.
 */
export async function updateApplicationAction(
    formData: FormData,
): Promise<Result<ApplicationRow>> {
    const applicationId = getStringField(formData, "applicationId") ?? "";
    const company = getStringField(formData, "company");
    const role = getStringField(formData, "role");
    const description = getStringField(formData, "description");
    const status = getStringField(formData, "status");

    if (applicationId.length === 0) {
        return {
            success: false,
            message: "No se pudo actualizar la aplicación",
            details: ["No se ha identificado la candidatura a editar."],
        };
    }

    try {
        const application = await updateApplication(applicationId, {
            company,
            role,
            description,
            status,
        });

        return ok(application);
    } catch (error) {
        console.error("updateApplicationAction error:", error);
        return failFromError("No se pudo actualizar la aplicación", error);
    }
}

/**
 * Elimina una candidatura del dashboard.
 */
export async function deleteApplicationAction(id: string): Promise<Result> {
    try {
        await deleteApplication(id);
        return ok(undefined);
    } catch (error) {
        console.error("deleteApplicationAction error:", error);
        return failFromError("No se pudo eliminar la aplicación", error);
    }
}

/**
 * Actualiza el estado de una candidatura.
 */
export async function updateApplicationStatusAction(
    id: string,
    newStatus: ApplicationStatus,
): Promise<Result<ApplicationRow>> {
    try {
        const application = await updateApplication(id, { status: newStatus });
        return ok(application);
    } catch (error) {
        console.error("updateApplicationStatusAction error:", error);
        return failFromError("No se pudo actualizar el estado de la aplicación", error);
    }
}

/**
 * Crea una nota para una candidatura existente.
 */
export async function createNoteAction(formData: FormData): Promise<Result<NoteRow>> {
    const applicationId = getStringField(formData, "applicationId") ?? "";
    const subject = getStringField(formData, "subject");
    const content = getStringField(formData, "content");

    if (applicationId.length === 0) {
        return {
            success: false,
            message: "No se pudo crear la nota",
            details: ["No se ha identificado la candidatura."],
        };
    }

    try {
        const note = await createNote(applicationId, { subject, content });
        return ok(note);
    } catch (error) {
        console.error("createNoteAction error:", error);
        return failFromError("No se pudo crear la nota", error);
    }
}

/**
 * Actualiza una nota existente.
 */
export async function updateNoteAction(formData: FormData): Promise<Result<NoteRow>> {
    const noteId = getStringField(formData, "noteId") ?? "";
    const subject = getStringField(formData, "subject");
    const content = getStringField(formData, "content");

    if (noteId.length === 0) {
        return {
            success: false,
            message: "No se pudo actualizar la nota",
            details: ["No se ha identificado la nota a editar."],
        };
    }

    try {
        const note = await updateNote(noteId, { subject, content });
        return ok(note);
    } catch (error) {
        console.error("updateNoteAction error:", error);
        return failFromError("No se pudo actualizar la nota", error);
    }
}

/**
 * Elimina una nota existente.
 */
export async function deleteNoteAction(noteId: string): Promise<Result> {
    try {
        await deleteNote(noteId);
        return ok(undefined);
    } catch (error) {
        console.error("deleteNoteAction error:", error);
        return failFromError("No se pudo eliminar la nota", error);
    }
}
