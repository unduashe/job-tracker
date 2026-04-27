"use client";

import type { InputHTMLAttributes } from "react";
import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

const INPUT_CLASS =
    "w-full rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-11 text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300";

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
                className="absolute inset-y-0 right-2 flex items-center rounded p-1 text-zinc-500 transition hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-controls={id}
            >
                {visible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
        </div>
    );
}
