import { logoutAction } from "@/app/dashboard/actions";
import { IconButton } from "@/components/ui/IconButton";
import { LogOutIcon } from "@/components/ui/icons";

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
                    <IconButton
                        type="submit"
                        ariaLabel="Cerrar sesión"
                        icon={<LogOutIcon />}
                        className="inline-flex items-center justify-center p-2 text-white hover:cursor-pointer hover:bg-red-500/20 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                    />
                </form>
            </div>
        </header>
    );
}
