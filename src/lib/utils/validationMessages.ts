export const validationMessages = {
    required: (field: string) => `${field} es un campo obligatorio`,
    max: (field: string, maxLength: number) =>
        `${field} no puede superar los ${maxLength} caracteres`,
    invalidEnum: (field: string, values: readonly string[]) =>
        `${field} debe ser uno de: ${values.join(", ")}`,
    /** Autenticación (email / contraseña, Zod + Supabase) */
    authEmailInvalid: "Correo inválido",
    authPasswordMinLength: "Mínimo 8 caracteres",
    authPasswordRequiresLetter: "Debe contener al menos una letra",
    authPasswordRequiresNumber: "Debe contener al menos un número",
    authEmailAlreadyRegistered: "Este correo ya está registrado",
    authWeakPasswordFallback:
        "La contraseña no cumple los requisitos de seguridad. Usa al menos 8 caracteres, una letra y un número.",
    authGenericError: "Ha ocurrido un error. Inténtalo de nuevo más tarde",
    authInvalidCredentials: "Correo o contraseña inválidos",
    authVerifyEmailSuccess:
        "Cuenta creada. Revisa tu correo para verificar tu cuenta antes de iniciar sesión.",
    authLoginSuccess: "Inicio de sesión exitoso",
    authResetEmailSent: "Revisa tu bandeja de entrada",
    authPasswordMismatch: "Las contraseñas no coinciden",
    authPasswordUpdated: "Contraseña actualizada",
    authSessionRequired: "Tu sesión ha expirado. Solicita un nuevo enlace de recuperación.",
} as const;
