import Link from "next/link";

/**
 * Enlace para volver al tablero en modo invitado desde las pantallas de auth.
 */
export function AuthDashboardLink() {
    return (
        <p className="text-center text-sm text-foreground-muted">
            <Link
                href="/dashboard"
                className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-600"
            >
                Continuar como invitado
            </Link>
        </p>
    );
}
