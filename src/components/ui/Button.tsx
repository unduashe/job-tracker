"use client";

import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "danger-outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

const VARIANT_STYLES: Record<ButtonVariant, string> = {
    primary:
        "bg-zinc-900 text-white hover:cursor-pointer hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500",
    secondary:
        "border border-zinc-300 bg-white text-zinc-700 hover:cursor-pointer hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60",
    danger:
        "bg-red-600 text-white hover:cursor-pointer hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400",
    "danger-outline":
        "border border-red-200 bg-white text-red-700 hover:cursor-pointer hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60",
    ghost: "text-zinc-700 hover:cursor-pointer hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60",
};

/**
 * Botón reutilizable con variantes visuales.
 */
export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
    const mergedClassName = [
        "rounded-md px-4 py-2 text-sm font-medium transition-colors",
        VARIANT_STYLES[variant],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return <button type={type} className={mergedClassName} {...props} />;
}
