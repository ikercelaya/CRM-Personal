"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, addWeeks, format, isSameDay, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { EstadoEvento, EventoCalendario, TipoTarea } from "@/lib/types";
import { Modal } from "@/components/Modal";

const START_HOUR = 7;
const END_HOUR = 22;
const HOUR_PX = 56;
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i,
);
const TOTAL_PX = HOURS.length * HOUR_PX;
const WEEKDAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

const CAL_TIPO: Record<TipoTarea, { bg: string; bar: string; text: string }> = {
  demo: {
    bg: "bg-purple-500/20 hover:bg-purple-500/30",
    bar: "bg-purple-400",
    text: "text-purple-100",
  },
  reunion: {
    bg: "bg-blue-500/20 hover:bg-blue-500/30",
    bar: "bg-blue-400",
    text: "text-blue-100",
  },
  otro: {
    bg: "bg-zinc-500/25 hover:bg-zinc-500/35",
    bar: "bg-zinc-400",
    text: "text-zinc-100",
  },
};

const TIPO_OPCIONES: { value: TipoTarea; label: string; dot: string }[] = [
  { value: "demo", label: "Demo", dot: "bg-purple-400" },
  { value: "reunion", label: "1ª Reunión", dot: "bg-blue-400" },
  { value: "otro", label: "Otro", dot: "bg-zinc-400" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const minToHHMM = (m: number) =>
  `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;

function rangoSemana(start: Date): string {
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${format(start, "d")} – ${format(end, "d 'de' LLLL yyyy", { locale: es })}`;
  }
  return `${format(start, "d 'de' LLL", { locale: es })} – ${format(end, "d 'de' LLL yyyy", { locale: es })}`;
}

type Form = {
  titulo: string;
  descripcion: string;
  tipo: TipoTarea;
  estado: EstadoEvento;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  asignadoA: string;
};

function emptyForm(fecha: string, horaInicio = "09:00", horaFin = "10:00"): Form {
  return {
    titulo: "",
    descripcion: "",
    tipo: "reunion",
    estado: "pendiente",
    fecha,
    horaInicio,
    horaFin,
    asignadoA: "Iker",
  };
}

// Reparte en "carriles" los eventos que se solapan dentro de un mismo día.
function layoutDia(evs: EventoCalendario[]) {
  const sorted = [...evs].sort(
    (a, b) => toMin(a.horaInicio) - toMin(b.horaInicio),
  );
  type P = {
    ev: EventoCalendario;
    lane: number;
    start: number;
    end: number;
    lanes: number;
  };
  const placed: P[] = [];
  let cluster: P[] = [];
  let lanesEnd: number[] = [];
  let clusterEnd = -1;

  const close = () => {
    const n = lanesEnd.length || 1;
    cluster.forEach((p) => (p.lanes = n));
    cluster = [];
    lanesEnd = [];
  };

  for (const ev of sorted) {
    const start = toMin(ev.horaInicio);
    const end = Math.max(toMin(ev.horaFin), start + 30);
    if (cluster.length && start >= clusterEnd) {
      close();
      clusterEnd = -1;
    }
    let lane = lanesEnd.findIndex((e) => e <= start);
    if (lane === -1) {
      lane = lanesEnd.length;
      lanesEnd.push(end);
    } else {
      lanesEnd[lane] = end;
    }
    const p: P = { ev, lane, start, end, lanes: 1 };
    cluster.push(p);
    placed.push(p);
    clusterEnd = Math.max(clusterEnd, end);
  }
  close();
  return placed;
}

export default function CalendarioPage() {
  const { data, hydrated, addEvento, updateEvento, removeEvento } = useStore();
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm(""));

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setWeekStart(startOfWeek(now, { weekStartsOn: 1 }));
  }, []);

  const dias = useMemo(() => {
    if (!weekStart) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      return { date: d, iso: format(d, "yyyy-MM-dd") };
    });
  }, [weekStart]);

  function openNew() {
    const iso = dias[0]?.iso ?? format(new Date(), "yyyy-MM-dd");
    setForm(emptyForm(iso));
    setEditId(null);
    setOpen(true);
  }
  function openCell(iso: string, hour: number) {
    setForm(emptyForm(iso, `${pad(hour)}:00`, `${pad(hour + 1)}:00`));
    setEditId(null);
    setOpen(true);
  }
  function openEvent(ev: EventoCalendario) {
    setForm({
      titulo: ev.titulo,
      descripcion: ev.descripcion,
      tipo: ev.tipo,
      estado: ev.estado,
      fecha: ev.fecha,
      horaInicio: ev.horaInicio,
      horaFin: ev.horaFin,
      asignadoA: ev.asignadoA,
    });
    setEditId(ev.id);
    setOpen(true);
  }
  function save(e: React.FormEvent) {
    e.preventDefault();
    let { horaInicio, horaFin } = form;
    if (toMin(horaFin) <= toMin(horaInicio)) {
      horaFin = minToHHMM(toMin(horaInicio) + 60);
    }
    const payload = { ...form, horaInicio, horaFin };
    if (editId) updateEvento(editId, payload);
    else addEvento(payload);
    setOpen(false);
  }
  function del() {
    if (editId && confirm("¿Eliminar este evento?")) {
      removeEvento(editId);
      setOpen(false);
    }
  }

  function onDropEvent(e: React.DragEvent, iso: string, hour: number) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    setDragId(null);
    if (!id) return;
    const ev = data.eventos.find((x) => x.id === id);
    if (!ev) return;
    const dur = Math.max(30, toMin(ev.horaFin) - toMin(ev.horaInicio));
    const startMin = hour * 60;
    updateEvento(id, {
      fecha: iso,
      horaInicio: minToHHMM(startMin),
      horaFin: minToHHMM(startMin + dur),
    });
  }

  const loading = !hydrated || !weekStart;

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Calendario
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              weekStart &&
              setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
            }
            className="btn-ghost px-3 py-2"
          >
            Hoy
          </button>
          <button
            onClick={() => weekStart && setWeekStart(addWeeks(weekStart, -1))}
            aria-label="Semana anterior"
            className="btn-ghost px-2.5 py-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => weekStart && setWeekStart(addWeeks(weekStart, 1))}
            aria-label="Semana siguiente"
            className="btn-ghost px-2.5 py-2"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="ml-1 min-w-[12rem] text-right text-sm font-medium capitalize text-zinc-300">
            {weekStart ? rangoSemana(weekStart) : "—"}
          </span>
          <button onClick={openNew} className="btn-accent ml-2">
            <Plus className="h-4 w-4" /> Nuevo Evento
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400">
        {TIPO_OPCIONES.map((t) => (
          <span key={t.value} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${t.dot}`} />
            {t.label}
          </span>
        ))}
        <span className="mx-1 h-3 w-px bg-white/10" />
        <span className="text-zinc-500">Estado:</span>
        <span className="text-zinc-400">Pendiente</span>
        <span className="rounded px-1.5 ring-1 ring-inset ring-white/30 text-zinc-300">
          En progreso
        </span>
        <span className="text-zinc-500 line-through">Completada</span>
      </div>

      {/* Cuadrícula semanal */}
      <div className="card overflow-auto">
        {loading ? (
          <div className="h-[520px] animate-pulse bg-white/[0.02]" />
        ) : (
          <div
            className="grid min-w-[900px]"
            style={{ gridTemplateColumns: `56px repeat(7, minmax(0, 1fr))` }}
          >
            {/* Cabecera (sticky) */}
            <div className="sticky top-0 z-20 border-b border-white/5 bg-ink-900" />
            {dias.map((d, i) => {
              const esHoy = today ? isSameDay(d.date, today) : false;
              return (
                <div
                  key={d.iso}
                  className={`sticky top-0 z-20 border-b border-l border-white/5 bg-ink-900 px-2 py-3 text-center ${
                    esHoy ? "bg-accent/5" : ""
                  }`}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    {WEEKDAYS[i]}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      esHoy ? "text-accent" : "text-zinc-200"
                    }`}
                  >
                    {d.date.getDate()}
                  </p>
                </div>
              );
            })}

            {/* Eje horario */}
            <div className="relative" style={{ height: TOTAL_PX }}>
              {HOURS.map((h, i) => (
                <div
                  key={h}
                  className="absolute right-2 -translate-y-1/2 text-[11px] tabular-nums text-zinc-600"
                  style={{ top: i * HOUR_PX }}
                >
                  {pad(h)}:00
                </div>
              ))}
            </div>

            {/* Columnas de días */}
            {dias.map((d) => {
              const esHoy = today ? isSameDay(d.date, today) : false;
              const eventosDia = data.eventos.filter((e) => e.fecha === d.iso);
              const placed = layoutDia(eventosDia);
              return (
                <div
                  key={d.iso}
                  className={`relative border-l border-white/5 ${
                    esHoy ? "bg-accent/[0.03]" : ""
                  }`}
                  style={{ height: TOTAL_PX }}
                >
                  {/* Celdas por hora (clic = crear, soltar = mover) */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      onClick={() => openCell(d.iso, h)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => onDropEvent(e, d.iso, h)}
                      className="cursor-pointer border-t border-white/5 transition-colors hover:bg-white/[0.03]"
                      style={{ height: HOUR_PX }}
                    />
                  ))}

                  {/* Eventos */}
                  {placed.map(({ ev, lane, start, end, lanes }) => {
                    const top = ((start - START_HOUR * 60) / 60) * HOUR_PX;
                    const height = Math.max(
                      ((end - start) / 60) * HOUR_PX - 2,
                      22,
                    );
                    const colors = CAL_TIPO[ev.tipo];
                    const done = ev.estado === "completada";
                    const enProgreso = ev.estado === "en_progreso";
                    return (
                      <button
                        key={ev.id}
                        draggable
                        onClick={(e) => {
                          e.stopPropagation();
                          openEvent(ev);
                        }}
                        onDragStart={(e) => {
                          setDragId(ev.id);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", ev.id);
                        }}
                        onDragEnd={() => setDragId(null)}
                        className={`absolute overflow-hidden rounded-md border-l-2 px-2 py-1 text-left transition-colors ${colors.bg} ${colors.text} ${
                          done ? "opacity-50" : ""
                        } ${enProgreso ? "ring-1 ring-inset ring-white/30" : ""} ${
                          dragId === ev.id ? "opacity-40" : ""
                        }`}
                        style={{
                          top,
                          height,
                          left: `calc(${(lane * 100) / lanes}% + 2px)`,
                          width: `calc(${100 / lanes}% - 4px)`,
                          borderLeftColor: "currentColor",
                          pointerEvents: dragId ? "none" : "auto",
                        }}
                      >
                        <span
                          className={`block truncate text-[11px] font-semibold ${
                            done ? "line-through" : ""
                          }`}
                        >
                          {ev.titulo}
                        </span>
                        <span className="block truncate text-[10px] opacity-75">
                          {ev.horaInicio}–{ev.horaFin}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal alta/edición de evento */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Editar evento" : "Nuevo evento"}
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
              className="input min-h-[70px] resize-y"
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Tipo</label>
              <select
                className="input"
                value={form.tipo}
                onChange={(e) =>
                  setForm({ ...form, tipo: e.target.value as TipoTarea })
                }
              >
                {TIPO_OPCIONES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Estado</label>
              <select
                className="input"
                value={form.estado}
                onChange={(e) =>
                  setForm({ ...form, estado: e.target.value as EstadoEvento })
                }
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En progreso</option>
                <option value="completada">Completada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Fecha</label>
              <input
                type="date"
                className="input"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Inicio</label>
              <input
                type="time"
                className="input"
                value={form.horaInicio}
                onChange={(e) =>
                  setForm({ ...form, horaInicio: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label">Fin</label>
              <input
                type="time"
                className="input"
                value={form.horaFin}
                onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {editId ? (
              <button
                type="button"
                onClick={del}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
              >
                <Trash2 className="h-4 w-4" /> Eliminar
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-accent">
                {editId ? "Guardar" : "Crear evento"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
