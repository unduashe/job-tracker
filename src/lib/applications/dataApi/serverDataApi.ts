import {
    createApplicationAction,
    createNoteAction,
    deleteApplicationAction,
    deleteNoteAction,
    updateApplicationAction,
    updateApplicationStatusAction,
    updateNoteAction,
} from "@/app/dashboard/actions";
import type {
    CreateApplicationApiInput,
    CreateNoteApiInput,
    DashboardDataApi,
    UpdateApplicationApiInput,
    UpdateNoteApiInput,
} from "@/lib/applications/dataApi/types";
import type { GroupedApplications } from "@/lib/applications/types";

function appendDefined(formData: FormData, key: string, value: string | undefined): void {
    if (typeof value === "string") {
        formData.set(key, value);
    }
}

function buildApplicationFormData(input: CreateApplicationApiInput): FormData {
    const formData = new FormData();
    appendDefined(formData, "company", input.company);
    appendDefined(formData, "role", input.role);
    appendDefined(formData, "description", input.description);
    appendDefined(formData, "status", input.status);
    return formData;
}

function buildNoteFormData(input: CreateNoteApiInput): FormData {
    const formData = new FormData();
    appendDefined(formData, "subject", input.subject);
    appendDefined(formData, "content", input.content);
    return formData;
}

/**
 * Función que hace que `DashboardDataApi` funcione igual independientemente de donde vengan los datos
 *
 * `getInitialGroupedApplications` no carga datos ya que llegan por SSR, los datos se cargan
 * directamente al `useState`
 */
export function createServerDataApi(initial: GroupedApplications): DashboardDataApi {
    return {
        getInitialGroupedApplications() {
            return initial;
        },
        async createApplication(input: CreateApplicationApiInput) {
            return createApplicationAction(buildApplicationFormData(input));
        },
        async updateApplication(id: string, input: UpdateApplicationApiInput) {
            const formData = buildApplicationFormData(input);
            formData.set("applicationId", id);
            return updateApplicationAction(formData);
        },
        async deleteApplication(id: string) {
            return deleteApplicationAction(id);
        },
        async updateApplicationStatus(id, status) {
            return updateApplicationStatusAction(id, status);
        },
        async createNote(applicationId: string, input: CreateNoteApiInput) {
            const formData = buildNoteFormData(input);
            formData.set("applicationId", applicationId);
            return createNoteAction(formData);
        },
        async updateNote(noteId: string, input: UpdateNoteApiInput) {
            const formData = buildNoteFormData(input);
            formData.set("noteId", noteId);
            return updateNoteAction(formData);
        },
        // Se pasa param applicationId para mantener consistencia entre métodos server y local
        async deleteNote(_applicationId: string, noteId: string) {
            return deleteNoteAction(noteId);
        },
    };
}
