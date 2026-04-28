/**
 * Indica si el error proviene de `redirect()` en una Server Action (Next.js).
 */
export function isNextRedirectError(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "digest" in error &&
        typeof (error as { digest: unknown }).digest === "string" &&
        (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    );
}
