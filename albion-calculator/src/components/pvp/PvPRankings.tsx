"use client";

import { useMemo } from "react";
import { usePvpEvents } from "@/lib/pvp/usePvp";
import type { ServerId } from "@/types/albion";

interface PvPRankingsProps {
  serverId: ServerId;
}

/**
 * Rankings PvP calculados sobre la muestra real de combates.
 * Estimación no oficial: la fuente oficial no expone un leaderboard global.
 */
export function PvPRankings({ serverId }: PvPRankingsProps) {
  const { events, loading, error, refresh } = usePvpEvents(serverId);

  const rankings = useMemo(() => {
    const kills = new Map<string, { name: string; kills: number; killFame: number; guild: string | null }>();
    const deaths = new Map<string, { name: string; deaths: number; deathFame: number; guild: string | null }>();
    for (const f of events) {
      const k = kills.get(f.killer.id) ?? { name: f.killer.name, kills: 0, killFame: 0, guild: f.killer.guildName };
      k.kills += 1;
      k.killFame += f.killer.killFame ?? 0;
      kills.set(f.killer.id, k);
      const d = deaths.get(f.victim.id) ?? { name: f.victim.name, deaths: 0, deathFame: 0, guild: f.victim.guildName };
      d.deaths += 1;
      d.deathFame += f.victim.deathFame ?? 0;
      deaths.set(f.victim.id, d);
    }
    const killers = [...kills.values()]
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 10);
    const famers = [...kills.values()]
      .sort((a, b) => b.killFame - a.killFame)
      .slice(0, 10);
    const victims = [...deaths.values()]
      .sort((a, b) => b.deaths - a.deaths)
      .slice(0, 10);
    return { killers, famers, victims };
  }, [events]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
          Rankings (estimación sobre la muestra global reciente)
        </p>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
        >
          Refrescar
        </button>
      </div>

      {loading && <p className="text-sm text-[var(--color-text-dim)]">Cargando muestra…</p>}
      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      {!loading && !error && rankings.killers.length === 0 && (
        <p className="rounded-md bg-[var(--color-panel-raised)] px-3 py-3 text-sm text-[var(--color-text-dim)]">
          Data unavailable: sin combates en la muestra para estimar rankings.
        </p>
      )}

      {!loading && !error && rankings.killers.length > 0 && (
        <div className="grid gap-3 md:grid-cols-3">
          <RankTable
            title="Top killers"
            rows={rankings.killers.map((r) => ({ name: r.name, value: `${r.kills} kills`, sub: fmtFame(r.killFame), guild: r.guild }))}
          />
          <RankTable
            title="Top kill fame"
            rows={rankings.famers.map((r) => ({ name: r.name, value: fmtFame(r.killFame), sub: `${r.kills} kills`, guild: r.guild }))}
          />
          <RankTable
            title="Top víctimas"
            rows={rankings.victims.map((r) => ({ name: r.name, value: `${r.deaths} muertes`, sub: fmtFame(r.deathFame), guild: r.guild }))}
          />
        </div>
      )}

      <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
        Estimación propia a partir de {events.length} combates recientes: los rankings oficiales
        no están expuestos por la API pública. No es un leaderboard oficial.
      </p>
    </div>
  );
}

function fmtFame(v: number) {
  return `${Math.round(v).toLocaleString("es-ES")} fame`;
}

function RankTable({
  title,
  rows,
}: {
  title: string;
  rows: { name: string; value: string; sub: string; guild: string | null }[];
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-3">
      <p className="mb-2 text-xs font-semibold text-[var(--color-text)]">{title}</p>
      <ol className="space-y-1">
        {rows.map((r, i) => (
          <li key={r.name + i} className="flex items-center gap-2 text-xs">
            <span className="w-5 text-[var(--color-gold)]">{i + 1}</span>
            <span className="flex-1 truncate text-[var(--color-text)]" title={r.name}>
              {r.name}
              {r.guild ? <span className="ml-1 text-[var(--color-text-dim)]">({r.guild})</span> : null}
            </span>
            <span className="text-right">
              <span className="block font-medium text-[var(--color-text)]">{r.value}</span>
              <span className="block text-[var(--color-text-dim)]">{r.sub}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}