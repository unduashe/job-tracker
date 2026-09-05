"use server";

import type { AuthError } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { profileEmailFormSchema, profilePasswordFormSchema } from "@/lib/auth/schema";
import {
    getWeakPasswordMessage,
    isEmailAlreadyRegisteredError,
    isInvalidCredentialsError,
    isWeakPasswordError,
} from "@/lib/auth/supabaseAuthErrors";
import { createClient } from "@/lib/supabase/server";
import { getStringField } from "@/lib/utils/formData";
import { validationMessages } from "@/lib/utils/validationMessages";

export type ProfileActionResponse = {
    success: boolean;
    message: string;
    details?: string[];
};

/**
 * Solicita el cambio de email del usuario autenticado.
 * Supabase envía un correo de confirmación al nuevo email si la operación es válida.
 */
export async function updateProfileEmailAction(formData: FormData): Promise<ProfileActionResponse> {
    const email = getStringField(formData, "email");
    const parsed = profileEmailFormSchema.safeParse({ email: email ?? "" });

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => issue.message);

        return {
            success: false,
            message: details[0] ?? validationMessages.authGenericError,
            details,
        };
    }

    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user?.email) {
            return {
                success: false,
                message: validationMessages.authProfileSessionRequired,
            };
        }

        const currentEmail = user.email.trim().toLowerCase();
        const newEmail = parsed.data.email;

        if (newEmail === currentEmail) {
            return {
                success: false,
                message: validationMessages.authProfileEmailSameAsCurrent,
            };
        }

        const { error } = await supabase.auth.updateUser({
            email: parsed.data.email,
        });

        if (error) {
            return mapUpdateEmailError(error);
        }

        return {
            success: true,
            message: validationMessages.authProfileEmailChangeSent,
        };
    } catch (error) {
        console.error("updateProfileEmailAction:", error);

        return {
            success: false,
            message: validationMessages.authGenericError,
        };
    }
}

/**
 * Actualiza la contraseña del usuario autenticado tras verificar la contraseña actual.
 */
export async function changeProfilePasswordAction(formData: FormData): Promise<ProfileActionResponse> {
    const currentPassword = getStringField(formData, "currentPassword");
    const password = getStringField(formData, "password");
    const confirmPassword = getStringField(formData, "confirmPassword");

    const parsed = profilePasswordFormSchema.safeParse({
        currentPassword,
        password,
        confirmPassword,
    });

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => issue.message);

        return {
            success: false,
            message: details[0] ?? validationMessages.authGenericError,
            details,
        };
    }

    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user?.email) {
            return {
                success: false,
                message: validationMessages.authProfileSessionRequired,
            };
        }

        const { error: reauthError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: parsed.data.currentPassword,
        });

        if (reauthError) {
            return mapReauthError(reauthError);
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: parsed.data.password,
        });

        if (updateError) {
            return mapUpdatePasswordError(updateError);
        }

        return {
            success: true,
            message: validationMessages.authPasswordUpdated,
        };
    } catch (error) {
        console.error("changeProfilePasswordAction:", error);

        return {
            success: false,
            message: validationMessages.authGenericError,
        };
    }
}

function mapUpdateEmailError(error: AuthError): ProfileActionResponse {
    if (isEmailAlreadyRegisteredError(error)) {
        return {
            success: false,
            message: validationMessages.authEmailAlreadyRegistered,
        };
    }

    console.error("updateUser email:", error);

    return {
        success: false,
        message: validationMessages.authGenericError,
    };
}

function mapReauthError(error: AuthError): ProfileActionResponse {
    if (isInvalidCredentialsError(error)) {
        return {
            success: false,
            message: validationMessages.authProfileCurrentPasswordInvalid,
        };
    }

    console.error("signInWithPassword reauth:", error);

    return {
        success: false,
        message: validationMessages.authGenericError,
    };
}

function mapUpdatePasswordError(error: AuthError): ProfileActionResponse {
    if (isWeakPasswordError(error)) {
        return {
            success: false,
            message: getWeakPasswordMessage(error),
        };
    }

    console.error("updateUser password:", error);

    return {
        success: false,
        message: validationMessages.authGenericError,
    };
}
