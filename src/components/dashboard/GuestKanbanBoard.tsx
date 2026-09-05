"use client";

import dynamic from "next/dynamic";
import { BoardSkeleton } from "@/components/dashboard/BoardSkeleton";

/**
 * Wrapper del tablero en modo invitado.
 *
 * Carga la implementación con `next/dynamic({ ssr: false })` para que
 * quede todo en el cliente, mostrando un skeleton mientras se hidrata.
 */
const GuestKanbanBoardImpl = dynamic(
    () =>
        import("@/components/dashboard/GuestKanbanBoardImpl").then(
            (module) => module.GuestKanbanBoardImpl,
        ),
    {
        ssr: false,
        loading: () => <BoardSkeleton />,
    },
);

export function GuestKanbanBoard() {
    return <GuestKanbanBoardImpl />;
}
