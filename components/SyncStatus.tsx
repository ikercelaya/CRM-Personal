"use client";

import { AlertTriangle } from "lucide-react";
import { useStore } from "@/lib/store";

export function SyncStatus() {
  const { syncError } = useStore();

  if (!syncError) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-medium text-red-200">
      <AlertTriangle className="h-4 w-4 shrink-0 text-accent" />
      {syncError}
    </div>
  );
}
