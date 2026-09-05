import {
    createApplicationSchema,
    updateApplicationSchema,
} from "@/lib/applications/schema";
import {
    createNoteSchema,
    updateNoteSchema,
} from "@/lib/applications/notes/schema";
import {
    failFromError,
    fail,
    ok,
} from "@/lib/applications/dataApi/result";
import {
    applyApplicationCreate,
    applyApplicationDelete,
    applyApplicationUpdate,
    applyNoteCreate,
    applyNoteDelete,
    applyNoteUpdate,
} from "@/lib/applications/dataApi/groupedReducers";
import {
    groupedToSnapshot,
    readPersistedSnapshot,
    snapshotToGrouped,
    writePersistedSnapshot,
} from "@/lib/applications/local/storage";
import type {
    CreateApplicationApiInput,
    CreateNoteApiInput,
    DashboardDataApi,
    UpdateApplicationApiInput,
    UpdateNoteApiInput,
} from "@/lib/applications/dataApi/types";
import type { ApplicationRow, GroupedApplications } from "@/lib/applications/types";
import type { NoteRow } from "@/lib/applications/notes/types";

/**
 * Identificador específico para modo guest
 */
export const GUEST_USER_ID = "guest-local";

function nowIso(): string {
    return new Date().toISOString();
}

function newId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    // Fallback para localStorage si no se ha podido obtener a través de crypto
    return `local-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function loadGrouped(): GroupedApplications {
    return snapshotToGrouped(readPersistedSnapshot());
}

function persistGrouped(grouped: GroupedApplications): void {
    writePersistedSnapshot(groupedToSnapshot(grouped));
}

function findApplicationById(
    grouped: GroupedApplications,
    id: string,
): ApplicationRow | null {
    for (const status of Object.keys(grouped) as Array<keyof GroupedApplications>) {
        const found = grouped[status].find((application) => application.id === id);
        if (found) {
            return found;
        }
    }
    return null;
}

function findNoteById(
    grouped: GroupedApplications,
    noteId: string,
): NoteRow | null {
    for (const status of Object.keys(grouped) as Array<keyof GroupedApplications>) {
        for (const application of grouped[status]) {
            const note = application.notes?.find((current) => current.id === noteId);
            if (note) {
                return note;
            }
        }
    }
    return null;
}

/**
 * Hace que `DashboardDataApi` funcione igual independientemente de donde vengan los datos
 */
export function createLocalDataApi(): DashboardDataApi {
    return {
        getInitialGroupedApplications() {
            return loadGrouped();
        },

        async createApplication(input: CreateApplicationApiInput) {
            try {
                const parsed = createApplicationSchema.parse(input);
                const timestamp = nowIso();
                const application: ApplicationRow = {
                    id: newId(),
                    user_id: GUEST_USER_ID,
                    company: parsed.company,
                    role: parsed.role ?? null,
                    description: parsed.description ?? null,
                    status: parsed.status ?? "applied",
                    created_at: timestamp,
                    updated_at: timestamp,
                    notes: [],
                };

                const next = applyApplicationCreate(loadGrouped(), application);
                persistGrouped(next);
                return ok(application);
            } catch (error) {
                console.error("localDataApi.createApplication error:", error);
                return failFromError("No se ha podido crear la aplicación", error);
            }
        },

        async updateApplication(id: string, input: UpdateApplicationApiInput) {
            try {
                const parsed = updateApplicationSchema.parse(input);
                const grouped = loadGrouped();
                const existing = findApplicationById(grouped, id);

                if (!existing) {
                    return fail("No se ha podido actualizar la aplicación", [
                        "No se ha encontrado la aplicación o no tienes permisos",
                    ]);
                }

                const merged: ApplicationRow = {
                    ...existing,
                    company: parsed.company ?? existing.company,
                    role: parsed.role !== undefined ? parsed.role : existing.role,
                    description:
                        parsed.description !== undefined ? parsed.description : existing.description,
                    status: parsed.status ?? existing.status,
                    updated_at: nowIso(),
                };

                const next = applyApplicationUpdate(grouped, merged);
                persistGrouped(next);
                return ok(merged);
            } catch (error) {
                console.error("localDataApi.updateApplication error:", error);
                return failFromError("No se ha podido actualizar la aplicación", error);
            }
        },

        async deleteApplication(id: string) {
            try {
                const grouped = loadGrouped();
                const existing = findApplicationById(grouped, id);

                if (!existing) {
                    return fail("No se ha podido eliminar la aplicación", [
                        "No se ha encontrado la aplicación o no tienes permisos",
                    ]);
                }

                const next = applyApplicationDelete(grouped, id);
                persistGrouped(next);
                return ok(undefined);
            } catch (error) {
                console.error("localDataApi.deleteApplication error:", error);
                return failFromError("No se ha podido eliminar la aplicación", error);
            }
        },

        async updateApplicationStatus(id, status) {
            try {
                const grouped = loadGrouped();
                const existing = findApplicationById(grouped, id);

                if (!existing) {
                    return fail("No se ha podido actualizar la aplicación", [
                        "No se ha encontrado la aplicación o no tienes permisos",
                    ]);
                }

                const merged: ApplicationRow = {
                    ...existing,
                    status,
                    updated_at: nowIso(),
                };

                const next = applyApplicationUpdate(grouped, merged);
                persistGrouped(next);
                return ok(merged);
            } catch (error) {
                console.error("localDataApi.updateApplicationStatus error:", error);
                return failFromError(
                    "No se ha podido actualizar el estado de la aplicación",
                    error,
                );
            }
        },

        async createNote(applicationId: string, input: CreateNoteApiInput) {
            try {
                const parsed = createNoteSchema.parse(input);
                const grouped = loadGrouped();
                const existing = findApplicationById(grouped, applicationId);

                if (!existing) {
                    return fail("No se ha podido crear la nota", [
                        "No se ha encontrado la candidatura o no tienes permisos",
                    ]);
                }

                const timestamp = nowIso();
                const note: NoteRow = {
                    id: newId(),
                    application_id: applicationId,
                    subject: parsed.subject,
                    content: parsed.content,
                    created_at: timestamp,
                    updated_at: timestamp,
                };

                const next = applyNoteCreate(grouped, applicationId, note);
                persistGrouped(next);
                return ok(note);
            } catch (error) {
                console.error("localDataApi.createNote error:", error);
                return failFromError("No se ha podido crear la nota", error);
            }
        },

        async updateNote(noteId: string, input: UpdateNoteApiInput) {
            try {
                const parsed = updateNoteSchema.parse(input);
                const grouped = loadGrouped();
                const existing = findNoteById(grouped, noteId);

                if (!existing) {
                    return fail("No se ha podido actualizar la nota", [
                        "No se ha encontrado la nota o no tienes permisos",
                    ]);
                }

                if (parsed.subject === undefined && parsed.content === undefined) {
                    return fail("No se ha podido actualizar la nota", [
                        "No se han detectado cambios",
                    ]);
                }

                const merged: NoteRow = {
                    ...existing,
                    subject: parsed.subject ?? existing.subject,
                    content: parsed.content ?? existing.content,
                    updated_at: nowIso(),
                };

                const next = applyNoteUpdate(grouped, merged);
                persistGrouped(next);
                return ok(merged);
            } catch (error) {
                console.error("localDataApi.updateNote error:", error);
                return failFromError("No se ha podido actualizar la nota", error);
            }
        },

        async deleteNote(applicationId: string, noteId: string) {
            try {
                const grouped = loadGrouped();
                const existing = findNoteById(grouped, noteId);

                if (!existing) {
                    return fail("No se ha podido eliminar la nota", [
                        "No se ha encontrado la nota o no tienes permisos",
                    ]);
                }

                const next = applyNoteDelete(grouped, applicationId, noteId);
                persistGrouped(next);
                return ok(undefined);
            } catch (error) {
                console.error("localDataApi.deleteNote error:", error);
                return failFromError("No se ha podido eliminar la nota", error);
            }
        },
    };
}
