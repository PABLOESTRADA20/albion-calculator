"use client";

import { useCallback, useMemo } from "react";
import { usePvpEvents, useVisibleInterval } from "@/lib/pvp/usePvp";
import type { ServerId } from "@/types/albion";

interface LiveKillFeedProps {
  serverId: ServerId;
}

/**
 * Feed de muertes en vivo con auto-refresco suave (60s, solo con la pestaña
 * visible). La fuente oficial expone los ultimos eventos globales; el feed
 * se actualiza sin hacer polling agresivo.
 */
export function LiveKillFeed({ serverId }: LiveKillFeedProps) {
  const { events, loading, error, refresh, isFresh, signature } = usePvpEvents(serverId, 2, 100);

  const latest = useMemo(() => {
    if (events.length === 0) return null;
    return [...events]
      .filter((f) => f.timestamp)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 50);
  }, [events]);

  useVisibleInterval(refresh, 60_000, true);

  const onManualRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const fmtTime = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
            Live Kill Feed · último evento: {latest && latest[0]?.timestamp ? fmtTime(latest[0].timestamp) : "—"}
          </p>
          <p className="text-[10px] text-[var(--color-text-dim)]">
            Auto-refresco cada 60 s (solo con la pestaña visible). {isFresh ? "muestra actualizada" : "muestra en carga"}
          </p>
        </div>
        <button
          onClick={onManualRefresh}
          disabled={loading}
          className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
        >
          Actualizar ahora
        </button>
      </div>

      {loading && <p className="text-sm text-[var(--color-text-dim)]">Cargando muertes recientes…</p>}
      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      {!loading && !error && latest && latest.length === 0 && (
        <p className="rounded-md bg-[var(--color-panel-raised)] px-3 py-3 text-sm text-[var(--color-text-dim)]">
          No hay eventos recientes en este momento.
        </p>
      )}

      {!loading && !error && latest && latest.length > 0 && (
        <ul className="space-y-1">
          {latest.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-md bg-[var(--color-panel)] px-3 py-1.5 text-xs"
            >
              <span className="text-[var(--color-text-dim)]">{fmtTime(f.timestamp)}</span>
              <span className="font-medium text-red-400">
                {f.killer.name}
                <span className="ml-1 text-[var(--color-text-dim)]">({f.killer.weaponFamily})</span>
              </span>
              <span className="text-[var(--color-text-dim)]">⚔</span>
              <span className="font-medium text-[var(--color-text)]">
                {f.victim.name}
                <span className="ml-1 text-[var(--color-text-dim)]">({f.victim.weaponFamily})</span>
              </span>
              <span className="ml-auto flex gap-1.5">
                <span className="rounded-full bg-[var(--color-panel-raised)] px-2 py-0.5 text-[var(--color-text-dim)]">
                  {f.groupMemberCount}v{f.totalParticipants - f.groupMemberCount > 0 ? f.totalParticipants - f.groupMemberCount : 1}
                </span>
                {f.locationId && (
                  <span className="rounded-full bg-[var(--color-panel-raised)] px-2 py-0.5 text-[var(--color-text-dim)]">
                    {f.locationId}
                  </span>
                )}
                {(f.killer.guildName || f.victim.guildName) && (
                  <span className="rounded-full bg-[var(--color-panel-raised)] px-2 py-0.5 text-[var(--color-text-dim)]">
                    {f.killer.guildName ?? "?"} vs {f.victim.guildName ?? "?"}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
        Datos reales de la API oficial de eventos (gameinfo) · firma {signature.slice(0, 12)}… · {events.length} eventos en memoria
      </p>
    </div>
  );
}