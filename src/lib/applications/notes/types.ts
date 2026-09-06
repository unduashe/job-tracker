export type NoteRow = {
    id: string;
    application_id: string;
    subject: string;
    content: string;
    created_at: string;
    updated_at: string;
};

/**
 * Payload tras borrar una nota: la candidatura dueña, para actualizar el estado agrupado.
 */
export type DeleteNoteResult = {
    applicationId: string;
};
