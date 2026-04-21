"use server";

import type { AuthError } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginActionResponse =
    | { success: true; message: string }
    | { success: false; message: string };

export type LoginFormState = LoginActionResponse;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Intenta iniciar sesión con autenticación de email y contraseña de Supabase.
 */
export async function loginWithPassword(
    email: string,
    password: string,
): Promise<LoginActionResponse> {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Se intenta logar con email y contraseña en supabase
        const authResponse =
            await supabase.auth.signInWithPassword({
                email,
                password,
            });

        const { error } = authResponse;

        // Si existe error se diferencia entre error de credenciales o cualquier otro error
        if (error) {
            if (isInvalidCredentialsError(error)) {
                console.warn(`Intento de inicio de sesión inválido.`)
                return {
                    success: false,
                    message: "Correo o contraseña inválidos",
                };
            }
            
            console.error(`Ha ocurrido un error durante el proceso de login: ${error}`)
            return {
                success: false,
                message: "Ha ocurrido un error. Inténtalo de nuevo más tarde",
            };
        }

        return {
            success: true,
            message: "Inicio de sesión exitoso",
        };
    } catch (error) {
        console.error(`Error al hacer login: ${error}`)

        return {
            success: false,
            message: "Ha ocurrido un error. Inténtalo de nuevo más tarde",
        };
    }
}

/**
 * Procesa el formulario de login y valida los campos antes de autenticar.
 */
export async function loginFormAction(
    _prevState: LoginFormState,
    formData: FormData,
): Promise<LoginFormState> {
    const emailValue = formData.get("email");
    const passwordValue = formData.get("password");
    
    console.log(`Iniciando proceso de verificación y login`)

    // Obtenemos los datos del formulario y los validamos
    if (typeof emailValue !== "string" || typeof passwordValue !== "string") {
        return {
            success: false,
            message: "Datos de acceso inválidos",
        };
    }

    const email = emailValue.trim();
    const password = passwordValue;

    if (!isValidEmail(email)) {
        return {
            success: false,
            message: "Introduce un correo electrónico válido",
        };
    }

    if (password.length === 0) {
        return {
            success: false,
            message: "La contraseña es obligatoria",
        };
    }

    // Se intenta logar con usuario y contraseña facilitados
    const response = await loginWithPassword(email, password);

    // En caso de éxito se redirige a dashboard
    if (response.success) {
        console.log("Inicio de sesión exitoso.")
        redirect("/dashboard");
    }

    return response;
}

// ================== Funciones auxiliares ==================
function isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
}

function isInvalidCredentialsError(error: AuthError): boolean {
    const message = error.message.toLowerCase();
    return (
        error.status === 400 &&
        (message.includes("invalid login credentials") ||
            message.includes("invalid email or password"))
    );
}
