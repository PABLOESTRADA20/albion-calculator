"use client";

import { useMemo, useState } from "react";
import { familyMeta } from "@/lib/pvp/analytics";
import { usePvpEvents } from "@/lib/pvp/usePvp";
import type { ServerId } from "@/types/albion";

interface MetaTrackerProps {
  serverId: ServerId;
  onOpenBuilds: (weaponFamily?: string) => void;
}

type SortKey = "usage" | "winRate" | "kd";

export function MetaTracker({ serverId, onOpenBuilds }: MetaTrackerProps) {
  const { events, loading, error, refresh } = usePvpEvents(serverId);
  const [sortBy, setSortBy] = useState<SortKey>("usage");

  const stats = useMemo(() => familyMeta(events), [events]);

  const sorted = useMemo(() => {
    if (sortBy === "winRate") return [...stats].sort((a, b) => b.winRate - a.winRate);
    if (sortBy === "kd")
      return [...stats].sort((a, b) => {
        const kdA = a.deaths > 0 ? a.kills / a.deaths : Infinity;
        const kdB = b.deaths > 0 ? b.kills / b.deaths : Infinity;
        return kdB - kdA;
      });
    return [...stats].sort((a, b) => b.usage - a.usage);
  }, [stats, sortBy]);

  const hasData = !loading && !error && stats.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          {(
            [
              ["usage", "Más usadas"],
              ["winRate", "Win rate"],
              ["kd", "K/D"],
            ] as [SortKey, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSortBy(id)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                sortBy === id
                  ? "bg-[var(--color-gold)] text-black"
                  : "bg-[var(--color-panel-raised)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
        >
          Refrescar
        </button>
      </div>

      {loading && <p className="text-sm text-[var(--color-text-dim)]">Cargando muestras de combates…</p>}
      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      {hasData ? (
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel-raised)] text-left text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Arma</th>
                <th className="px-3 py-2 text-right">Apariciones</th>
                <th className="px-3 py-2 text-right">Uso %</th>
                <th className="px-3 py-2 text-right">WR</th>
                <th className="px-3 py-2 text-right">K/D</th>
                <th className="px-3 py-2 text-right">Kills</th>
                <th className="px-3 py-2 text-right">Muertes</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 15).map((s, i) => (
                <tr key={s.family} className="border-b border-[var(--color-border)]/50 last:border-b-0">
                  <td className="px-3 py-2 text-[var(--color-gold)]">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-[var(--color-text)]">{s.family}</td>
                  <td className="px-3 py-2 text-right text-[var(--color-text-dim)]">{s.kills + s.deaths}</td>
                  <td className="px-3 py-2 text-right text-[var(--color-text-dim)]">
                    {s.usage.toFixed(1)} %
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-emerald-400">
                    {(s.winRate * 100).toFixed(0)} %
                  </td>
                  <td className="px-3 py-2 text-right text-[var(--color-text)]">
                    {s.deaths > 0 ? (s.kills / s.deaths).toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-[var(--color-text-dim)]">{s.kills}</td>
                  <td className="px-3 py-2 text-right text-[var(--color-text-dim)]">{s.deaths}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => onOpenBuilds(s.family)}
                      className="rounded border border-[var(--color-gold)]/40 px-2 py-0.5 text-[10px] font-medium text-[var(--color-gold)] transition-colors hover:bg-[var(--color-gold)]/10"
                    >
                      VIEW BUILDS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="bg-[var(--color-panel-raised)] px-3 py-2 text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
            Muestra: combates recientes globales del servidor ({events.length}). El win rate y K/D son orientativos.
          </p>
        </div>
      ) : (
        !loading &&
        !error && (
          <p className="rounded-md bg-[var(--color-panel-raised)] px-3 py-3 text-sm text-[var(--color-text-dim)]">
            Data unavailable: no hay aún combates cargados en el servidor.
          </p>
        )
      )}
    </div>
  );
}