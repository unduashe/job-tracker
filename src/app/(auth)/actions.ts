"use server";

import type { AuthError } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRequestOrigin } from "@/lib/auth/requestOrigin";
import {
    authSchema,
    forgotPasswordEmailSchema,
    resetPasswordFormSchema,
} from "@/lib/auth/schema";
import { createClient } from "@/lib/supabase/server";
import { validationMessages } from "@/lib/utils/validationMessages";

export type AuthActionResponse = {
    success: boolean;
    message: string;
    /** Mensajes de Zod o error genérico para el ErrorToast */
    details?: string[];
};

/** Respuesta de acciones de recuperación de contraseña (sin `details`). */
export type PasswordRecoveryActionResponse = {
    success: boolean;
    message: string;
};

type ParsedAuthInput =
    | { ok: true; email: string; password: string }
    | { ok: false; response: AuthActionResponse };

/**
 * Valida email y contraseña con `authSchema`.
 */
function parseAuthInput(email: string, password: string): ParsedAuthInput {
    const parsed = authSchema.safeParse({
        email: email.trim(),
        password,
    });

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => issue.message);

        return {
            ok: false,
            response: {
                success: false,
                message: details[0] ?? validationMessages.authGenericError,
                details,
            },
        };
    }

    return {
        ok: true,
        email: parsed.data.email,
        password: parsed.data.password,
    };
}

/**
 * Intenta iniciar sesión con email y contraseña.
 */
export async function loginWithPassword(email: string, password: string): Promise<AuthActionResponse> {

    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return mapLoginSupabaseError(error);
        }

        return {
            success: true,
            message: validationMessages.authLoginSuccess,
        };
    } catch (error) {
        console.error("Error inesperado al iniciar sesión:", error);

        return {
            success: false,
            message: validationMessages.authGenericError,
        };
    }
}

/**
 * Crea una cuenta con email y contraseña.
 */
export async function registerWithPassword(email: string, password: string): Promise<AuthActionResponse> {
    const input = parseAuthInput(email, password);

    if (!input.ok) {
        return input.response;
    }

    let shouldRedirect = false;

    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data, error } = await supabase.auth.signUp({
            email: input.email,
            password: input.password,
        });

        if (error) {
            return mapRegisterSupabaseError(error);
        }

        if (data.session) {
            shouldRedirect = true;
        } else {
            return {
                success: true,
                message: validationMessages.authVerifyEmailSuccess,
            };
        }
    } catch (error) {
        console.error("Error inesperado durante el registro:", error);

        return {
            success: false,
            message: validationMessages.authGenericError,
        };
    }

    if (shouldRedirect) {
        redirect("/dashboard");
    }

    return {
        success: false,
        message: validationMessages.authGenericError,
    };
}

/**
 * Envía el correo de recuperación con enlace que apunta a `/auth/callback`.
 */
export async function sendResetPasswordEmailAction(
    email: string,
): Promise<PasswordRecoveryActionResponse> {
    const parsed = forgotPasswordEmailSchema.safeParse({ email: email.trim() });

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? validationMessages.authGenericError,
        };
    }

    try {
        const origin = await getRequestOrigin();
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
            redirectTo: `${origin}/auth/callback`,
        });

        if (error) {
            console.error("resetPasswordForEmail:", error);

            return { success: false, message: validationMessages.authGenericError };
        }

        return {
            success: true,
            message: validationMessages.authResetEmailSent,
        };
    } catch (error) {
        console.error("sendResetPasswordEmailAction:", error);

        return { success: false, message: validationMessages.authGenericError };
    }
}

/**
 * Actualiza la contraseña del usuario autenticado (flujo de recuperación).
 * Ignora cualquier email enviado desde el cliente; solo usa la sesión actual.
 */
export async function updatePasswordAction(
    password: string,
    confirmPassword: string,
): Promise<PasswordRecoveryActionResponse> {
    const parsed = resetPasswordFormSchema.safeParse({ password, confirmPassword });

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? validationMessages.authGenericError,
        };
    }

    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, message: validationMessages.authSessionRequired };
        }

        const { error } = await supabase.auth.updateUser({
            password: parsed.data.password,
        });

        if (error) {
            console.error("updateUser password:", error);

            if (error.code === "weak_password") {
                const trimmed = error.message.trim();

                return {
                    success: false,
                    message:
                        trimmed.length > 0 ? trimmed : validationMessages.authWeakPasswordFallback,
                };
            }

            return { success: false, message: validationMessages.authGenericError };
        }
    } catch (error) {
        console.error("updatePasswordAction:", error);

        return { success: false, message: validationMessages.authGenericError };
    }

    redirect(
        `/login?message=${encodeURIComponent(validationMessages.authPasswordUpdated)}`,
    );
}

function mapLoginSupabaseError(error: AuthError): AuthActionResponse {
    if (error.code === "invalid_credentials" || isInvalidCredentialsError(error)) {
        return { success: false, message: validationMessages.authInvalidCredentials };
    }

    console.error("Ha ocurrido un error durante el login:", error);

    return { success: false, message: validationMessages.authGenericError };
}

function mapRegisterSupabaseError(error: AuthError): AuthActionResponse {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
        return { success: false, message: validationMessages.authEmailAlreadyRegistered };
    }

    if (error.code === "weak_password") {
        const trimmed = error.message.trim();

        return {
            success: false,
            message:
                trimmed.length > 0 ? trimmed : validationMessages.authWeakPasswordFallback,
        };
    }

    console.error("Ha ocurrido un error durante el registro:", error);

    return { success: false, message: validationMessages.authGenericError };
}

function isInvalidCredentialsError(error: AuthError): boolean {
    const message = error.message.toLowerCase();

    return (
        error.status === 400 &&
        (message.includes("invalid login credentials") || message.includes("invalid email or password"))
    );
}
