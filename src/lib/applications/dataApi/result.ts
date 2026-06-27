import { ZodError } from "zod";

/**
 * Tipo para resultados
 */
export type Result<T = void> =
    | { success: true; data: T }
    | { success: false; message: string; details: string[] };

/**
 * Función de respuesta tipo para resultado exitoso
 */
export function ok<T>(data: T): Result<T> {
    return { success: true, data };
}

/**
 * Función de respuesta tipo para resultado de fallo con detalles opcionales
 */
export function fail(message: string, details: string[] = []): Result<never> {
    return {
        success: false,
        message,
        details: details.length > 0 ? details : [message],
    };
}

/**
 * Transforma información de fallo a estructura esperada
 * - Zod devuelve cada detalle de fallo
 * - Errores los aplana
 */
export function failFromError(message: string, error: unknown): Result<never> {
    if (error instanceof ZodError) {
        const details = error.issues
            .map((issue) => issue.message)
            .filter((issue) => issue.length > 0);

        return fail(message, details);
    }

    if (error instanceof Error && error.message.length > 0) {
        return fail(message, [error.message]);
    }

    return fail(message);
}
