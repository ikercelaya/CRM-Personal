"use client";

import { useMemo, useState } from "react";
import {
  Code2,
  FileText,
  Monitor,
  Plus,
  Search,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { EstadoProyecto, Proyecto } from "@/lib/types";
import { useKanban } from "@/lib/useKanban";
import { Modal } from "@/components/Modal";

const COLUMNAS: {
  key: EstadoProyecto;
  label: string;
  text: string;
  dot: string;
  ring: string;
}[] = [
  {
    key: "pendiente",
    label: "Pendiente",
    text: "text-amber-400",
    dot: "bg-amber-400",
    ring: "ring-amber-400/40",
  },
  {
    key: "en_progreso",
    label: "En Progreso",
    text: "text-blue-400",
    dot: "bg-blue-400",
    ring: "ring-blue-400/40",
  },
  {
    key: "pendiente_cliente",
    label: "Pendiente Cliente",
    text: "text-purple-400",
    dot: "bg-purple-400",
    ring: "ring-purple-400/40",
  },
  {
    key: "terminado",
    label: "Terminado",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    ring: "ring-emerald-400/40",
  },
];

const ETIQUETAS_DISPONIBLES = ["Demo", "Propuesta", "Desarrollo", "Urgente"];

function etiquetaStyle(tag: string): { chip: string; Icon: React.ElementType } {
  switch (tag) {
    case "Demo":
      return { chip: "bg-purple-500/15 text-purple-300", Icon: Monitor };
    case "Propuesta":
      return { chip: "bg-blue-500/15 text-blue-300", Icon: FileText };
    case "Desarrollo":
      return { chip: "bg-amber-500/15 text-amber-300", Icon: Code2 };
    default:
      return { chip: "bg-zinc-500/20 text-zinc-300", Icon: Tag };
  }
}

type Form = {
  nombre: string;
  cliente: string;
  descripcion: string;
  estado: EstadoProyecto;
  etiquetas: string[];
};

const EMPTY: Form = {
  nombre: "",
  cliente: "",
  descripcion: "",
  estado: "pendiente",
  etiquetas: [],
};

export default function ProyectosPage() {
  const {
    data,
    hydrated,
    addProyecto,
    updateProyecto,
    removeProyecto,
    moveProyecto,
  } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);

  const { dragId, overCol, cardProps, columnProps } =
    useKanban<EstadoProyecto>(moveProyecto);

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return data.proyectos;
    return data.proyectos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(t) ||
        p.cliente.toLowerCase().includes(t) ||
        p.descripcion.toLowerCase().includes(t),
    );
  }, [data.proyectos, q]);

  function openNew() {
    setForm(EMPTY);
    setEditId(null);
    setOpen(true);
  }
  function openEdit(p: Proyecto) {
    setForm({
      nombre: p.nombre,
      cliente: p.cliente,
      descripcion: p.descripcion,
      estado: p.estado,
      etiquetas: p.etiquetas,
    });
    setEditId(p.id);
    setOpen(true);
  }
  function save(e: React.FormEvent) {
    e.preventDefault();
    if (editId) updateProyecto(editId, form);
    else addProyecto(form);
    setOpen(false);
  }
  function del(p: Proyecto) {
    if (confirm(`¿Eliminar el proyecto "${p.nombre}"?`)) removeProyecto(p.id);
  }
  function toggleTag(tag: string) {
    setForm((f) => ({
      ...f,
      etiquetas: f.etiquetas.includes(tag)
        ? f.etiquetas.filter((t) => t !== tag)
        : [...f.etiquetas, tag],
    }));
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Proyectos
        </h1>
        <button onClick={openNew} className="btn-accent">
          <Plus className="h-4 w-4" /> Nuevo Proyecto
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, cliente..."
          className="input py-3 pl-11"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNAS.map((col) => {
          const items = filtrados.filter((p) => p.estado === col.key);
          const isOver = overCol === col.key;
          return (
            <div
              key={col.key}
              {...columnProps(col.key)}
              className={`flex min-h-[60vh] flex-col rounded-2xl border bg-ink-900/50 transition-colors ${
                isOver
                  ? `border-transparent ring-2 ${col.ring}`
                  : "border-white/5"
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
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
                    {isOver ? "Suelta aquí" : "Sin proyectos"}
                  </p>
                )}
                {items.map((p) => (
                  <article
                    key={p.id}
                    {...cardProps(p.id)}
                    onClick={() => openEdit(p)}
                    className={`group cursor-grab rounded-xl border border-white/5 bg-ink-850 p-4 transition-all hover:border-white/15 active:cursor-grabbing ${
                      dragId === p.id ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-snug text-white">
                        {p.nombre}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          del(p);
                        }}
                        aria-label="Eliminar"
                        className="shrink-0 rounded-md p-1 text-zinc-500 opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {p.cliente && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                        <User className="h-3 w-3" />
                        {p.cliente}
                      </p>
                    )}

                    {p.descripcion && (
                      <p className="mt-2 line-clamp-3 text-sm text-zinc-400">
                        {p.descripcion}
                      </p>
                    )}

                    {p.etiquetas.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.etiquetas.map((tag) => {
                          const { chip, Icon } = etiquetaStyle(tag);
                          return (
                            <span key={tag} className={`chip ${chip}`}>
                              <Icon className="h-3 w-3" />
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Editar proyecto" : "Nuevo proyecto"}
        wide
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Nombre del proyecto</label>
            <input
              className="input"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Cliente</label>
              <input
                className="input"
                list="clientes-list"
                value={form.cliente}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                placeholder="Nombre del cliente"
              />
              <datalist id="clientes-list">
                {data.clientes.map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.empresa}
                  </option>
                ))}
              </datalist>
            </div>
            <div>
              <label className="label">Estado</label>
              <select
                className="input"
                value={form.estado}
                onChange={(e) =>
                  setForm({ ...form, estado: e.target.value as EstadoProyecto })
                }
              >
                {COLUMNAS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input min-h-[90px] resize-y"
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
              placeholder="¿Qué necesita el cliente?"
            />
          </div>

          <div>
            <label className="label">Etiquetas</label>
            <div className="flex flex-wrap gap-2">
              {ETIQUETAS_DISPONIBLES.map((tag) => {
                const active = form.etiquetas.includes(tag);
                const { chip, Icon } = etiquetaStyle(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`chip border transition-colors ${
                      active
                        ? `${chip} border-transparent`
                        : "border-white/10 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {tag}
                  </button>
                );
              })}
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
              {editId ? "Guardar cambios" : "Crear proyecto"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
