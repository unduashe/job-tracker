export const validationMessages = {
    required: (field: string) => `${field} es un campo obligatorio`,
    max: (field: string, maxLength: number) =>
        `${field} no puede superar los ${maxLength} caracteres`,
    invalidEnum: (field: string, values: readonly string[]) =>
        `${field} debe ser uno de: ${values.join(", ")}`,
} as const;
