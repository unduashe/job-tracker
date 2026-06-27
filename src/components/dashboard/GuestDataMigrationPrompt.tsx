"use client";

import { useEffect, useState } from "react";
import { importGuestDataAction } from "@/app/dashboard/migrateAction";
import { useDashboardData } from "@/components/dashboard/DashboardDataProvider";
import { ErrorToast } from "@/components/ErrorToast";
import { Button } from "@/components/ui/Button";
import { applyApplicationCreate } from "@/lib/applications/dataApi/groupedReducers";
import { buildImportPayloadFromSnapshot } from "@/lib/applications/local/migrate";
import {
    clearPersistedSnapshot,
    readPersistedSnapshot,
} from "@/lib/applications/local/storage";

type PromptDecision = "idle" | "importing" | "discarding";

/**
 * Modal de migración de datos.
 * Aparece si se inicia sesión y hay datos en localStorage previos al login.
 * Ofrece importar los datos a la cuenta o descartarlos.
 */
export function GuestDataMigrationPrompt() {
    const [shouldShow, setShouldShow] = useState(false);
    const [decision, setDecision] = useState<PromptDecision>("idle");
    const [errorState, setErrorState] = useState<{ title: string; details: string[] } | null>(null);
    const { groupedApplications, setGroupedApplications } = useDashboardData();

    useEffect(() => {
        const snapshot = readPersistedSnapshot();
        if (snapshot.applications.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShouldShow(true);
        }
    }, []);

    if (!shouldShow) {
        return null;
    }

    const isBusy = decision !== "idle";

    const handleImport = async () => {
        if (isBusy) {
            return;
        }

        const snapshot = readPersistedSnapshot();
        if (snapshot.applications.length === 0) {
            setShouldShow(false);
            return;
        }

        setDecision("importing");
        setErrorState(null);

        const payload = buildImportPayloadFromSnapshot(snapshot);
        const result = await importGuestDataAction(payload);

        if (!result.success) {
            setErrorState({ title: result.message, details: result.details });
            setDecision("idle");
            return;
        }

        // Mergea las candidaturas importadas con las ya existentes en la cuenta.
        const merged = result.data.applications.reduce(
            (state, application) => applyApplicationCreate(state, application),
            groupedApplications,
        );
        setGroupedApplications(merged);
        clearPersistedSnapshot();
        setDecision("idle");
        setShouldShow(false);
    };

    const handleDiscard = () => {
        if (isBusy) {
            return;
        }

        setDecision("discarding");
        clearPersistedSnapshot();
        setDecision("idle");
        setShouldShow(false);
    };

    return (
        <>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="guest-migration-title"
                aria-describedby="guest-migration-description"
                className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/45 p-4"
            >
                <div className="w-full max-w-md rounded-xl border border-border-subtle bg-surface-panel p-6 shadow-modal">
                    <h3
                        id="guest-migration-title"
                        className="text-lg font-semibold text-foreground"
                    >
                        Tienes datos del modo invitado
                    </h3>
                    <p
                        id="guest-migration-description"
                        className="mt-2 text-sm text-foreground-muted"
                    >
                        Has iniciado sesión y tenemos candidaturas guardadas en este
                        navegador. ¿Quieres importarlas a tu cuenta o descartarlas?
                    </p>

                    <footer className="mt-6 flex w-full gap-2">
                        <Button
                            variant="secondary"
                            onClick={handleDiscard}
                            disabled={isBusy}
                            className="flex-1"
                        >
                            {decision === "discarding" ? "Descartando..." : "Descartar"}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleImport}
                            disabled={isBusy}
                            className="flex-1"
                            autoFocus
                        >
                            {decision === "importing" ? "Importando..." : "Importar a mi cuenta"}
                        </Button>
                    </footer>
                </div>
            </div>

            <ErrorToast
                isOpen={errorState !== null}
                title={errorState?.title ?? ""}
                details={errorState?.details ?? []}
                onClose={() => setErrorState(null)}
            />
        </>
    );
}
