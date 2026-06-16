// ───────────────────────────────────────────────────────────
// Tipos de datos del CRM
// ───────────────────────────────────────────────────────────

export interface Cliente {
  id: string;
  nombre: string;
  empresa: string;
  tipoNegocio: string;
  inicio: string; // ISO date (YYYY-MM-DD)
  implementacion: number; // € pago único
  mantenimientoMes: number; // € / mes
}

export type EstadoProyecto =
  | "pendiente"
  | "en_progreso"
  | "pendiente_cliente"
  | "terminado";

export interface Proyecto {
  id: string;
  nombre: string;
  cliente: string;
  descripcion: string;
  estado: EstadoProyecto;
  etiquetas: string[]; // p.ej. ["Demo", "Propuesta"]
  createdAt: string;
}

export type EstadoTarea = "pendiente" | "en_progreso" | "completada";
export type Prioridad = "alta" | "media" | "baja";
export type TipoTarea = "demo" | "reunion" | "otro";

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: EstadoTarea;
  prioridad: Prioridad;
  tipo: TipoTarea;
  fechaLimite: string | null; // ISO date
  hora: string | null; // HH:mm
  asignadoA: string;
  createdAt: string;
}

export type EstadoEvento = "pendiente" | "en_progreso" | "completada";

export interface EventoCalendario {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoTarea;
  estado: EstadoEvento;
  fecha: string; // ISO date (YYYY-MM-DD)
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  asignadoA: string;
}

export interface CrmData {
  clientes: Cliente[];
  proyectos: Proyecto[];
  tareas: Tarea[];
  eventos: EventoCalendario[];
}
