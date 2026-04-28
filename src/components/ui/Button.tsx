"use client";

import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "danger-outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

const VARIANT_STYLES: Record<ButtonVariant, string> = {
    primary:
        "bg-brand-600 text-white shadow-sm hover:cursor-pointer hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-100 disabled:text-brand-700",
    secondary:
        "border border-border-strong bg-surface-card text-foreground hover:cursor-pointer hover:border-brand-100 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60",
    danger:
        "bg-danger-600 text-white shadow-sm hover:cursor-pointer hover:bg-danger-700 disabled:cursor-not-allowed disabled:bg-danger-100 disabled:text-danger-700",
    "danger-outline":
        "border border-danger-200 bg-surface-card text-danger-700 hover:cursor-pointer hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-60",
    ghost: "text-foreground-muted hover:cursor-pointer hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60",
};

/**
 * Botón reutilizable con variantes visuales.
 */
export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
    const mergedClassName = [
        "rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-panel",
        VARIANT_STYLES[variant],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return <button type={type} className={mergedClassName} {...props} />;
}
