import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

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

    return <DashboardShell email={email}>{children}</DashboardShell>;
}
