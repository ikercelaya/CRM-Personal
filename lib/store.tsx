"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Cliente,
  CrmData,
  EstadoProyecto,
  EstadoTarea,
  EventoCalendario,
  Proyecto,
  Tarea,
} from "./types";
import { SEED } from "./seed";
import { genId } from "./format";

const STORAGE_KEY = "crm_personal_data_v1";

const EMPTY: CrmData = { clientes: [], proyectos: [], tareas: [], eventos: [] };

interface StoreCtx {
  hydrated: boolean;
  data: CrmData;
  // Clientes
  addCliente: (c: Omit<Cliente, "id">) => void;
  updateCliente: (id: string, c: Partial<Cliente>) => void;
  removeCliente: (id: string) => void;
  // Proyectos
  addProyecto: (p: Omit<Proyecto, "id" | "createdAt">) => void;
  updateProyecto: (id: string, p: Partial<Proyecto>) => void;
  removeProyecto: (id: string) => void;
  moveProyecto: (id: string, estado: EstadoProyecto) => void;
  // Tareas
  addTarea: (t: Omit<Tarea, "id" | "createdAt">) => void;
  updateTarea: (id: string, t: Partial<Tarea>) => void;
  removeTarea: (id: string) => void;
  moveTarea: (id: string, estado: EstadoTarea) => void;
  // Eventos
  addEvento: (e: Omit<EventoCalendario, "id">) => void;
  updateEvento: (id: string, e: Partial<EventoCalendario>) => void;
  removeEvento: (id: string) => void;
  // Utilidad
  resetDemo: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CrmData>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  // Carga inicial desde localStorage (solo en cliente).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CrmData;
        setData({
          clientes: parsed.clientes ?? [],
          proyectos: parsed.proyectos ?? [],
          tareas: parsed.tareas ?? [],
          eventos: parsed.eventos ?? [],
        });
      } else {
        setData(SEED);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      }
    } catch {
      setData(SEED);
    }
    setHydrated(true);
  }, []);

  // Persiste en cada cambio (una vez hidratado).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* almacenamiento lleno o no disponible */
    }
  }, [data, hydrated]);

  // ── Clientes ──────────────────────────────────────────────
  const addCliente = useCallback((c: Omit<Cliente, "id">) => {
    setData((d) => ({ ...d, clientes: [{ ...c, id: genId() }, ...d.clientes] }));
  }, []);
  const updateCliente = useCallback((id: string, c: Partial<Cliente>) => {
    setData((d) => ({
      ...d,
      clientes: d.clientes.map((x) => (x.id === id ? { ...x, ...c } : x)),
    }));
  }, []);
  const removeCliente = useCallback((id: string) => {
    setData((d) => ({ ...d, clientes: d.clientes.filter((x) => x.id !== id) }));
  }, []);

  // ── Proyectos ─────────────────────────────────────────────
  const addProyecto = useCallback((p: Omit<Proyecto, "id" | "createdAt">) => {
    setData((d) => ({
      ...d,
      proyectos: [
        { ...p, id: genId(), createdAt: new Date().toISOString().slice(0, 10) },
        ...d.proyectos,
      ],
    }));
  }, []);
  const updateProyecto = useCallback((id: string, p: Partial<Proyecto>) => {
    setData((d) => ({
      ...d,
      proyectos: d.proyectos.map((x) => (x.id === id ? { ...x, ...p } : x)),
    }));
  }, []);
  const removeProyecto = useCallback((id: string) => {
    setData((d) => ({ ...d, proyectos: d.proyectos.filter((x) => x.id !== id) }));
  }, []);
  const moveProyecto = useCallback((id: string, estado: EstadoProyecto) => {
    setData((d) => ({
      ...d,
      proyectos: d.proyectos.map((x) => (x.id === id ? { ...x, estado } : x)),
    }));
  }, []);

  // ── Tareas ────────────────────────────────────────────────
  const addTarea = useCallback((t: Omit<Tarea, "id" | "createdAt">) => {
    setData((d) => ({
      ...d,
      tareas: [
        { ...t, id: genId(), createdAt: new Date().toISOString().slice(0, 10) },
        ...d.tareas,
      ],
    }));
  }, []);
  const updateTarea = useCallback((id: string, t: Partial<Tarea>) => {
    setData((d) => ({
      ...d,
      tareas: d.tareas.map((x) => (x.id === id ? { ...x, ...t } : x)),
    }));
  }, []);
  const removeTarea = useCallback((id: string) => {
    setData((d) => ({ ...d, tareas: d.tareas.filter((x) => x.id !== id) }));
  }, []);
  const moveTarea = useCallback((id: string, estado: EstadoTarea) => {
    setData((d) => ({
      ...d,
      tareas: d.tareas.map((x) => (x.id === id ? { ...x, estado } : x)),
    }));
  }, []);

  // ── Eventos ───────────────────────────────────────────────
  const addEvento = useCallback((e: Omit<EventoCalendario, "id">) => {
    setData((d) => ({ ...d, eventos: [{ ...e, id: genId() }, ...d.eventos] }));
  }, []);
  const updateEvento = useCallback((id: string, e: Partial<EventoCalendario>) => {
    setData((d) => ({
      ...d,
      eventos: d.eventos.map((x) => (x.id === id ? { ...x, ...e } : x)),
    }));
  }, []);
  const removeEvento = useCallback((id: string) => {
    setData((d) => ({ ...d, eventos: d.eventos.filter((x) => x.id !== id) }));
  }, []);

  const resetDemo = useCallback(() => {
    setData(SEED);
  }, []);

  const value: StoreCtx = {
    hydrated,
    data,
    addCliente,
    updateCliente,
    removeCliente,
    addProyecto,
    updateProyecto,
    removeProyecto,
    moveProyecto,
    addTarea,
    updateTarea,
    removeTarea,
    moveTarea,
    addEvento,
    updateEvento,
    removeEvento,
    resetDemo,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return ctx;
}
