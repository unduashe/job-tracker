"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { createApplication } from "@/lib/applications/createApplication";
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

type CreateApplicationActionResult =
    | { success: true }
    | { success: false; message: string; details: string[] };

/**
 * Crea una aplicación desde los datos del formulario del dashboard.
 */
export async function createApplicationAction(formData: FormData): Promise<CreateApplicationActionResult> {
    const companyValue = formData.get("company");
    const roleValue = formData.get("role");
    const descriptionValue = formData.get("description");
    const statusValue = formData.get("status");

    const company = typeof companyValue === "string" ? companyValue : undefined;
    const role = typeof roleValue === "string" ? roleValue : undefined;
    const description = typeof descriptionValue === "string" ? descriptionValue : undefined;
    const status = typeof statusValue === "string" ? statusValue : undefined;

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
            details: getCreateApplicationErrorDetails(error),
        };
    }
}

function getCreateApplicationErrorDetails(error: unknown): string[] {
    if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => issue.message).filter((issue) => issue.length > 0);
        return issues.length > 0 ? issues : ["Revisa los datos del formulario e inténtalo de nuevo."];
    }

    if (error instanceof Error && error.message.length > 0) {
        return [error.message];
    }

    return ["Ha ocurrido un error inesperado. Inténtalo de nuevo."];
}
