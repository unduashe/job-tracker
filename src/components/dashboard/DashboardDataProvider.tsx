"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import type { ApplicationStatus } from "@/lib/applications/schema";
import type { GroupedApplications } from "@/lib/applications/types";
import type {
    CreateApplicationApiInput,
    CreateNoteApiInput,
    DashboardDataApi,
    UpdateApplicationApiInput,
    UpdateNoteApiInput,
} from "@/lib/applications/dataApi/types";
import {
    applyApplicationCreate,
    applyApplicationDelete,
    applyApplicationUpdate,
    applyNoteCreate,
    applyNoteDelete,
    applyNoteUpdate,
} from "@/lib/applications/dataApi/groupedReducers";
import type { Result } from "@/lib/applications/dataApi/result";
import type { ApplicationRow } from "@/lib/applications/types";
import type { NoteRow } from "@/lib/applications/notes/types";

type DashboardDataContextValue = {
    groupedApplications: GroupedApplications;
    setGroupedApplications: (next: GroupedApplications) => void;
    createApplication: (input: CreateApplicationApiInput) => Promise<Result<ApplicationRow>>;
    updateApplication: (
        id: string,
        input: UpdateApplicationApiInput,
    ) => Promise<Result<ApplicationRow>>;
    deleteApplication: (id: string) => Promise<Result>;
    updateApplicationStatus: (
        id: string,
        status: ApplicationStatus,
    ) => Promise<Result<ApplicationRow>>;
    createNote: (
        applicationId: string,
        input: CreateNoteApiInput,
    ) => Promise<Result<NoteRow>>;
    updateNote: (noteId: string, input: UpdateNoteApiInput) => Promise<Result<NoteRow>>;
    deleteNote: (applicationId: string, noteId: string) => Promise<Result>;
};

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null);

type DashboardDataProviderProps = {
    api: DashboardDataApi;
    children: React.ReactNode;
};

/**
 * Provee el estado de candidaturas agrupadas y los métodos CRUD a los
 * componentes del dashboard. La implementación ya sea de Supabase o de
 * localStorage se inyecta vía la prop `api`, manteniendo a los consumidores
 * agnósticos a la fuente de datos.
 */
export function DashboardDataProvider({ api, children }: DashboardDataProviderProps) {
    const [groupedApplications, setGroupedApplications] = useState<GroupedApplications>(
        () => api.getInitialGroupedApplications(),
    );

    const replaceState = useCallback((next: GroupedApplications) => {
        setGroupedApplications(next);
    }, []);

    const createApplication = useCallback<DashboardDataContextValue["createApplication"]>(
        async (input) => {
            const result = await api.createApplication(input);
            if (result.success) {
                setGroupedApplications((prev) => applyApplicationCreate(prev, result.data));
            }
            return result;
        },
        [api],
    );

    const updateApplication = useCallback<DashboardDataContextValue["updateApplication"]>(
        async (id, input) => {
            const result = await api.updateApplication(id, input);
            if (result.success) {
                setGroupedApplications((prev) => applyApplicationUpdate(prev, result.data));
            }
            return result;
        },
        [api],
    );

    const deleteApplication = useCallback<DashboardDataContextValue["deleteApplication"]>(
        async (id) => {
            const result = await api.deleteApplication(id);
            if (result.success) {
                setGroupedApplications((prev) => applyApplicationDelete(prev, id));
            }
            return result;
        },
        [api],
    );

    const updateApplicationStatus = useCallback<
        DashboardDataContextValue["updateApplicationStatus"]
    >(
        async (id, status) => {
            const result = await api.updateApplicationStatus(id, status);
            if (result.success) {
                setGroupedApplications((prev) => applyApplicationUpdate(prev, result.data));
            }
            return result;
        },
        [api],
    );

    const createNote = useCallback<DashboardDataContextValue["createNote"]>(
        async (applicationId, input) => {
            const result = await api.createNote(applicationId, input);
            if (result.success) {
                setGroupedApplications((prev) =>
                    applyNoteCreate(prev, applicationId, result.data),
                );
            }
            return result;
        },
        [api],
    );

    const updateNote = useCallback<DashboardDataContextValue["updateNote"]>(
        async (noteId, input) => {
            const result = await api.updateNote(noteId, input);
            if (result.success) {
                setGroupedApplications((prev) => applyNoteUpdate(prev, result.data));
            }
            return result;
        },
        [api],
    );

    const deleteNote = useCallback<DashboardDataContextValue["deleteNote"]>(
        async (applicationId, noteId) => {
            const result = await api.deleteNote(applicationId, noteId);
            if (result.success) {
                setGroupedApplications((prev) => applyNoteDelete(prev, applicationId, noteId));
            }
            return result;
        },
        [api],
    );

    const value = useMemo<DashboardDataContextValue>(
        () => ({
            groupedApplications,
            setGroupedApplications: replaceState,
            createApplication,
            updateApplication,
            deleteApplication,
            updateApplicationStatus,
            createNote,
            updateNote,
            deleteNote,
        }),
        [
            groupedApplications,
            replaceState,
            createApplication,
            updateApplication,
            deleteApplication,
            updateApplicationStatus,
            createNote,
            updateNote,
            deleteNote,
        ],
    );

    return (
        <DashboardDataContext.Provider value={value}>
            {children}
        </DashboardDataContext.Provider>
    );
}

/**
 * Acceso al estado y operaciones del dashboard
 * @throws Error si se usa fuera del provider para evitar bugs
 */
export function useDashboardData(): DashboardDataContextValue {
    const context = useContext(DashboardDataContext);

    if (!context) {
        throw new Error("useDashboardData debe usarse dentro de DashboardDataProvider");
    }

    return context;
}
