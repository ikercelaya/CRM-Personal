"use client";

import { useState } from "react";

/**
 * Lógica de arrastrar y soltar (HTML5) reutilizable para los tableros kanban.
 * `onDrop(id, columna)` se llama al soltar una tarjeta sobre una columna.
 */
export function useKanban<Col extends string>(
  onDrop: (id: string, columna: Col) => void,
) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Col | null>(null);

  function cardProps(id: string) {
    return {
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        setDragId(id);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
      },
      onDragEnd: () => {
        setDragId(null);
        setOverCol(null);
      },
    };
  }

  function columnProps(col: Col) {
    return {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (overCol !== col) setOverCol(col);
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain") || dragId;
        if (id) onDrop(id, col);
        setDragId(null);
        setOverCol(null);
      },
    };
  }

  return { dragId, overCol, cardProps, columnProps };
}
