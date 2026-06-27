import type { ApplicationRow, GroupedApplications } from "@/lib/applications/types";
import { getApplications } from "@/lib/applications/getApplications";
import { getDashboardSession } from "@/lib/auth/getDashboardSession";
import { emptyGroupedApplications } from "@/lib/applications/dataApi/groupedReducers";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

// El dashboard depende de cookies de sesión, así que nunca debe prerenderizarse.
export const dynamic = "force-dynamic";

type DashboardLayoutProps = Readonly<{
    children: React.ReactNode;
}>;

/**
 * Agrupa las candidaturas por estado.
 * @param applications - Las candidaturas a agrupar.
 * @returns Las candidaturas agrupadas por estado.
 */
function groupByStatus(applications: ApplicationRow[]): GroupedApplications {
    const grouped = emptyGroupedApplications();

    for (const application of applications) {
        grouped[application.status].push(application);
    }

    return grouped;
}

/**
 * Layout base para el dashboard.
 * Lee la sesión, si es modo auth, precarga las candidaturas y las agrupa por estado.
 * Si es modo guest, no carga nada server-side.
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    const session = await getDashboardSession();
    const initialGroupedApplications =
        session.mode === "auth"
            ? groupByStatus(await getApplications())
            : emptyGroupedApplications();

    return (
        <DashboardShell
            session={session}
            initialGroupedApplications={initialGroupedApplications}
        >
            {children}
        </DashboardShell>
    );
}
