import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardSession } from "@/lib/auth/getDashboardSession";

// El dashboard depende de cookies de sesión, así que nunca debe prerenderizarse.
export const dynamic = "force-dynamic";

type DashboardLayoutProps = Readonly<{
    children: React.ReactNode;
}>;

/**
 * Layout del dashboard: resuelve la sesión y monta la shell (modo + navbar).
 * No carga candidaturas; eso corresponde a la page del dashboard.
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    const session = await getDashboardSession();

    return (
        <DashboardShell session={session}>
            {children}
        </DashboardShell>
    );
}
