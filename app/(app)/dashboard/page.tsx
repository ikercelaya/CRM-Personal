"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckSquare,
  FolderKanban,
  Inbox,
  Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { USER_NAME } from "@/lib/config";
import {
  diasDesdeHoy,
  saludoPorHora,
  textoRelativo,
} from "@/lib/format";
import { PRIORIDAD_DOT, TIPO_CHIP, TIPO_LABEL } from "@/lib/labels";

const COLORWAYS = {
  emerald: {
    grad: "from-emerald-500/15",
    icon: "bg-emerald-500/15 text-emerald-400",
  },
  blue: { grad: "from-blue-500/15", icon: "bg-blue-500/15 text-blue-400" },
  amber: { grad: "from-amber-500/15", icon: "bg-amber-500/15 text-amber-400" },
  red: { grad: "from-accent/20", icon: "bg-accent/15 text-accent" },
} as const;

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: keyof typeof COLORWAYS;
  loading: boolean;
}) {
  const c = COLORWAYS[color];
  return (
    <div
      className={`card relative overflow-hidden bg-gradient-to-br ${c.grad} to-transparent p-5`}
    >
      <span
        className={`mb-8 inline-flex h-9 w-9 items-center justify-center rounded-lg ${c.icon}`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      {loading ? (
        <div className="h-9 w-12 animate-pulse rounded bg-white/10" />
      ) : (
        <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
      )}
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
        {label}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { data, hydrated } = useStore();
  const [saludo] = useState(() => saludoPorHora());

  const clientesActivos = data.clientes.length;
  const proyectosActivos = data.proyectos.filter(
    (p) => p.estado !== "terminado",
  ).length;
  const tareasPendientes = data.tareas.filter(
    (t) => t.estado !== "completada",
  ).length;
  const vencidas = data.tareas.filter((t) => {
    if (t.estado === "completada" || !t.fechaLimite) return false;
    const d = diasDesdeHoy(t.fechaLimite);
    return d !== null && d < 0;
  }).length;

  const proximas = data.tareas
    .filter((t) => t.estado !== "completada" && t.fechaLimite)
    .map((t) => ({ tarea: t, dias: diasDesdeHoy(t.fechaLimite) }))
    .filter((x) => x.dias !== null && x.dias <= 7)
    .sort((a, b) => (a.dias as number) - (b.dias as number))
    .slice(0, 6);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Cabecera de bienvenida */}
      <div className="card relative overflow-hidden bg-gradient-to-r from-accent/10 via-transparent to-transparent p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Dashboard
        </p>
        <h1
          suppressHydrationWarning
          className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
        >
          {saludo}, {USER_NAME}
          <span className="text-accent">.</span>
        </h1>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Clientes"
          value={clientesActivos}
          icon={Users}
          color="emerald"
          loading={!hydrated}
        />
        <StatCard
          label="Proyectos activos"
          value={proyectosActivos}
          icon={FolderKanban}
          color="blue"
          loading={!hydrated}
        />
        <StatCard
          label="Tareas pendientes"
          value={tareasPendientes}
          icon={CheckSquare}
          color="amber"
          loading={!hydrated}
        />
        <StatCard
          label="Vencidas"
          value={vencidas}
          icon={AlertTriangle}
          color="red"
          loading={!hydrated}
        />
      </div>

      {/* Próximas tareas */}
      <div className="card p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Próximas tareas</h2>
            <p className="text-sm text-zinc-500">Próximos 7 días</p>
          </div>
          <Link
            href="/tareas"
            className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Ver todas <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {!hydrated ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-white/[0.03]"
              />
            ))}
          </div>
        ) : proximas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Inbox className="h-10 w-10 text-zinc-700" />
            <p className="text-sm text-zinc-500">Nada urgente esta semana.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {proximas.map(({ tarea, dias }) => {
              const overdue = (dias as number) < 0;
              return (
                <li key={tarea.id}>
                  <Link
                    href="/tareas"
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-850/60 px-4 py-3 transition-colors hover:border-white/10 hover:bg-ink-800"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${PRIORIDAD_DOT[tarea.prioridad]}`}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-100">
                      {tarea.titulo}
                    </span>
                    <span
                      className={`chip hidden sm:inline-flex ${TIPO_CHIP[tarea.tipo]}`}
                    >
                      {TIPO_LABEL[tarea.tipo]}
                    </span>
                    <span
                      className={`shrink-0 text-xs font-medium ${
                        overdue ? "text-accent" : "text-zinc-400"
                      }`}
                    >
                      {overdue ? "Vencida " : ""}
                      {textoRelativo(dias)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
