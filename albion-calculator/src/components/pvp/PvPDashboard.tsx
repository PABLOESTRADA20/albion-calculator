"use client";

import { useMemo } from "react";
import { familyMeta } from "@/lib/pvp/analytics";
import { usePvpEvents } from "@/lib/pvp/usePvp";
import type { ServerId } from "@/types/albion";

interface PvPDashboardProps {
  serverId: ServerId;
  onOpenBuilds: (weaponFamily?: string) => void;
}

export function PvPDashboard({ serverId, onOpenBuilds }: PvPDashboardProps) {
  const { events, loading, error, refresh } = usePvpEvents(serverId);

  const stats = useMemo(() => {
    if (events.length === 0) return null;
    const killerFams = new Map<string, number>();
    const victimFams = new Map<string, number>();
    for (const f of events) {
      killerFams.set(f.killer.weaponFamily, (killerFams.get(f.killer.weaponFamily) ?? 0) + 1);
      victimFams.set(f.victim.weaponFamily, (victimFams.get(f.victim.weaponFamily) ?? 0) + 1);
    }
    const topKiller = [...killerFams.entries()].sort((a, b) => b[1] - a[1])[0];
    const topVictim = [...victimFams.entries()].sort((a, b) => b[1] - a[1])[0];
    const meta = familyMeta(events);
    const best = meta.find((s) => s.kills + s.deaths >= 10) ?? meta[0] ?? null;
    const familyUnion = new Set([...killerFams.keys(), ...victimFams.keys()]);
    return {
      totalFights: events.length,
      families: familyUnion.size,
      topKiller,
      topVictim,
      best,
      playersKilled: new Set(events.map((f) => f.victim.id)).size,
      avgGroup: events.reduce((a, f) => a + f.groupMemberCount, 0) / events.length,
    };
  }, [events]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
          PvP Analytics · resumen de la muestra global
        </p>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
        >
          Refrescar
        </button>
      </div>

      {loading && <p className="text-sm text-[var(--color-text-dim)]">Cargando muestra global de combates…</p>}
      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      {!loading && !error && !stats && (
        <p className="rounded-md bg-[var(--color-panel-raised)] px-3 py-3 text-sm text-[var(--color-text-dim)]">
          Data unavailable: la fuente de eventos no devuelve datos en este momento.
        </p>
      )}

      {!loading && !error && stats && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <DashStat label="Combates (muestra)" value={String(stats.totalFights)} />
            <DashStat label="Familias de arma vistas" value={String(stats.families)} />
            <DashStat label="Víctimas distintas" value={String(stats.playersKilled)} />
            <DashStat label="Tamaño medio de grupo" value={stats.avgGroup.toFixed(1) + "v1"} />
            <DashStat
              label="Top familia (kills)"
              value={stats.topKiller[0]}
              sub={`${stats.topKiller[1]} kills`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <DashStat label="Top familia (muertes)" value={stats.topVictim[0]} sub={`${stats.topVictim[1]} muertes`} />
            <DashStat
              label="Mejor WR (con muestra)"
              value={stats.best ? `${(stats.best.winRate * 100).toFixed(0)} %` : "N/A"}
              sub={stats.best ? stats.best.family : undefined}
            />
            <DashStat label="K/D global" value="—" sub="Ver pestaña Meta" />
            <DashStat label="Matchups" value="—" sub="Ver pestaña Matchups" />
            <DashStat label="Counters" value="—" sub="Ver pestaña Counters" />
          </div>

          {stats.best && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 px-4 py-3">
              <span className="text-xs text-[var(--color-text-dim)]">
                Arma destacada de la muestra: <strong className="text-[var(--color-text)]">{stats.best.family}</strong>{" "}
                ({stats.best.kills} kills / {stats.best.deaths} muertes, WR {(stats.best.winRate * 100).toFixed(0)} %)
              </span>
              <button
                onClick={() => onOpenBuilds(stats.best?.family)}
                className="ml-auto rounded-md bg-[var(--color-gold)] px-3 py-1 text-xs font-bold text-black transition-opacity hover:opacity-90"
              >
                VIEW BUILDS
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DashStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-3">
      <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[var(--color-gold)]">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-[var(--color-text-dim)]">{sub}</p>}
    </div>
  );
}