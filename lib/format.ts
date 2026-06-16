import { Cliente } from "./types";

/** Total anual de un cliente: implementación + 12 meses de mantenimiento. */
export function totalAnual(c: Pick<Cliente, "implementacion" | "mantenimientoMes">): number {
  return (c.implementacion || 0) + (c.mantenimientoMes || 0) * 12;
}

/** Formatea un importe en euros: 10260 -> "10.260 €" */
export function euros(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

/** Formatea una fecha ISO (YYYY-MM-DD) a "30/4/2026". */
export function fechaCorta(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "—";
  return `${d}/${m}/${y}`;
}

/** Saludo según la hora del día. */
export function saludoPorHora(date = new Date()): string {
  const h = date.getHours();
  if (h >= 6 && h < 14) return "Buenos días";
  if (h >= 14 && h < 21) return "Buenas tardes";
  return "Buenas noches";
}

/** Devuelve los días de diferencia respecto a hoy (negativo = en el pasado). */
export function diasDesdeHoy(iso: string | null): number | null {
  if (!iso) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const [y, m, d] = iso.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  fecha.setHours(0, 0, 0, 0);
  return Math.round((fecha.getTime() - hoy.getTime()) / 86400000);
}

/** Texto relativo a partir de un nº de días (p.ej. "Hace 3d", "En 2d", "Hoy"). */
export function textoRelativo(dias: number | null): string {
  if (dias === null) return "Sin fecha";
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Mañana";
  if (dias === -1) return "Ayer";
  if (dias < 0) return `Hace ${Math.abs(dias)}d`;
  return `En ${dias}d`;
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
