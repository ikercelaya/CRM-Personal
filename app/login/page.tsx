"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo iniciar sesión");
        setLoading(false);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Resplandor de fondo */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <p className="text-sm text-zinc-400">
            Tu plataforma para organizar el día a día.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="card space-y-4 p-6 shadow-2xl shadow-black/40"
        >
          <h1 className="text-lg font-semibold text-white">Inicia sesión</h1>

          <div>
            <label className="label" htmlFor="user">
              Usuario
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="user"
                className="input pl-9"
                placeholder="iker"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="password"
                type="password"
                className="input pl-9"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button type="submit" className="btn-accent w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Acceso privado · {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
