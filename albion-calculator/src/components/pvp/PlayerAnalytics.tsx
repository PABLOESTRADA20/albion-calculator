"use client";

import { useMemo, useState } from "react";
import { usePlayerData } from "@/lib/pvp/usePvp";
import { PlayerSearch } from "@/components/pvp/PlayerSearch";
import type { ServerId } from "@/types/albion";
import type { PvpPlayerSummary } from "@/lib/pvp/types";

interface PlayerAnalyticsProps {
  serverId: ServerId;
  /** Jugador inicial (desde Dashboard o Search global). */
  initialPlayer?: PvpPlayerSummary | null;
}

export function PlayerAnalytics({ serverId, initialPlayer }: PlayerAnalyticsProps) {
  const [selected, setSelected] = useState<PvpPlayerSummary | null>(initialPlayer ?? null);
  const { profile, kills, loading, error, loadedFor } = usePlayerData(
    serverId,
    selected?.id ?? null
  );

  const current = profile && loadedFor === selected?.id ? profile : null;

  const kad = useMemo(() => {
    if (!current) return null;
    const deaths = current.deaths > 0 ? current.deaths : 1;
    return current.kills / deaths;
  }, [current]);

  const winRate = useMemo(() => {
    if (!current) return null;
    const total = current.kills + current.deaths;
    return total > 0 ? (current.kills / total) * 100 : null;
  }, [current]);

  const mainWeapon = useMemo(() => {
    if (!current || kills.length === 0) return null;
    const used = new Map<string, number>();
    for (const f of kills) {
      if (f.killer.id !== current.id) continue;
      const w = f.killer.weaponFamily;
      used.set(w, (used.get(w) ?? 0) + 1);
    }
    const sorted = [...used.entries()].sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { family: sorted[0][0], count: sorted[0][1] } : null;
  }, [current, kills]);

  const fmt = (v: number) => v.toLocaleString("es-ES", { maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      <PlayerSearch serverId={serverId} onSelect={setSelected} />

      {selected && loading && (
        <p className="text-sm text-[var(--color-text-dim)]">Cargando datos del jugador…</p>
      )}
      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {current && !loading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Kills" value={fmt(current.kills)} />
          <StatCard label="Deaths" value={fmt(current.deaths)} />
          <StatCard label="K/D" value={kad !== null ? kad.toFixed(2) : "N/A"} />
          <StatCard
            label="Win Rate"
            value={winRate !== null ? `${winRate.toFixed(1)} %` : "N/A"}
          />
          <StatCard label="Kill Fame" value={fmt(current.killFame)} />
          <StatCard label="Death Fame" value={fmt(current.deathFame)} />
          <StatCard
            label="Main Weapon"
            value={mainWeapon ? mainWeapon.family : "N/A"}
            sub={mainWeapon ? `${mainWeapon.count} kills recientes` : "Datos de armas no disponibles"}
          />
          <StatCard label="Asistencias" value={fmt(current.assists)} />
        </div>
      )}

      {current && (
        <p className="text-xs text-[var(--color-text-dim)]">
          {current.guildName ? `Gremio: ${current.guildName}` : "Sin gremio"}
          {current.allianceName ? ` · Alianza: ${current.allianceName}` : ""}
        </p>
      )}

      {!selected && (
        <p className="rounded-md bg-[var(--color-panel-raised)] px-3 py-2 text-sm text-[var(--color-text-dim)]">
          Busca un jugador para ver su rendimiento PvP. Los datos proceden de la
          API oficial (gameinfo); si un campo no está disponible se muestra N/A.
        </p>
      )}
      {selected && !current && !loading && !error && (
        <p className="rounded-md bg-[var(--color-panel-raised)] px-3 py-2 text-sm text-[var(--color-text-dim)]">
          Data unavailable: no se encontraron datos públicos de este jugador.
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
      <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${value === "N/A" ? "text-[var(--color-text-dim)]" : "text-[var(--color-gold)]"}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[10px] text-[var(--color-text-dim)]">{sub}</p>}
    </div>
  );
}