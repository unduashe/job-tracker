"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import type { ApplicationStatus } from "@/lib/applications/schema";
import { createApplication } from "@/lib/applications/createApplication";
import { deleteApplication } from "@/lib/applications/deleteApplication";
import { createNote } from "@/lib/applications/notes/createNote";
import { deleteNote } from "@/lib/applications/notes/deleteNote";
import type { NoteRow } from "@/lib/applications/notes/types";
import { updateNote } from "@/lib/applications/notes/updateNote";
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

type ActionSuccessResult = { success: true };
type ActionErrorResult = { success: false; message: string; details: string[] };
type ApplicationActionResult = ActionSuccessResult | ActionErrorResult;
type NoteActionResult<T = ActionSuccessResult> = T | ActionErrorResult;
type StatusActionResult = ActionSuccessResult | ActionErrorResult;

function getStringField(formData: FormData, field: string): string | undefined {
    const value = formData.get(field);
    return typeof value === "string" ? value : undefined;
}

/**
 * Crea una aplicación desde los datos del formulario del dashboard.
 */
export async function createApplicationAction(formData: FormData): Promise<ApplicationActionResult> {
    const company = getStringField(formData, "company");
    const role = getStringField(formData, "role");
    const description = getStringField(formData, "description");
    const status = getStringField(formData, "status");

    try {
        await createApplication({
            company,
            role,
            description,
            status,
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("createApplicationAction error:", error);
        return {
            success: false,
            message: "No se pudo crear la aplicación",
            details: getActionErrorDetails(error),
        };
    }
}

/**
 * Actualiza una aplicación existente desde el formulario del dashboard.
 */
export async function updateApplicationAction(formData: FormData): Promise<ApplicationActionResult> {
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
        await updateApplication(applicationId, {
            company,
            role,
            description,
            status,
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("updateApplicationAction error:", error);
        return {
            success: false,
            message: "No se pudo actualizar la aplicación",
            details: getActionErrorDetails(error),
        };
    }
}

/**
 * Elimina una candidatura del dashboard.
 */
export async function deleteApplicationAction(id: string): Promise<ActionSuccessResult | ActionErrorResult> {
    try {
        await deleteApplication(id);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("deleteApplicationAction error:", error);
        return {
            success: false,
            message: "No se pudo eliminar la aplicación",
            details: getActionErrorDetails(error),
        };
    }
}

/**
 * Actualiza el estado de una candidatura.
 */
export async function updateApplicationStatusAction(
    id: string,
    newStatus: ApplicationStatus,
): Promise<StatusActionResult> {
    try {
        await updateApplication(id, { status: newStatus });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("updateApplicationStatusAction error:", error);
        return {
            success: false,
            message: "No se pudo actualizar el estado de la aplicación",
            details: getActionErrorDetails(error),
        };
    }
}

/**
 * Crea una nota para una candidatura existente.
 */
export async function createNoteAction(formData: FormData): Promise<NoteActionResult<{ success: true; note: NoteRow }>> {
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
        revalidatePath("/dashboard");
        return { success: true, note };
    } catch (error) {
        console.error("createNoteAction error:", error);
        return {
            success: false,
            message: "No se pudo crear la nota",
            details: getActionErrorDetails(error),
        };
    }
}

/**
 * Actualiza una nota existente.
 */
export async function updateNoteAction(formData: FormData): Promise<NoteActionResult<{ success: true; note: NoteRow }>> {
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
        revalidatePath("/dashboard");
        return { success: true, note };
    } catch (error) {
        console.error("updateNoteAction error:", error);
        return {
            success: false,
            message: "No se pudo actualizar la nota",
            details: getActionErrorDetails(error),
        };
    }
}

/**
 * Elimina una nota existente.
 */
export async function deleteNoteAction(noteId: string): Promise<ActionSuccessResult | ActionErrorResult> {
    try {
        await deleteNote(noteId);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("deleteNoteAction error:", error);
        return {
            success: false,
            message: "No se pudo eliminar la nota",
            details: getActionErrorDetails(error),
        };
    }
}

function getActionErrorDetails(error: unknown): string[] {
    if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => issue.message).filter((issue) => issue.length > 0);
        return issues.length > 0 ? issues : ["Revisa los datos del formulario e inténtalo de nuevo."];
    }

    if (error instanceof Error && error.message.length > 0) {
        return [error.message];
    }

    return ["Ha ocurrido un error inesperado. Inténtalo de nuevo."];
}
