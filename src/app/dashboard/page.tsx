import { AuthDataBoundary } from "@/components/dashboard/DashboardShell";
import { GuestKanbanBoard } from "@/components/dashboard/GuestKanbanBoard";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { GuestDataMigrationPrompt } from "@/components/dashboard/GuestDataMigrationPrompt";
import { ApplicationRow, GroupedApplications } from "@/lib/applications/types";
import { emptyGroupedApplications } from "@/lib/applications/dataApi/groupedReducers";
import { getApplications } from "@/lib/applications/getApplications";
import { getDashboardSession } from "@/lib/auth/getDashboardSession";

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
 * Page del dashboard.
 * Server Component: resuelve el modo con `getDashboardSession`.
 * - auth: carga candidaturas, monta `AuthDataBoundary` + board + prompt de migración.
 * - guest: solo `GuestKanbanBoard` (datos en cliente vía localStorage).
 */
export default async function DashboardPage() {
    const session = await getDashboardSession();
    
    if (session.mode === "auth") {
        const initialGroupedApplications = groupByStatus(await getApplications());
        
        return (
            <AuthDataBoundary initialGroupedApplications={initialGroupedApplications}>
                <section className="flex h-full min-h-0 w-full">
                    <KanbanBoard />
                </section>
                <GuestDataMigrationPrompt />
            </AuthDataBoundary>
        );
    }

    return (
        <section className="flex h-full min-h-0 w-full">
            <GuestKanbanBoard />
        </section>
    );
}
