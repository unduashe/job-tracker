"use client";

import type { InputHTMLAttributes } from "react";
import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

const INPUT_CLASS =
    "w-full rounded-lg border border-border-strong bg-surface-card py-2 pl-3 pr-11 text-foreground outline-none transition placeholder:text-foreground-subtle focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export type PasswordInputProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange"
>;

/**
 * Campo de contraseña con botón para alternar visibilidad.
 */
export function PasswordInput({ id: idProp, name, className = "", disabled, ...rest }: PasswordInputProps) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const [visible, setVisible] = useState(false);

    const mergedInputClass = [INPUT_CLASS, className].filter(Boolean).join(" ");

    return (
        <div className="relative">
            <input
                {...rest}
                id={id}
                name={name}
                type={visible ? "text" : "password"}
                disabled={disabled}
                className={mergedInputClass}
            />
            <button
                type="button"
                disabled={disabled}
                onClick={() => setVisible((previous) => !previous)}
                className="absolute inset-y-0 right-2 flex items-center rounded p-1 text-foreground-muted transition hover:text-brand-700 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-controls={id}
            >
                {visible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
        </div>
    );
}
