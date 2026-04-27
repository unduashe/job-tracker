"use client";

import type { ReactNode } from "react";

type IconButtonProps = {
    onClick?: () => void;
    ariaLabel: string;
    icon: ReactNode;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    className?: string;
};

/**
 * Botón de icono genérico reutilizable.
 */
export function IconButton({
    onClick,
    ariaLabel,
    icon,
    disabled = false,
    type = "button",
    className = "",
}: IconButtonProps) {
    const mergedClassName = [
        "rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            onClick={onClick}
            aria-label={ariaLabel}
            disabled={disabled}
            className={mergedClassName}
        >
            {icon}
        </button>
    );
}
