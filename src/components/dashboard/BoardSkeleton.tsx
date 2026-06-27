import { KANBAN_COLUMNS } from "@/lib/applications/constants";

/**
 * Skeleton del tablero de candidaturas. 
 * Se muestra durante la hidratación del modo invitado.
 */
export function BoardSkeleton() {
    return (
        <section
            aria-busy="true"
            aria-live="polite"
            aria-label="Cargando tablero"
            className="flex min-h-0 min-w-0 flex-1 items-start gap-4 overflow-hidden lg:overflow-x-auto lg:overflow-y-hidden"
        >
            {KANBAN_COLUMNS.map((column, columnIndex) => (
                <article
                    key={column.status}
                    className={`${columnIndex === 0 ? "flex" : "hidden"} max-h-full min-h-0 min-w-0 w-full basis-full flex-1 flex-col self-start overflow-hidden rounded-xl border border-border-subtle bg-surface-panel shadow-card lg:flex lg:min-w-72 lg:basis-72`}
                >
                    <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                        <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
                        <span className="h-6 w-6 rounded bg-surface-muted" aria-hidden />
                    </header>
                    <div className="flex min-h-0 flex-1 items-center justify-center p-3">
                        <span
                            className="h-6 w-6 animate-spin rounded-full border-2 border-border-strong border-t-brand-500"
                            role="presentation"
                        />
                        <span className="sr-only">Cargando candidaturas</span>
                    </div>
                </article>
            ))}
        </section>
    );
}
