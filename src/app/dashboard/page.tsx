import type { GroupedApplications } from "@/lib/applications/types";
import { getApplications } from "@/lib/applications/getApplications";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";

export default async function DashboardPage() {
    const applications = await getApplications();

    const groupedApplications: GroupedApplications = {
        applied: [],
        interview: [],
        offer: [],
        rejected: [],
        archived: [],
    };

    for (const application of applications) {
        groupedApplications[application.status].push(application);
    }

    return (
        <section className="flex h-full min-h-0 w-full">
            <KanbanBoard groupedApplications={groupedApplications} />
        </section>
    );
}
