"use client";

import { useMemo, useState } from "react";
import { familyMeta } from "@/lib/pvp/analytics";
import { usePvpEvents } from "@/lib/pvp/usePvp";
import type { ServerId } from "@/types/albion";

interface MetaEvolutionProps {
  serverId: ServerId;
  onOpenBuilds: (weaponFamily?: string) => void;
}

/**
 * Evolucion del meta sobre la muestra real disponible.
 * Solo se ofrece un rango (24H/7D/30D/90D) si la muestra lo cubre;
 * si no, se muestra la tendencia de la muestra completa (mitad previa vs actual).
 */
export function MetaEvolution({ serverId, onOpenBuilds }: MetaEvolutionProps) {
  const { events, loading, error, refresh } = usePvpEvents(serverId);

  const ranges = useMemo(() => {
    const windowLabels = [
      { key: "24h", hours: 24 },
      { key: "7d", hours: 24 * 7 },
      { key: "30d", hours: 24 * 30 },
      { key: "90d", hours: 24 * 90 },
    ] as const;
    const ts = events.map((e) => new Date(e.timestamp).getTime()).filter((t) => !Number.isNaN(t));
    if (ts.length === 0) return null;
    const spanMs = Math.max(...ts) - Math.min(...ts);
    const covered = windowLabels.filter((w) => spanMs >= w.hours * 3600 * 1000);
    return covered.length > 0 ? covered : null;
  }, [events]);

  const [range, setRange] = useState<"24h" | "7d" | "30d" | "90d" | "full">("24h");

  const computed = useMemo(() => {
    const ts = events.map((e) => new Date(e.timestamp).getTime());
    const now = Math.max(...ts.filter((t) => !Number.isNaN(t)));
    let windowStart: number;
    if (range === "full") {
      const min = Math.min(...ts.filter((t) => !Number.isNaN(t)));
      const half = (now - min) / 2;
      windowStart = now - half;
    } else {
      const hours = { "24h": 24, "7d": 168, "30d": 720, "90d": 2160 }[range];
      windowStart = now - hours * 3600 * 1000;
    }
    const cut = Math.max(0, (now - windowStart) / 2);
    const prevCut = now - cut;
    const prev = events.filter((e) => {
      const t = new Date(e.timestamp).getTime();
      return !Number.isNaN(t) && t >= windowStart && t < prevCut;
    });
    const cur = events.filter((e) => {
      const t = new Date(e.timestamp).getTime();
      return !Number.isNaN(t) && t >= prevCut && t <= now;
    });
    return { prev: familyMeta(prev), cur: familyMeta(cur) };
  }, [events, range]);

  const deltas = useMemo(() => {
    const byFamily = new Map<string, { prevUsage: number; curUsage: number; curWinRate: number }>();
    for (const s of computed.prev) {
      byFamily.set(s.family, { prevUsage: s.usage, curUsage: 0, curWinRate: 0 });
    }
    for (const s of computed.cur) {
      const existing = byFamily.get(s.family) ?? { prevUsage: 0, curUsage: 0, curWinRate: 0 };
      byFamily.set(s.family, { ...existing, curUsage: s.usage, curWinRate: s.winRate });
    }
    const rows: { family: string; delta: number; pct: number; curUsage: number; curWinRate: number }[] = [];
    for (const [family, v] of byFamily) {
      if (v.prevUsage <= 0 && v.curUsage <= 0) continue;
      const total = v.prevUsage + v.curUsage;
      const prevRate = v.prevUsage / total;
      const curRate = v.curUsage / total;
      const pct = prevRate > 0 ? (curRate - prevRate) / prevRate : curRate > 0 ? 1 : 0;
      rows.push({
        family,
        delta: curRate - prevRate,
        pct,
        curUsage: v.curUsage,
        curWinRate: v.curWinRate,
      });
    }
    return rows.sort((a, b) => b.pct - a.pct);
  }, [computed]);

  const tab = range === "full" ? "muestra completa" : `${range} actual vs previo`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {(
            [
              ["24h", "24H"],
              ["7d", "7D"],
              ["30d", "30D"],
              ["90d", "90D"],
              ["full", "Muestra"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setRange(id)}
              disabled={id !== "full" && !(ranges?.some((r) => r.key === id))}
              title={
                id !== "full" && !(ranges?.some((r) => r.key === id))
                  ? "La muestra disponible no cubre este rango"
                  : undefined
              }
              className={`rounded-full px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                range === id
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

      {!loading && !error && deltas.length === 0 && (
        <p className="rounded-md bg-[var(--color-panel-raised)] px-3 py-3 text-sm text-[var(--color-text-dim)]">
          Data unavailable: muestra insuficiente para estimar evolución del meta.
        </p>
      )}

      {!loading && !error && deltas.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel-raised)] text-left text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
                <th className="px-3 py-2">Arma</th>
                <th className="px-3 py-2 text-right">Tendencia</th>
                <th className="px-3 py-2 text-right">Cambio</th>
                <th className="px-3 py-2 text-right">Usos (ventana)</th>
                <th className="px-3 py-2 text-right">WR actual</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {deltas.slice(0, 15).map((r) => (
                <tr key={r.family} className="border-b border-[var(--color-border)]/50 last:border-b-0">
                  <td className="px-3 py-2 font-medium text-[var(--color-text)]">{r.family}</td>
                  <td className="px-3 py-2 text-right">
                    {r.pct > 0.25 ? (
                      <span className="text-emerald-400">📈 Subiendo</span>
                    ) : r.pct < -0.25 ? (
                      <span className="text-red-400">📉 Cayendo</span>
                    ) : (
                      <span className="text-[var(--color-text-dim)]">➡ Estable</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-[var(--color-text-dim)]">
                    {r.pct > 0 ? "+" : ""}
                    {(r.pct * 100).toFixed(0)} %
                  </td>
                  <td className="px-3 py-2 text-right text-[var(--color-text-dim)]">{r.curUsage}</td>
                  <td className="px-3 py-2 text-right text-emerald-400">
                    {(r.curWinRate * 100).toFixed(0)} %
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => onOpenBuilds(r.family)}
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
            Tendencia: {tab}. Cambio relativo del uso entre las dos ventanas de la muestra real.
          </p>
        </div>
      )}
    </div>
  );
}