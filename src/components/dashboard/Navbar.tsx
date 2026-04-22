import { logoutAction } from "@/app/dashboard/actions";

type NavbarProps = {
    email: string;
};

/**
 * Barra superior del dashboard.
 */
export function Navbar({ email }: NavbarProps) {
    return (
        <header className="border-b border-zinc-800 bg-zinc-950 text-zinc-100 shadow-sm">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <p className="text-sm font-medium text-zinc-100 sm:text-base">Hola {email}</p>

                <form action={logoutAction}>
                    <button
                        type="submit"
                        aria-label="Cerrar sesión"
                        className="inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-white transition-colors hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-log-out-icon lucide-log-out"
                        >
                            <path d="m16 17 5-5-5-5" />
                            <path d="M21 12H9" />
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        </svg>
                    </button>
                </form>
            </div>
        </header>
    );
}
