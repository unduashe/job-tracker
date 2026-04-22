"use client";

type ApplicationCardProps = {
    company: string;
    role?: string | null;
};

/**
 * Muestra una aplicación individual dentro de una columna.
 */
export function ApplicationCard({ company, role }: ApplicationCardProps) {
    return (
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900">{company}</h3>
            {role ? <p className="mt-1 text-sm italic text-zinc-600">{role}</p> : null}
        </article>
    );
}
