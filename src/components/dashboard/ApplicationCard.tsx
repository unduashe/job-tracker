"use client";

import type { ApplicationRow } from "@/lib/applications/types";

type ApplicationCardProps = {
    application: ApplicationRow;
    onOpenDetails: (application: ApplicationRow) => void;
};

/**
 * Muestra una aplicación individual. Toda la tarjeta es clickeable.
 */
export function ApplicationCard({ application, onOpenDetails }: ApplicationCardProps) {
    return (
        <article
            role="button"
            tabIndex={0}
            onClick={() => onOpenDetails(application)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenDetails(application);
                }
            }}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:cursor-pointer hover:border-zinc-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
        >
            <h3 className="text-sm font-semibold text-zinc-900">{application.company}</h3>
            {application.role ? <p className="mt-1 text-sm italic text-zinc-600">{application.role}</p> : null}
        </article>
    );
}