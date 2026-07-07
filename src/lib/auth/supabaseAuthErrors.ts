import type { AuthError } from "@supabase/supabase-js";
import { validationMessages } from "@/lib/utils/validationMessages";

/**
 * Indica si Supabase devolvió un error de credenciales inválidas
 * (código explícito o mensaje HTTP 400 reconocido).
 */
export function isInvalidCredentialsError(error: AuthError): boolean {
    if (error.code === "invalid_credentials") {
        return true;
    }

    const message = error.message.toLowerCase();

    return (
        error.status === 400 &&
        (message.includes("invalid login credentials") || message.includes("invalid email or password"))
    );
}

/**
 * Indica si el correo ya está registrado en Supabase Auth.
 */
export function isEmailAlreadyRegisteredError(error: AuthError): boolean {
    return error.code === "user_already_exists" || error.code === "email_exists";
}

/**
 * Indica si Supabase rechazó la contraseña por no cumplir la política de seguridad.
 */
export function isWeakPasswordError(error: AuthError): boolean {
    return error.code === "weak_password";
}

/**
 * Mensaje de usuario para un error `weak_password` de Supabase.
 * Usa el texto del proveedor si existe; si no, el fallback del proyecto.
 */
export function getWeakPasswordMessage(error: AuthError): string {
    const trimmed = error.message.trim();

    return trimmed.length > 0 ? trimmed : validationMessages.authWeakPasswordFallback;
}
