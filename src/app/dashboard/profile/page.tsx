import { redirect } from "next/navigation";
import { ProfileSettings } from "@/components/dashboard/ProfileSettings";
import { getDashboardSession } from "@/lib/auth/getDashboardSession";

/**
 * Página de perfil del usuario autenticado.
 * Permite actualizar email y contraseña.
 */
export default async function ProfilePage() {
    const session = await getDashboardSession();

    if (session.mode !== "auth") {
        redirect("/login");
    }

    return (
        <section className="w-full overflow-y-auto">
            <ProfileSettings currentEmail={session.email} />
        </section>
    );
}
