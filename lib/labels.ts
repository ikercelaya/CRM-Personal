import { Prioridad, TipoTarea } from "./types";

// ── Tipo de tarea / evento ────────────────────────────────
export const TIPO_LABEL: Record<TipoTarea, string> = {
  demo: "Demo",
  reunion: "1ª Reunión",
  otro: "Otro",
};

export const TIPO_CHIP: Record<TipoTarea, string> = {
  demo: "bg-purple-500/15 text-purple-300",
  reunion: "bg-blue-500/15 text-blue-300",
  otro: "bg-zinc-500/20 text-zinc-300",
};

export const TIPO_DOT: Record<TipoTarea, string> = {
  demo: "bg-purple-400",
  reunion: "bg-blue-400",
  otro: "bg-zinc-400",
};

export const TIPO_BAR: Record<TipoTarea, string> = {
  demo: "bg-purple-500",
  reunion: "bg-blue-500",
  otro: "bg-zinc-500",
};

// ── Prioridad ─────────────────────────────────────────────
export const PRIORIDAD_LABEL: Record<Prioridad, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export const PRIORIDAD_DOT: Record<Prioridad, string> = {
  alta: "bg-red-500",
  media: "bg-amber-400",
  baja: "bg-emerald-400",
};

export const PRIORIDAD_TEXT: Record<Prioridad, string> = {
  alta: "text-red-400",
  media: "text-amber-300",
  baja: "text-emerald-300",
};
