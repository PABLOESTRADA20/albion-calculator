"use client";

import { useMemo, useState } from "react";
import { usePlayerData } from "@/lib/pvp/usePvp";
import { PlayerSearch } from "@/components/pvp/PlayerSearch";
import type { PvpFight, PvpPlayerSummary } from "@/lib/pvp/types";
import type { WeaponFamilyKey } from "@/lib/pvp/weapons";
import type { ServerId } from "@/types/albion";

interface FightHistoryProps {
  serverId: ServerId;
  initialPlayer?: PvpPlayerSummary | null;
}

type ResultFilter = "all" | "win" | "loss";

export function FightHistory({ serverId, initialPlayer }: FightHistoryProps) {
  const [selected, setSelected] = useState<PvpPlayerSummary | null>(initialPlayer ?? null);
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
  const [weaponFilter, setWeaponFilter] = useState<WeaponFamilyKey | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { profile, kills, deaths, loading, error, loadedFor } = usePlayerData(
    serverId,
    selected?.id ?? null
  );

  const fights = useMemo(() => {
    const playerId = selected?.id;
    if (!playerId) return [];
    const asKills = kills.map((f) => ({ fight: f, win: true }));
    const asDeaths = deaths.map((f) => ({ fight: f, win: false }));
    return [...asKills, ...asDeaths]
      .sort((a, b) => b.fight.timestamp.localeCompare(a.fight.timestamp))
      .map(({ fight, win }) => ({ fight, win }));
  }, [kills, deaths, selected]);

  const opponentFamilies = useMemo(() => {
    const set = new Set<WeaponFamilyKey>();
    for (const { fight, win } of fights) {
      const opp = win ? fight.victim.weaponFamily : fight.killer.weaponFamily;
      set.add(opp);
    }
    return [...set];
  }, [fights]);

  const filtered = useMemo(
    () =>
      fights.filter(({ fight, win }) => {
        if (resultFilter === "win" && !win) return false;
        if (resultFilter === "loss" && win) return false;
        if (weaponFilter !== "all") {
          const opp = win ? fight.victim.weaponFamily : fight.killer.weaponFamily;
          if (opp !== weaponFilter) return false;
        }
        return true;
      }),
    [fights, resultFilter, weaponFilter]
  );

  const current = profile && loadedFor === selected?.id ? profile : null;

  const fmtDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? "—"
      : d.toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4">
      <PlayerSearch serverId={serverId} onSelect={setSelected} />

      {selected && loading && <p className="text-sm text-[var(--color-text-dim)]">Cargando historial…</p>}
      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      {current && !loading && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
              {(
                [
                  ["all", "Todos"],
                  ["win", "Wins"],
                  ["loss", "Losses"],
                ] as [ResultFilter, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setResultFilter(id)}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    resultFilter === id
                      ? "bg-[var(--color-gold)] text-black"
                      : "bg-[var(--color-panel-raised)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              value={weaponFilter}
              onChange={(e) => setWeaponFilter(e.target.value as WeaponFamilyKey | "all")}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-2 py-1 text-xs text-[var(--color-text)]"
            >
              <option value="all">Arma rival: todas</option>
              {opponentFamilies.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <span className="text-xs text-[var(--color-text-dim)]">
              {filtered.length} combates (recientes)
            </span>
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-md bg-[var(--color-panel-raised)] px-3 py-3 text-sm text-[var(--color-text-dim)]">
              Sin combates con estos filtros.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {filtered.slice(0, 60).map(({ fight, win }) => (
                <li key={fight.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel)]">
                  <button
                    onClick={() => setExpandedId((id) => (id === fight.id ? null : fight.id))}
                    className="flex w-full flex-wrap items-center gap-2 px-3 py-2 text-left"
                  >
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        win ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {win ? "WIN" : "LOSS"}
                    </span>
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      {win ? fight.victim.name : fight.killer.name}
                    </span>
                    <span className="text-xs text-[var(--color-text-dim)]">
                      {win
                        ? `${fight.killer.weaponFamily} vs ${fight.victim.weaponFamily}`
                        : `${fight.victim.weaponFamily} vs ${fight.killer.weaponFamily}`}
                    </span>
                    <span className="ml-auto text-xs text-[var(--color-text-dim)]">{fmtDate(fight.timestamp)}</span>
                  </button>

                  {expandedId === fight.id && (
                    <FightDetail fight={fight} win={win} history={fights} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {selected && !current && !loading && !error && (
        <p className="rounded-md bg-[var(--color-panel-raised)] px-3 py-2 text-sm text-[var(--color-text-dim)]">
          Data unavailable: no hay historial público reciente de este jugador.
        </p>
      )}
    </div>
  );
}

function FightDetail({
  fight,
  win,
  history,
}: {
  fight: PvpFight;
  win: boolean;
  history: { fight: PvpFight; win: boolean }[];
}) {
  const me = win ? fight.killer : fight.victim;
  const opp = win ? fight.victim : fight.killer;
  const oppFam = opp.weaponFamily;

  // Win rate del jugador contra esta familia segun su propio historial publico.
  const { winRate, fights } = (() => {
    let wins = 0;
    let losses = 0;
    for (const f of history) {
      const o = f.win ? f.fight.victim.weaponFamily : f.fight.killer.weaponFamily;
      if (o !== oppFam) continue;
      if (f.win) wins += 1;
      else losses += 1;
    }
    const total = wins + losses;
    return { winRate: total > 0 ? wins / total : null, fights: total };
  })();

  const difficulty = winRate === null ? "unknown" : winRate >= 0.55 ? "easy" : winRate >= 0.45 ? "neutral" : "hard";

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
            {win ? "Tú (killer)" : "Tú (víctima)"}
          </p>
          <p className="text-sm font-medium text-[var(--color-text)]">
            {me.name} · {me.weaponFamily}
          </p>
          {me.guildName && <p className="text-xs text-[var(--color-text-dim)]">{me.guildName}</p>}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">Rival</p>
          <p className="text-sm font-medium text-[var(--color-text)]">
            {opp.name} · {opp.weaponFamily}
          </p>
          {opp.guildName && <p className="text-xs text-[var(--color-text-dim)]">{opp.guildName}</p>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-[var(--color-text-dim)]">
          Tamaño de pelea: {fight.groupMemberCount}v{Math.max(1, fight.totalParticipants - fight.groupMemberCount)}
        </span>
        <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-[var(--color-text-dim)]">
          Zona: {fight.locationId ?? "N/A"}
        </span>
        <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-[var(--color-text-dim)]">
          Kill Fame: {(opp.killFame ?? 0).toLocaleString("es-ES")}
        </span>
        <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-[var(--color-text-dim)]">
          Death Fame: {(opp.deathFame ?? 0).toLocaleString("es-ES")}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 ${
            difficulty === "hard"
              ? "bg-red-500/10 text-red-400"
              : difficulty === "easy"
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-yellow-500/10 text-yellow-400"
          }`}
        >
          {difficulty === "hard"
            ? "🔴 Difícil"
            : difficulty === "easy"
              ? "🟢 Favorable"
              : difficulty === "neutral"
                ? "🟡 Según matchup"
                : "⚪ Sin muestra suficiente"}
        </span>
      </div>

      <p className="mt-2 text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
        {winRate !== null
          ? `Tu win rate vs ${oppFam}: ${(winRate * 100).toFixed(0)} % (${fights} combates en tu historial)`
          : `Tu win rate vs ${oppFam}: N/A (sin combates previos en tu historial)`}
      </p>
      <p className="mt-1 text-[10px] text-[var(--color-text-dim)]">
        Damage, healing, habilidades, posicionamiento y cooldowns no están disponibles en la fuente: no se muestran.
      </p>
    </div>
  );
}