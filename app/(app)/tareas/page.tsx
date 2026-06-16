"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  CircleDashed,
  CircleDot,
  Clock,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { EstadoTarea, Prioridad, Tarea, TipoTarea } from "@/lib/types";
import { useKanban } from "@/lib/useKanban";
import { Modal } from "@/components/Modal";
import { diasDesdeHoy, fechaCorta, textoRelativo } from "@/lib/format";
import {
  PRIORIDAD_DOT,
  PRIORIDAD_LABEL,
  PRIORIDAD_TEXT,
  TIPO_CHIP,
  TIPO_LABEL,
} from "@/lib/labels";

const COLUMNAS: {
  key: EstadoTarea;
  label: string;
  text: string;
  ring: string;
  icon: React.ElementType;
}[] = [
  {
    key: "pendiente",
    label: "Pendiente",
    text: "text-amber-400",
    ring: "ring-amber-400/40",
    icon: CircleDashed,
  },
  {
    key: "en_progreso",
    label: "En Progreso",
    text: "text-blue-400",
    ring: "ring-blue-400/40",
    icon: CircleDot,
  },
  {
    key: "completada",
    label: "Completada",
    text: "text-emerald-400",
    ring: "ring-emerald-400/40",
    icon: CheckCircle2,
  },
];

const PRIORIDAD_BORDER: Record<Prioridad, string> = {
  alta: "border-l-red-500",
  media: "border-l-amber-400",
  baja: "border-l-emerald-400",
};

type Form = {
  titulo: string;
  descripcion: string;
  estado: EstadoTarea;
  prioridad: Prioridad;
  tipo: TipoTarea;
  fechaLimite: string;
  hora: string;
  asignadoA: string;
};

const EMPTY: Form = {
  titulo: "",
  descripcion: "",
  estado: "pendiente",
  prioridad: "media",
  tipo: "otro",
  fechaLimite: "",
  hora: "",
  asignadoA: "Iker",
};

export default function TareasPage() {
  const { data, hydrated, addTarea, updateTarea, removeTarea, moveTarea } =
    useStore();
  const [q, setQ] = useState("");
  const [fPrioridad, setFPrioridad] = useState<Prioridad | "todas">("todas");
  const [fTipo, setFTipo] = useState<TipoTarea | "todos">("todos");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);

  const { dragId, overCol, cardProps, columnProps } =
    useKanban<EstadoTarea>(moveTarea);

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    return data.tareas.filter((x) => {
      if (fPrioridad !== "todas" && x.prioridad !== fPrioridad) return false;
      if (fTipo !== "todos" && x.tipo !== fTipo) return false;
      if (
        t &&
        !x.titulo.toLowerCase().includes(t) &&
        !x.descripcion.toLowerCase().includes(t) &&
        !x.asignadoA.toLowerCase().includes(t)
      )
        return false;
      return true;
    });
  }, [data.tareas, q, fPrioridad, fTipo]);

  const vencidas = useMemo(
    () =>
      data.tareas.filter((t) => {
        if (t.estado === "completada" || !t.fechaLimite) return false;
        const d = diasDesdeHoy(t.fechaLimite);
        return d !== null && d < 0;
      }).length,
    [data.tareas],
  );

  function openNew() {
    setForm(EMPTY);
    setEditId(null);
    setOpen(true);
  }
  function openEdit(t: Tarea) {
    setForm({
      titulo: t.titulo,
      descripcion: t.descripcion,
      estado: t.estado,
      prioridad: t.prioridad,
      tipo: t.tipo,
      fechaLimite: t.fechaLimite ?? "",
      hora: t.hora ?? "",
      asignadoA: t.asignadoA,
    });
    setEditId(t.id);
    setOpen(true);
  }
  function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      fechaLimite: form.fechaLimite || null,
      hora: form.hora || null,
    };
    if (editId) updateTarea(editId, payload);
    else addTarea(payload);
    setOpen(false);
  }
  function del(t: Tarea) {
    if (confirm(`¿Eliminar la tarea "${t.titulo}"?`)) removeTarea(t.id);
  }
  function toggleDone(t: Tarea) {
    moveTarea(t.id, t.estado === "completada" ? "pendiente" : "completada");
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Tareas</h1>
          {hydrated && vencidas > 0 && (
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-accent">
              <Clock className="h-4 w-4" /> {vencidas} vencida
              {vencidas > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button onClick={openNew} className="btn-accent">
          <Plus className="h-4 w-4" /> Nueva Tarea
        </button>
      </div>

      {/* Buscador + filtros */}
      <div className="card space-y-4 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar tareas por título, descripción..."
            className="input py-3 pl-11"
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <PillGroup
            label="Prioridad"
            value={fPrioridad}
            onChange={(v) => setFPrioridad(v as Prioridad | "todas")}
            options={[
              { value: "todas", label: "Todas" },
              { value: "alta", label: "Alta" },
              { value: "media", label: "Media" },
              { value: "baja", label: "Baja" },
            ]}
          />
          <PillGroup
            label="Tipo"
            value={fTipo}
            onChange={(v) => setFTipo(v as TipoTarea | "todos")}
            options={[
              { value: "todos", label: "Todos" },
              { value: "demo", label: "Demo" },
              { value: "reunion", label: "1ª Reunión" },
              { value: "otro", label: "Otro" },
            ]}
          />
        </div>
      </div>

      {/* Tablero */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNAS.map((col) => {
          const items = filtradas.filter((t) => t.estado === col.key);
          const isOver = overCol === col.key;
          const Icon = col.icon;
          return (
            <div
              key={col.key}
              {...columnProps(col.key)}
              className={`flex min-h-[60vh] flex-col rounded-2xl border bg-ink-900/50 transition-colors ${
                isOver ? `border-transparent ring-2 ${col.ring}` : "border-white/5"
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${col.text}`} />
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${col.text}`}
                  >
                    {col.label}
                  </span>
                </div>
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/5 px-1.5 text-xs font-semibold text-zinc-400">
                  {items.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 p-3">
                {hydrated && items.length === 0 && (
                  <p className="py-10 text-center text-xs text-zinc-600">
                    {isOver ? "Suelta aquí" : "Sin tareas"}
                  </p>
                )}
                {items.map((t) => {
                  const done = t.estado === "completada";
                  const dias = diasDesdeHoy(t.fechaLimite);
                  const overdue = !done && dias !== null && dias < 0;
                  return (
                    <article
                      key={t.id}
                      {...cardProps(t.id)}
                      onClick={() => openEdit(t)}
                      className={`group cursor-grab rounded-xl border border-l-2 border-white/5 bg-ink-850 p-4 transition-all hover:border-white/15 active:cursor-grabbing ${
                        PRIORIDAD_BORDER[t.prioridad]
                      } ${dragId === t.id ? "opacity-40" : ""} ${
                        done ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDone(t);
                          }}
                          aria-label="Completar"
                          className="mt-0.5 shrink-0"
                        >
                          {done ? (
                            <CheckCircle2 className="h-[18px] w-[18px] text-emerald-400" />
                          ) : (
                            <Circle className="h-[18px] w-[18px] text-zinc-600 hover:text-zinc-400" />
                          )}
                        </button>
                        <h3
                          className={`flex-1 font-semibold leading-snug ${
                            done
                              ? "text-zinc-500 line-through"
                              : "text-white"
                          }`}
                        >
                          {t.titulo}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            del(t);
                          }}
                          aria-label="Eliminar"
                          className="shrink-0 rounded-md p-1 text-zinc-500 opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {t.descripcion && (
                        <p className="mt-1.5 line-clamp-2 pl-7 text-sm text-zinc-400">
                          {t.descripcion}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2 pl-7">
                        <span className={`chip ${TIPO_CHIP[t.tipo]}`}>
                          {TIPO_LABEL[t.tipo]}
                        </span>
                        <span className="chip bg-white/5 text-zinc-300">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${PRIORIDAD_DOT[t.prioridad]}`}
                          />
                          <span className={PRIORIDAD_TEXT[t.prioridad]}>
                            {PRIORIDAD_LABEL[t.prioridad]}
                          </span>
                        </span>
                      </div>

                      {(t.fechaLimite || t.asignadoA) && (
                        <div className="mt-3 space-y-1 pl-7 text-xs">
                          {t.fechaLimite && (
                            <p
                              className={`flex items-center gap-1.5 ${
                                overdue
                                  ? "font-medium text-accent"
                                  : "text-zinc-500"
                              }`}
                            >
                              <Clock className="h-3.5 w-3.5" />
                              {overdue
                                ? `Vencida ${textoRelativo(dias)}`
                                : `${fechaCorta(t.fechaLimite)}${
                                    t.hora ? ` · ${t.hora}` : ""
                                  }`}
                            </p>
                          )}
                          {t.asignadoA && (
                            <p className="flex items-center gap-1.5 text-zinc-500">
                              <User className="h-3.5 w-3.5" />
                              {t.asignadoA}
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal alta/edición */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Editar tarea" : "Nueva tarea"}
        wide
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Título</label>
            <input
              className="input"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input min-h-[80px] resize-y"
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Estado</label>
              <select
                className="input"
                value={form.estado}
                onChange={(e) =>
                  setForm({ ...form, estado: e.target.value as EstadoTarea })
                }
              >
                {COLUMNAS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Prioridad</label>
              <select
                className="input"
                value={form.prioridad}
                onChange={(e) =>
                  setForm({ ...form, prioridad: e.target.value as Prioridad })
                }
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="label">Tipo</label>
              <select
                className="input"
                value={form.tipo}
                onChange={(e) =>
                  setForm({ ...form, tipo: e.target.value as TipoTarea })
                }
              >
                <option value="demo">Demo</option>
                <option value="reunion">1ª Reunión</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Fecha límite</label>
              <input
                type="date"
                className="input"
                value={form.fechaLimite}
                onChange={(e) =>
                  setForm({ ...form, fechaLimite: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Hora</label>
              <input
                type="time"
                className="input"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Asignada a</label>
              <input
                className="input"
                value={form.asignadoA}
                onChange={(e) =>
                  setForm({ ...form, asignadoA: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-ghost"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-accent">
              {editId ? "Guardar cambios" : "Crear tarea"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function PillGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              value === o.value
                ? "bg-accent text-white"
                : "bg-ink-850 text-zinc-400 hover:bg-ink-800 hover:text-zinc-200"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
