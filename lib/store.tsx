"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CrmAction } from "./crm-actions";
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

const EMPTY: CrmData = { clientes: [], proyectos: [], tareas: [], eventos: [] };

interface StoreCtx {
  hydrated: boolean;
  syncError: string | null;
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

function normalizeData(data: CrmData): CrmData {
  return {
    clientes: data.clientes ?? [],
    proyectos: data.proyectos ?? [],
    tareas: data.tareas ?? [],
    eventos: data.eventos ?? [],
  };
}

async function fetchCrmData(): Promise<CrmData> {
  const res = await fetch("/api/crm", { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "No se pudieron cargar los datos");
  }
  return normalizeData((await res.json()) as CrmData);
}

async function sendAction(action: CrmAction): Promise<void> {
  const res = await fetch("/api/crm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo guardar el cambio");
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CrmData>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const refreshFromServer = useCallback(async () => {
    const remoteData = await fetchCrmData();
    setData(remoteData);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const remoteData = await fetchCrmData();
        if (!cancelled) {
          setData(remoteData);
          setSyncError(null);
        }
      } catch (error) {
        console.error("[store] load", error);
        if (!cancelled) {
          setData(EMPTY);
          setSyncError("No se pudieron cargar los datos de Supabase.");
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const queueAction = useCallback(
    (action: CrmAction) => {
      setSyncError(null);
      void sendAction(action).catch(async (error) => {
        console.error("[store] sync", error);
        setSyncError("No se pudo sincronizar el ultimo cambio.");
        try {
          await refreshFromServer();
        } catch (refreshError) {
          console.error("[store] refresh", refreshError);
        }
      });
    },
    [refreshFromServer],
  );

  // Clientes
  const addCliente = useCallback(
    (c: Omit<Cliente, "id">) => {
      const cliente = { ...c, id: genId() };
      setData((d) => ({ ...d, clientes: [cliente, ...d.clientes] }));
      queueAction({ type: "addCliente", cliente });
    },
    [queueAction],
  );
  const updateCliente = useCallback(
    (id: string, c: Partial<Cliente>) => {
      setData((d) => ({
        ...d,
        clientes: d.clientes.map((x) => (x.id === id ? { ...x, ...c } : x)),
      }));
      queueAction({ type: "updateCliente", id, cliente: c });
    },
    [queueAction],
  );
  const removeCliente = useCallback(
    (id: string) => {
      setData((d) => ({
        ...d,
        clientes: d.clientes.filter((x) => x.id !== id),
      }));
      queueAction({ type: "removeCliente", id });
    },
    [queueAction],
  );

  // Proyectos
  const addProyecto = useCallback(
    (p: Omit<Proyecto, "id" | "createdAt">) => {
      const proyecto = {
        ...p,
        id: genId(),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setData((d) => ({ ...d, proyectos: [proyecto, ...d.proyectos] }));
      queueAction({ type: "addProyecto", proyecto });
    },
    [queueAction],
  );
  const updateProyecto = useCallback(
    (id: string, p: Partial<Proyecto>) => {
      setData((d) => ({
        ...d,
        proyectos: d.proyectos.map((x) => (x.id === id ? { ...x, ...p } : x)),
      }));
      queueAction({ type: "updateProyecto", id, proyecto: p });
    },
    [queueAction],
  );
  const removeProyecto = useCallback(
    (id: string) => {
      setData((d) => ({
        ...d,
        proyectos: d.proyectos.filter((x) => x.id !== id),
      }));
      queueAction({ type: "removeProyecto", id });
    },
    [queueAction],
  );
  const moveProyecto = useCallback(
    (id: string, estado: EstadoProyecto) => {
      setData((d) => ({
        ...d,
        proyectos: d.proyectos.map((x) => (x.id === id ? { ...x, estado } : x)),
      }));
      queueAction({ type: "moveProyecto", id, estado });
    },
    [queueAction],
  );

  // Tareas
  const addTarea = useCallback(
    (t: Omit<Tarea, "id" | "createdAt">) => {
      const tarea = {
        ...t,
        id: genId(),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setData((d) => ({ ...d, tareas: [tarea, ...d.tareas] }));
      queueAction({ type: "addTarea", tarea });
    },
    [queueAction],
  );
  const updateTarea = useCallback(
    (id: string, t: Partial<Tarea>) => {
      setData((d) => ({
        ...d,
        tareas: d.tareas.map((x) => (x.id === id ? { ...x, ...t } : x)),
      }));
      queueAction({ type: "updateTarea", id, tarea: t });
    },
    [queueAction],
  );
  const removeTarea = useCallback(
    (id: string) => {
      setData((d) => ({ ...d, tareas: d.tareas.filter((x) => x.id !== id) }));
      queueAction({ type: "removeTarea", id });
    },
    [queueAction],
  );
  const moveTarea = useCallback(
    (id: string, estado: EstadoTarea) => {
      setData((d) => ({
        ...d,
        tareas: d.tareas.map((x) => (x.id === id ? { ...x, estado } : x)),
      }));
      queueAction({ type: "moveTarea", id, estado });
    },
    [queueAction],
  );

  // Eventos
  const addEvento = useCallback(
    (e: Omit<EventoCalendario, "id">) => {
      const evento = { ...e, id: genId() };
      setData((d) => ({ ...d, eventos: [evento, ...d.eventos] }));
      queueAction({ type: "addEvento", evento });
    },
    [queueAction],
  );
  const updateEvento = useCallback(
    (id: string, e: Partial<EventoCalendario>) => {
      setData((d) => ({
        ...d,
        eventos: d.eventos.map((x) => (x.id === id ? { ...x, ...e } : x)),
      }));
      queueAction({ type: "updateEvento", id, evento: e });
    },
    [queueAction],
  );
  const removeEvento = useCallback(
    (id: string) => {
      setData((d) => ({
        ...d,
        eventos: d.eventos.filter((x) => x.id !== id),
      }));
      queueAction({ type: "removeEvento", id });
    },
    [queueAction],
  );

  const resetDemo = useCallback(() => {
    setData(SEED);
    queueAction({ type: "resetDemo" });
  }, [queueAction]);

  const value: StoreCtx = {
    hydrated,
    syncError,
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
