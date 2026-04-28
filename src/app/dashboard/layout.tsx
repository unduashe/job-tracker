import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/dashboard/Navbar";

type DashboardLayoutProps = Readonly<{
    children: React.ReactNode;
}>;

/**
 * Layout base para el dashboard con navbar y área principal.
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const user = await getCurrentUser(supabase);
    const email = user.email ?? "usuario";

    return (
        <div className="flex h-dvh flex-col overflow-hidden bg-surface-canvas">
            <Navbar email={email} />
            <main className="flex min-h-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
    );
}
