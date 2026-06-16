"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { Cliente } from "@/lib/types";
import { euros, fechaCorta, totalAnual } from "@/lib/format";
import { Modal } from "@/components/Modal";

type Form = Omit<Cliente, "id">;

const EMPTY: Form = {
  nombre: "",
  empresa: "",
  tipoNegocio: "",
  inicio: new Date().toISOString().slice(0, 10),
  implementacion: 0,
  mantenimientoMes: 0,
};

export default function ClientesPage() {
  const { data, hydrated, addCliente, updateCliente, removeCliente } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return data.clientes;
    return data.clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(t) ||
        c.empresa.toLowerCase().includes(t),
    );
  }, [data.clientes, q]);

  function openNew() {
    setForm({ ...EMPTY, inicio: new Date().toISOString().slice(0, 10) });
    setEditId(null);
    setOpen(true);
  }

  function openEdit(c: Cliente) {
    setForm({
      nombre: c.nombre,
      empresa: c.empresa,
      tipoNegocio: c.tipoNegocio,
      inicio: c.inicio,
      implementacion: c.implementacion,
      mantenimientoMes: c.mantenimientoMes,
    });
    setEditId(c.id);
    setOpen(true);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (editId) updateCliente(editId, form);
    else addCliente(form);
    setOpen(false);
  }

  function del(c: Cliente) {
    if (confirm(`¿Eliminar el cliente "${c.nombre}"?`)) removeCliente(c.id);
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">Clientes</h1>
        <button onClick={openNew} className="btn-accent">
          <Plus className="h-4 w-4" /> Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o empresa..."
          className="input py-3 pl-11"
        />
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="px-5 py-3.5 font-medium">Nombre</th>
                <th className="px-5 py-3.5 font-medium">Empresa</th>
                <th className="px-5 py-3.5 font-medium">Tipo de negocio</th>
                <th className="px-5 py-3.5 font-medium">Inicio</th>
                <th className="px-5 py-3.5 text-right font-medium">Implement.</th>
                <th className="px-5 py-3.5 text-right font-medium">Mant./mes</th>
                <th className="px-5 py-3.5 text-right font-medium">Total anual</th>
                <th className="px-5 py-3.5 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!hydrated ? (
                [0, 1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={8} className="px-5 py-4">
                      <div className="h-5 animate-pulse rounded bg-white/[0.04]" />
                    </td>
                  </tr>
                ))
              ) : lista.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                      <Users className="h-10 w-10 text-zinc-700" />
                      <p className="text-sm text-zinc-500">
                        {q
                          ? "Ningún cliente coincide con la búsqueda."
                          : "Todavía no tienes clientes. Crea el primero."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                lista.map((c) => (
                  <tr
                    key={c.id}
                    className="group border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4 font-semibold text-white">
                      {c.nombre}
                    </td>
                    <td className="px-5 py-4 text-zinc-300">{c.empresa}</td>
                    <td className="px-5 py-4 text-zinc-400">{c.tipoNegocio}</td>
                    <td className="px-5 py-4 text-zinc-400">
                      {fechaCorta(c.inicio)}
                    </td>
                    <td className="px-5 py-4 text-right text-zinc-300">
                      {euros(c.implementacion)}
                    </td>
                    <td className="px-5 py-4 text-right text-zinc-300">
                      {euros(c.mantenimientoMes)}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-white">
                      {euros(totalAnual(c))}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => openEdit(c)}
                          aria-label="Editar"
                          className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => del(c)}
                          aria-label="Eliminar"
                          className="rounded-lg p-2 text-zinc-400 hover:bg-accent/10 hover:text-accent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal alta/edición */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Editar cliente" : "Nuevo cliente"}
        wide
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nombre</label>
              <input
                className="input"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Empresa</label>
              <input
                className="input"
                value={form.empresa}
                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Tipo de negocio</label>
              <input
                className="input"
                value={form.tipoNegocio}
                onChange={(e) =>
                  setForm({ ...form, tipoNegocio: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Fecha de inicio</label>
              <input
                type="date"
                className="input"
                value={form.inicio}
                onChange={(e) => setForm({ ...form, inicio: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Implementación (€)</label>
              <input
                type="number"
                min={0}
                className="input"
                value={form.implementacion}
                onChange={(e) =>
                  setForm({ ...form, implementacion: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="label">Mantenimiento / mes (€)</label>
              <input
                type="number"
                min={0}
                className="input"
                value={form.mantenimientoMes}
                onChange={(e) =>
                  setForm({ ...form, mantenimientoMes: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-ink-850/60 px-4 py-3">
            <span className="text-sm text-zinc-400">Total anual estimado</span>
            <span className="text-lg font-bold text-white">
              {euros(totalAnual(form))}
            </span>
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
              {editId ? "Guardar cambios" : "Crear cliente"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
