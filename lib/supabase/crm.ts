import { CrmAction } from "@/lib/crm-actions";
import { SEED } from "@/lib/seed";
import {
  Cliente,
  CrmData,
  EventoCalendario,
  Proyecto,
  Tarea,
} from "@/lib/types";
import { createSupabaseAdminClient } from "./server";

const TABLES = {
  clientes: "crm_clientes",
  proyectos: "crm_proyectos",
  tareas: "crm_tareas",
  eventos: "crm_eventos",
} as const;

type ClienteRow = {
  id: string;
  nombre: string;
  empresa: string | null;
  tipo_negocio: string | null;
  inicio: string;
  implementacion: number | null;
  mantenimiento_mes: number | null;
};

type ProyectoRow = {
  id: string;
  nombre: string;
  cliente: string | null;
  descripcion: string | null;
  estado: Proyecto["estado"];
  etiquetas: string[] | null;
  created_at: string;
};

type TareaRow = {
  id: string;
  titulo: string;
  descripcion: string | null;
  estado: Tarea["estado"];
  prioridad: Tarea["prioridad"];
  tipo: Tarea["tipo"];
  fecha_limite: string | null;
  hora: string | null;
  asignado_a: string | null;
  created_at: string;
};

type EventoRow = {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: EventoCalendario["tipo"];
  estado: EventoCalendario["estado"];
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  asignado_a: string | null;
};

function compact<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

function failIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function crmTable(table: string) {
  return createSupabaseAdminClient().from(table) as any;
}

function toCliente(row: ClienteRow): Cliente {
  return {
    id: row.id,
    nombre: row.nombre,
    empresa: row.empresa ?? "",
    tipoNegocio: row.tipo_negocio ?? "",
    inicio: row.inicio,
    implementacion: Number(row.implementacion ?? 0),
    mantenimientoMes: Number(row.mantenimiento_mes ?? 0),
  };
}

function fromCliente(cliente: Cliente): ClienteRow {
  return {
    id: cliente.id,
    nombre: cliente.nombre,
    empresa: cliente.empresa,
    tipo_negocio: cliente.tipoNegocio,
    inicio: cliente.inicio,
    implementacion: cliente.implementacion,
    mantenimiento_mes: cliente.mantenimientoMes,
  };
}

function clientePatch(cliente: Partial<Cliente>) {
  return compact({
    nombre: cliente.nombre,
    empresa: cliente.empresa,
    tipo_negocio: cliente.tipoNegocio,
    inicio: cliente.inicio,
    implementacion: cliente.implementacion,
    mantenimiento_mes: cliente.mantenimientoMes,
  });
}

function toProyecto(row: ProyectoRow): Proyecto {
  return {
    id: row.id,
    nombre: row.nombre,
    cliente: row.cliente ?? "",
    descripcion: row.descripcion ?? "",
    estado: row.estado,
    etiquetas: row.etiquetas ?? [],
    createdAt: row.created_at,
  };
}

function fromProyecto(proyecto: Proyecto): ProyectoRow {
  return {
    id: proyecto.id,
    nombre: proyecto.nombre,
    cliente: proyecto.cliente,
    descripcion: proyecto.descripcion,
    estado: proyecto.estado,
    etiquetas: proyecto.etiquetas,
    created_at: proyecto.createdAt,
  };
}

function proyectoPatch(proyecto: Partial<Proyecto>) {
  return compact({
    nombre: proyecto.nombre,
    cliente: proyecto.cliente,
    descripcion: proyecto.descripcion,
    estado: proyecto.estado,
    etiquetas: proyecto.etiquetas,
    created_at: proyecto.createdAt,
  });
}

function toTarea(row: TareaRow): Tarea {
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion ?? "",
    estado: row.estado,
    prioridad: row.prioridad,
    tipo: row.tipo,
    fechaLimite: row.fecha_limite,
    hora: row.hora,
    asignadoA: row.asignado_a ?? "",
    createdAt: row.created_at,
  };
}

function fromTarea(tarea: Tarea): TareaRow {
  return {
    id: tarea.id,
    titulo: tarea.titulo,
    descripcion: tarea.descripcion,
    estado: tarea.estado,
    prioridad: tarea.prioridad,
    tipo: tarea.tipo,
    fecha_limite: tarea.fechaLimite,
    hora: tarea.hora,
    asignado_a: tarea.asignadoA,
    created_at: tarea.createdAt,
  };
}

function tareaPatch(tarea: Partial<Tarea>) {
  return compact({
    titulo: tarea.titulo,
    descripcion: tarea.descripcion,
    estado: tarea.estado,
    prioridad: tarea.prioridad,
    tipo: tarea.tipo,
    fecha_limite: tarea.fechaLimite,
    hora: tarea.hora,
    asignado_a: tarea.asignadoA,
    created_at: tarea.createdAt,
  });
}

function toEvento(row: EventoRow): EventoCalendario {
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion ?? "",
    tipo: row.tipo,
    estado: row.estado,
    fecha: row.fecha,
    horaInicio: row.hora_inicio,
    horaFin: row.hora_fin,
    asignadoA: row.asignado_a ?? "",
  };
}

function fromEvento(evento: EventoCalendario): EventoRow {
  return {
    id: evento.id,
    titulo: evento.titulo,
    descripcion: evento.descripcion,
    tipo: evento.tipo,
    estado: evento.estado,
    fecha: evento.fecha,
    hora_inicio: evento.horaInicio,
    hora_fin: evento.horaFin,
    asignado_a: evento.asignadoA,
  };
}

function eventoPatch(evento: Partial<EventoCalendario>) {
  return compact({
    titulo: evento.titulo,
    descripcion: evento.descripcion,
    tipo: evento.tipo,
    estado: evento.estado,
    fecha: evento.fecha,
    hora_inicio: evento.horaInicio,
    hora_fin: evento.horaFin,
    asignado_a: evento.asignadoA,
  });
}

export async function getCrmData(): Promise<CrmData> {
  const supabase = createSupabaseAdminClient();

  const [clientes, proyectos, tareas, eventos] = await Promise.all([
    supabase
      .from(TABLES.clientes)
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from(TABLES.proyectos)
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from(TABLES.tareas)
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from(TABLES.eventos)
      .select("*")
      .order("fecha", { ascending: true })
      .order("hora_inicio", { ascending: true }),
  ]);

  failIf(clientes.error);
  failIf(proyectos.error);
  failIf(tareas.error);
  failIf(eventos.error);

  return {
    clientes: ((clientes.data ?? []) as ClienteRow[]).map(toCliente),
    proyectos: ((proyectos.data ?? []) as ProyectoRow[]).map(toProyecto),
    tareas: ((tareas.data ?? []) as TareaRow[]).map(toTarea),
    eventos: ((eventos.data ?? []) as EventoRow[]).map(toEvento),
  };
}

async function updateById(table: string, id: string, patch: Record<string, unknown>) {
  if (Object.keys(patch).length === 0) return;
  const { error } = await crmTable(table).update(patch).eq("id", id);
  failIf(error);
}

async function deleteById(table: string, id: string) {
  const { error } = await crmTable(table).delete().eq("id", id);
  failIf(error);
}

async function clearTable(table: string) {
  const { data, error } = await crmTable(table).select("id");
  failIf(error);

  const ids = ((data ?? []) as { id: string }[]).map((row) => row.id);
  if (ids.length === 0) return;

  const { error: deleteError } = await crmTable(table).delete().in("id", ids);
  failIf(deleteError);
}

async function resetDemoData() {
  await clearTable(TABLES.eventos);
  await clearTable(TABLES.tareas);
  await clearTable(TABLES.proyectos);
  await clearTable(TABLES.clientes);

  const inserts = [
    { table: TABLES.clientes, rows: SEED.clientes.map(fromCliente) },
    { table: TABLES.proyectos, rows: SEED.proyectos.map(fromProyecto) },
    { table: TABLES.tareas, rows: SEED.tareas.map(fromTarea) },
    { table: TABLES.eventos, rows: SEED.eventos.map(fromEvento) },
  ];

  for (const insert of inserts) {
    if (insert.rows.length === 0) continue;
    const { error } = await crmTable(insert.table).insert(insert.rows);
    failIf(error);
  }
}

export async function applyCrmAction(action: CrmAction): Promise<void> {
  switch (action.type) {
    case "addCliente": {
      const { error } = await crmTable(TABLES.clientes).insert(
        fromCliente(action.cliente),
      );
      failIf(error);
      break;
    }
    case "updateCliente":
      await updateById(TABLES.clientes, action.id, clientePatch(action.cliente));
      break;
    case "removeCliente":
      await deleteById(TABLES.clientes, action.id);
      break;
    case "addProyecto": {
      const { error } = await crmTable(TABLES.proyectos).insert(
        fromProyecto(action.proyecto),
      );
      failIf(error);
      break;
    }
    case "updateProyecto":
      await updateById(TABLES.proyectos, action.id, proyectoPatch(action.proyecto));
      break;
    case "removeProyecto":
      await deleteById(TABLES.proyectos, action.id);
      break;
    case "moveProyecto":
      await updateById(TABLES.proyectos, action.id, { estado: action.estado });
      break;
    case "addTarea": {
      const { error } = await crmTable(TABLES.tareas).insert(
        fromTarea(action.tarea),
      );
      failIf(error);
      break;
    }
    case "updateTarea":
      await updateById(TABLES.tareas, action.id, tareaPatch(action.tarea));
      break;
    case "removeTarea":
      await deleteById(TABLES.tareas, action.id);
      break;
    case "moveTarea":
      await updateById(TABLES.tareas, action.id, { estado: action.estado });
      break;
    case "addEvento": {
      const { error } = await crmTable(TABLES.eventos).insert(
        fromEvento(action.evento),
      );
      failIf(error);
      break;
    }
    case "updateEvento":
      await updateById(TABLES.eventos, action.id, eventoPatch(action.evento));
      break;
    case "removeEvento":
      await deleteById(TABLES.eventos, action.id);
      break;
    case "resetDemo":
      await resetDemoData();
      break;
  }
}
