import type { ApplicationStatus } from "./schema";

export type ApplicationRow = {
    id: string;
    user_id: string;
    company: string;
    role: string | null;
    description: string | null;
    status: ApplicationStatus;
    created_at: string;
    updated_at: string;
};
