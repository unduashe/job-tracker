import type { ApplicationStatus } from "@/lib/applications/schema";
import type { ApplicationRow, GroupedApplications } from "@/lib/applications/types";
import type { DeleteNoteResult, NoteRow } from "@/lib/applications/notes/types";
import type { Result } from "@/lib/applications/dataApi/result";

/**
 * Modos en los que el dashboard puede operar
 * `auth` persiste contra Supabase; `guest` persiste en localStorage.
 */
export type DashboardMode = "auth" | "guest";

/**
 * Tipos para formData y dataApi, siempre se envía toda la información y luego a nivel de backend
 * se limpian datos realmente no cumplimentados, etc con zod.
 */
export type CreateApplicationApiInput = {
    company: string;
    role: string;
    description: string;
    status: string;
};

export type UpdateApplicationApiInput = CreateApplicationApiInput;

export type CreateNoteApiInput = {
    subject: string;
    content: string;
};

export type UpdateNoteApiInput = CreateNoteApiInput;

/**
 * Contrato común del backend del dashboard.
 *
 * Implementaciones disponibles:
 * - `serverDataApi`: invoca Server Actions contra Supabase.
 * - `localDataApi`: persiste en localStorage para el modo invitado.
 *
 * Se hace uso de `Result<T>` para tipar de forma homogénea los datos devueltos
 */
export type DashboardDataApi = {
    /**
     * Carga inicial de todas las candidaturas agrupadas.
     * - En auth la carga ocurre server-side.
     * - En guest se llama de forma síncrona durante la inicialización lazy
     *   del provider (`useState(() => api.getInitialGroupedApplications())`).
     */
    getInitialGroupedApplications(): GroupedApplications;
    createApplication(input: CreateApplicationApiInput): Promise<Result<ApplicationRow>>;
    updateApplication(
        id: string,
        input: UpdateApplicationApiInput,
    ): Promise<Result<ApplicationRow>>;
    deleteApplication(id: string): Promise<Result>;
    updateApplicationStatus(
        id: string,
        status: ApplicationStatus,
    ): Promise<Result<ApplicationRow>>;
    createNote(applicationId: string, input: CreateNoteApiInput): Promise<Result<NoteRow>>;
    updateNote(noteId: string, input: UpdateNoteApiInput): Promise<Result<NoteRow>>;
    deleteNote(noteId: string): Promise<Result<DeleteNoteResult>>;
};
