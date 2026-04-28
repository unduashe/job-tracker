import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-surface-canvas px-4">
            <section className="w-full max-w-xl rounded-xl border border-border-subtle bg-surface-panel p-8 text-center shadow-card">
                <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                    Logate o Registrate para empezar a utilizar la aplicación
                </h1>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href="/login"
                        className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-panel"
                    >
                        Iniciar sesión
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-md border border-border-strong bg-surface-card px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand-100 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-panel"
                    >
                        Registrarme
                    </Link>
                </div>
            </section>
        </main>
    );
}
