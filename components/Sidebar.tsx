"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Users,
} from "lucide-react";
import { Logo } from "./Logo";
import { USER_INITIALS, USER_NAME, USER_ROLE } from "@/lib/config";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/tareas", label: "Tareas", icon: ListChecks },
  { href: "/calendario", label: "Calendario", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/5 bg-ink-950">
      <div className="px-6 py-6">
        <Logo size="sm" />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent" />
              )}
              <Icon
                className={`h-[18px] w-[18px] ${
                  active ? "text-accent" : "text-zinc-500 group-hover:text-zinc-300"
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
            {USER_INITIALS}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{USER_NAME}</p>
            <p className="truncate text-[11px] uppercase tracking-wider text-zinc-500">
              {USER_ROLE}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px] text-zinc-500" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
