"use client";

import { useDraggable } from "@dnd-kit/core";
import type { ApplicationRow } from "@/lib/applications/types";

type BaseApplicationCardProps = {
    application: ApplicationRow;
};

type OverlayApplicationCardProps = BaseApplicationCardProps & {
    isOverlay: true;
};

type StandardApplicationCardProps = BaseApplicationCardProps & {
    isOverlay?: false;
    onOpenDetails: (application: ApplicationRow) => void;
};

type ApplicationCardProps = OverlayApplicationCardProps | StandardApplicationCardProps;

/**
 * Muestra una aplicación individual. Toda la tarjeta es clickeable.
 */
export function ApplicationCard(props: ApplicationCardProps) {
    const { application } = props;

    if (props.isOverlay) {
        return <OverlayApplicationCard application={application} />;
    }

    return <DraggableApplicationCard application={application} onOpenDetails={props.onOpenDetails} />;
}

type CardVisualProps = {
    application: ApplicationRow;
};

function OverlayApplicationCard({ application }: CardVisualProps) {
    return (
        <article className="scale-105 cursor-grabbing rounded-lg border border-zinc-300 bg-white p-4 shadow-xl ring-1 ring-black/5">
            <h3 className="text-sm font-semibold text-zinc-900">{application.company}</h3>
            {application.role ? <p className="mt-1 text-sm italic text-zinc-600">{application.role}</p> : null}
        </article>
    );
}

type DraggableApplicationCardProps = {
    application: ApplicationRow;
    onOpenDetails: (application: ApplicationRow) => void;
};

function DraggableApplicationCard({ application, onOpenDetails }: DraggableApplicationCardProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: application.id,
        data: application,
    });

    return (
        <article
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={() => onOpenDetails(application)}
            className={`rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:cursor-pointer hover:border-zinc-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ${
                isDragging ? "opacity-30" : ""
            }`}
        >
            <h3 className="text-sm font-semibold text-zinc-900">{application.company}</h3>
            {application.role ? <p className="mt-1 text-sm italic text-zinc-600">{application.role}</p> : null}
        </article>
    );
}