"use client";

import { useCallback, useEffect, useState } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { CloseIcon } from "@/components/ui/icons";

type ErrorToastProps = {
    isOpen: boolean;
    title: string;
    details: string[];
    onClose: () => void;
    autoCloseMs?: number;
};

const EXIT_ANIMATION_MS = 300;

/**
 * Toast de error con aparición inmediata y salida deslizante con desvanecido.
 */
export function ErrorToast({
    isOpen,
    title,
    details,
    onClose,
    autoCloseMs = 5000,
}: ErrorToastProps) {
    const [isClosing, setIsClosing] = useState(false);

    const closeWithAnimation = useCallback(() => {
        if (!isOpen || isClosing) {
            return;
        }

        setIsClosing(true);
    }, [isClosing, isOpen]);

    useEffect(() => {
        if (!isClosing) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, EXIT_ANIMATION_MS);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [isClosing, onClose]);

    useEffect(() => {
        if (!isOpen || isClosing) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            closeWithAnimation();
        }, autoCloseMs);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [autoCloseMs, closeWithAnimation, isClosing, isOpen]);

    if (!isOpen && !isClosing) {
        return null;
    }

    const isVisible = isOpen && !isClosing;

    return (
        <aside
            role={isVisible ? "alert" : undefined}
            aria-hidden={!isVisible}
            data-state={isVisible ? "open" : "closed"}
            onClick={(event) => event.stopPropagation()}
            className="fixed left-3 right-3 top-3 z-[100] w-auto transform rounded-xl border border-danger-200 bg-danger-50 p-3 shadow-card duration-300 ease-out data-[state=open]:translate-x-0 data-[state=open]:opacity-100 data-[state=open]:transition-none data-[state=open]:pointer-events-auto data-[state=closed]:translate-x-[120%] data-[state=closed]:opacity-0 data-[state=closed]:transition data-[state=closed]:pointer-events-none sm:left-auto sm:right-6 sm:top-4 sm:w-full sm:max-w-md sm:p-4 lg:right-8"
        >
            <div className="mb-2 flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold text-danger-900">{title}</h4>
                <IconButton
                    onClick={closeWithAnimation}
                    ariaLabel="Cerrar error"
                    icon={<CloseIcon />}
                    className="text-danger-700 hover:cursor-pointer hover:bg-danger-100"
                />
            </div>

            {details.length > 0 ? (
                <ul className="list-inside list-disc space-y-1 text-sm text-danger-700">
                    {details.map((detail, index) => (
                        <li key={`${detail}-${index}`}>{detail}</li>
                    ))}
                </ul>
            ) : null}
        </aside>
    );
}
