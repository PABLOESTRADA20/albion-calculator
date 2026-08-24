"use client";

import { useMemo } from "react";
import { familyMeta } from "@/lib/pvp/analytics";
import { usePvpEvents } from "@/lib/pvp/usePvp";
import type { WeaponFamilyKey } from "@/lib/pvp/weapons";
import type { ServerId } from "@/types/albion";

interface BuildPerformanceProps {
  serverId: ServerId;
  weaponFamily: WeaponFamilyKey;
  onOpenBuilds?: (weaponFamily?: string) => void;
}

/**
 * Rendimiento de una familia de arma sobre la muestra global real.
 * Se reutiliza como overlay en la seccion de Builds (no duplica datos).
 */
export function BuildPerformance({ serverId, weaponFamily, onOpenBuilds }: BuildPerformanceProps) {
  const { events, loading, error, refresh } = usePvpEvents(serverId);

  const stat = useMemo(() => familyMeta(events).find((s) => s.family === weaponFamily) ?? null, [events, weaponFamily]);

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
          Rendimiento en vivo · {weaponFamily}
        </p>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded border border-[var(--color-border)] px-2 py-0.5 text-[10px] text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
        >
          Refrescar
        </button>
      </div>

      {loading && <p className="text-sm text-[var(--color-text-dim)]">Cargando muestra…</p>}
      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1.5 text-xs text-red-400">{error}</p>
      )}

      {!loading && !error && !stat && (
        <p className="text-sm text-[var(--color-text-dim)]">
          Data unavailable: sin apariciones de {weaponFamily} en la muestra reciente.
        </p>
      )}

      {!loading && !error && stat && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <PerfCell label="Kills" value={String(stat.kills)} />
          <PerfCell label="Muertes" value={String(stat.deaths)} />
          <PerfCell label="Win rate" value={`${(stat.winRate * 100).toFixed(0)} %`} />
          <PerfCell label="K/D" value={stat.deaths > 0 ? (stat.kills / stat.deaths).toFixed(2) : "—"} />
        </div>
      )}

      {onOpenBuilds && (
        <button
          onClick={() => onOpenBuilds(weaponFamily)}
          className="mt-3 rounded border border-[var(--color-gold)]/40 px-3 py-1 text-xs font-medium text-[var(--color-gold)] transition-colors hover:bg-[var(--color-gold)]/10"
        >
          VIEW BUILDS · {weaponFamily}
        </button>
      )}
    </div>
  );
}

function PerfCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[var(--color-panel)] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">{label}</p>
      <p className="text-lg font-semibold text-[var(--color-text)]">{value}</p>
    </div>
  );
}