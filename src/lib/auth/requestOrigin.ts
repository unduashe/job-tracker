import { headers } from "next/headers";

/**
 * Origen público para enlaces en correos (p. ej. `redirectTo` de recuperación).
 * Prioriza `NEXT_PUBLIC_SITE_URL` y cae en cabeceras de la petición.
 */
export async function getRequestOrigin(): Promise<string> {
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

    if (configured) {
        return configured;
    }

    if (process.env.NODE_ENV === "production") {
        throw new Error("Configura NEXT_PUBLIC_SITE_URL para generar enlaces de autenticación seguros.");
    }

    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
    const proto = headersList.get("x-forwarded-proto") ?? "http";

    if (!host) {
        return "http://localhost:3000";
    }

    return `${proto}://${host}`;
}
