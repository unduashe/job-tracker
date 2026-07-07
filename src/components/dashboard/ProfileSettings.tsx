"use client";

import Link from "next/link";
import { useState, useTransition, type ChangeEvent, type Dispatch, type SetStateAction, type SyntheticEvent } from "react";
import {
    changeProfilePasswordAction,
    updateProfileEmailAction,
} from "@/app/dashboard/profile/actions";
import { ErrorToast } from "@/components/ErrorToast";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { EditIcon } from "@/components/ui/icons";
import { PasswordInput } from "@/components/ui/PasswordInput";

type ProfileSettingsProps = {
    currentEmail: string;
};

type ErrorState = {
    title: string;
    details: string[];
};

/**
 * Actualiza un campo del estado del formulario a partir del atributo `name` del input.
 */
function createFieldChangeHandler<T extends Record<string, string>>(
    setForm: Dispatch<SetStateAction<T>>,
) {
    return (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };
}

/**
 * Página de ajustes de perfil con cards inline para email y contraseña.
 */
export function ProfileSettings({ currentEmail }: ProfileSettingsProps) {
    return (
        <div className="mx-auto w-full max-w-5xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold text-foreground">Información de perfil</h1>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center rounded-md border border-border-strong bg-surface-card 
                    px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:cursor-pointer 
                    hover:border-brand-100 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 
                    focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-panel"
                >
                    Volver al tablero
                </Link>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                <ProfileEmailCard currentEmail={currentEmail} />
                <ProfilePasswordCard />
            </div>
        </div>
    );
}

type ProfileEmailCardProps = {
    currentEmail: string;
};

type EmailFormState = {
    email: string;
};

const INITIAL_EMAIL_FORM: EmailFormState = {
    email: "",
};

/**
 * Card para visualizar y actualizar el correo electrónico del usuario.
 */
function ProfileEmailCard({ currentEmail }: ProfileEmailCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<EmailFormState>(INITIAL_EMAIL_FORM);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorState, setErrorState] = useState<ErrorState | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleFieldChange = createFieldChangeHandler(setForm);

    const handleCancel = () => {
        setIsEditing(false);
        setForm(INITIAL_EMAIL_FORM);
        setErrorState(null);
    };

    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSuccessMessage(null);
        setErrorState(null);

        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
            const response = await updateProfileEmailAction(formData);

            if (!response.success) {
                setErrorState({
                    title: "No se pudo actualizar el correo",
                    details:
                        response.details && response.details.length > 0
                            ? response.details
                            : [response.message],
                });
                return;
            }

            setSuccessMessage(response.message);
            setIsEditing(false);
            setForm(INITIAL_EMAIL_FORM);
        });
    };

    return (
        <>
            <article className="rounded-xl border border-border-subtle bg-surface-panel p-6 shadow-card">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Correo electrónico</h2>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground" htmlFor="profile-current-email">
                            Correo actual
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                id="profile-current-email"
                                type="email"
                                value={currentEmail}
                                disabled
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-foreground-muted outline-none"
                            />
                            {!isEditing ? (
                                <IconButton
                                    onClick={() => {
                                        setSuccessMessage(null);
                                        setIsEditing(true);
                                    }}
                                    ariaLabel="Editar correo electrónico"
                                    icon={<EditIcon />}
                                    className="shrink-0 text-foreground-muted hover:cursor-pointer hover:bg-surface-muted hover:text-foreground"
                                />
                            ) : null}
                        </div>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4 border-t border-border-subtle pt-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-foreground" htmlFor="profile-new-email">
                                    Nuevo correo electrónico
                                </label>
                                <input
                                    id="profile-new-email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleFieldChange}
                                    autoComplete="email"
                                    required
                                    className="w-full rounded-lg border border-border-strong bg-surface-card px-3 py-2 
                                    text-foreground outline-none transition placeholder:text-foreground-subtle 
                                    focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                                    placeholder="nuevo@email.com"
                                />
                                <p className="text-sm text-foreground-muted">
                                    Se enviará un mensaje de confirmación para efectuar el cambio.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={isPending || form.email.trim().length === 0}
                                >
                                    {isPending ? "Guardando…" : "Confirmar"}
                                </Button>
                                <Button type="button" variant="secondary" disabled={isPending} onClick={handleCancel}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    ) : null}

                    {successMessage ? (
                        <p aria-live="polite" className="text-sm text-success-700">
                            {successMessage}
                        </p>
                    ) : null}
                </div>
            </article>

            <ErrorToast
                isOpen={errorState !== null}
                title={errorState?.title ?? ""}
                details={errorState?.details ?? []}
                onClose={() => setErrorState(null)}
            />
        </>
    );
}

type PasswordFormState = {
    currentPassword: string;
    password: string;
    confirmPassword: string;
};

const INITIAL_PASSWORD_FORM: PasswordFormState = {
    currentPassword: "",
    password: "",
    confirmPassword: "",
};

/**
 * Card para visualizar y actualizar la contraseña del usuario.
 */
function ProfilePasswordCard() {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<PasswordFormState>(INITIAL_PASSWORD_FORM);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorState, setErrorState] = useState<ErrorState | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleFieldChange = createFieldChangeHandler(setForm);

    const handleCancel = () => {
        setIsEditing(false);
        setForm(INITIAL_PASSWORD_FORM);
        setErrorState(null);
    };

    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSuccessMessage(null);
        setErrorState(null);

        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
            const response = await changeProfilePasswordAction(formData);

            if (!response.success) {
                setErrorState({
                    title: "No se pudo actualizar la contraseña",
                    details:
                        response.details && response.details.length > 0
                            ? response.details
                            : [response.message],
                });
                return;
            }

            setSuccessMessage(response.message);
            setIsEditing(false);
            setForm(INITIAL_PASSWORD_FORM);
        });
    };

    return (
        <>
            <article className="rounded-xl border border-border-subtle bg-surface-panel p-6 shadow-card">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Contraseña</h2>

                <div className="space-y-4">
                    {!isEditing ? (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-foreground" htmlFor="profile-password-mask">
                                Contraseña actual
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    id="profile-password-mask"
                                    type="text"
                                    value="••••••••"
                                    disabled
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-foreground-muted outline-none"
                                    aria-label="Contraseña configurada"
                                />
                                <IconButton
                                    onClick={() => {
                                        setSuccessMessage(null);
                                        setIsEditing(true);
                                    }}
                                    ariaLabel="Modificar contraseña"
                                    icon={<EditIcon />}
                                    className="shrink-0 text-foreground-muted hover:cursor-pointer hover:bg-surface-muted hover:text-foreground"
                                />
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-foreground" htmlFor="profile-current-password">
                                    Contraseña antigua
                                </label>
                                <PasswordInput
                                    id="profile-current-password"
                                    name="currentPassword"
                                    value={form.currentPassword}
                                    onChange={handleFieldChange}
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-foreground" htmlFor="profile-new-password">
                                    Contraseña nueva
                                </label>
                                <PasswordInput
                                    id="profile-new-password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleFieldChange}
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                    placeholder="Mínimo 8 caracteres, letra y número"
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    className="block text-sm font-medium text-foreground"
                                    htmlFor="profile-confirm-password"
                                >
                                    Repite contraseña nueva
                                </label>
                                <PasswordInput
                                    id="profile-confirm-password"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleFieldChange}
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                    placeholder="Repite la contraseña"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={
                                        isPending ||
                                        form.currentPassword.trim().length === 0 ||
                                        form.password.trim().length === 0 ||
                                        form.confirmPassword.trim().length === 0
                                    }
                                >
                                    {isPending ? "Guardando…" : "Confirmar"}
                                </Button>
                                <Button type="button" variant="secondary" disabled={isPending} onClick={handleCancel}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    )}

                    {successMessage ? (
                        <p aria-live="polite" className="text-sm text-success-700">
                            {successMessage}
                        </p>
                    ) : null}
                </div>
            </article>

            <ErrorToast
                isOpen={errorState !== null}
                title={errorState?.title ?? ""}
                details={errorState?.details ?? []}
                onClose={() => setErrorState(null)}
            />
        </>
    );
}
