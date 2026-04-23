"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { createApplication } from "@/lib/applications/createApplication";
import { deleteApplication } from "@/lib/applications/deleteApplication";
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
            details: getApplicationActionErrorDetails(error),
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
            details: getApplicationActionErrorDetails(error),
        };
    }
}

/**
 * Elimina una candidatura del dashboard.
 */
export async function deleteApplicationAction(id: string): Promise<{ success: boolean; message?: string }> {
    try {
        await deleteApplication(id);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("deleteApplicationAction error:", error);
        return { success: false, message: "No se pudo eliminar la aplicación" };
    }
}

function getApplicationActionErrorDetails(error: unknown): string[] {
    if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => issue.message).filter((issue) => issue.length > 0);
        return issues.length > 0 ? issues : ["Revisa los datos del formulario e inténtalo de nuevo."];
    }

    if (error instanceof Error && error.message.length > 0) {
        return [error.message];
    }

    return ["Ha ocurrido un error inesperado. Inténtalo de nuevo."];
}
