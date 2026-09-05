/**
 * Lee un campo de texto de un `FormData`.
 * Devuelve `undefined` si el campo no existe o no es una cadena.
 */
export function getStringField(formData: FormData, field: string): string | undefined {
    const value = formData.get(field);
    return typeof value === "string" ? value : undefined;
}
