"use client";

import { useState } from "react";
import { usePlayerData } from "@/lib/pvp/usePvp";
import { PlayerSearch } from "@/components/pvp/PlayerSearch";
import type { PvpPlayerSummary } from "@/lib/pvp/types";
import type { ServerId } from "@/types/albion";

interface PlayerCompareProps {
  serverId: ServerId;
}

type Side = "left" | "right";

export function PlayerCompare({ serverId }: PlayerCompareProps) {
  const [left, setLeft] = useState<PvpPlayerSummary | null>(null);
  const [right, setRight] = useState<PvpPlayerSummary | null>(null);
  const [flip, setFlip] = useState<Side>("left");

  const a = usePlayerData(serverId, left?.id ?? null);
  const b = usePlayerData(serverId, right?.id ?? null);

  const showA = flip === "left" ? a : b;
  const showB = flip === "left" ? b : a;

  const bothLoaded =
    left !== null &&
    right !== null &&
    showA.loadedFor === left.id &&
    showB.loadedFor === right.id &&
    !showA.loading &&
    !showB.loading;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
          Compara dos jugadores
        </p>
        <button
          onClick={() => setFlip((s) => (s === "left" ? "right" : "left"))}
          className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)]"
        >
          Intercambiar lados
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <PlayerSearch serverId={serverId} onSelect={setLeft} label={`Jugador A${left ? ` (${left.name})` : ""}`} />
        </div>
        <div>
          <PlayerSearch serverId={serverId} onSelect={setRight} label={`Jugador B${right ? ` (${right.name})` : ""}`} />
        </div>
      </div>

      {left && right && bothLoaded && (
        <CompareTable
          nameA={left.name}
          nameB={right.name}
          profileA={showA.profile}
          profileB={showB.profile}
        />
      )}

      {left && right && !bothLoaded && (
        <p className="text-sm text-[var(--color-text-dim)]">
          {showA.loading || showB.loading ? "Cargando datos de los jugadores…" : "Sin datos públicos para comparar."}
        </p>
      )}

      {(!left || !right) && (
        <p className="rounded-md bg-[var(--color-panel-raised)] px-3 py-2 text-sm text-[var(--color-text-dim)]">
          Selecciona dos jugadores para comparar sus stats PvP.
        </p>
      )}
    </div>
  );
}

function CompareTable({
  nameA,
  nameB,
  profileA,
  profileB,
}: {
  nameA: string;
  nameB: string;
  profileA: PvpPlayerSummary | null;
  profileB: PvpPlayerSummary | null;
}) {
  const rows: { label: string; valueA: string; valueB: string }[] = [
    { label: "Kills", valueA: String(profileA?.kills ?? "N/A"), valueB: String(profileB?.kills ?? "N/A") },
    { label: "Deaths", valueA: String(profileA?.deaths ?? "N/A"), valueB: String(profileB?.deaths ?? "N/A") },
    {
      label: "K/D",
      valueA: fmtKd(profileA?.kills, profileA?.deaths),
      valueB: fmtKd(profileB?.kills, profileB?.deaths),
    },
    {
      label: "Win rate",
      valueA: fmtWr(profileA?.kills, profileA?.deaths),
      valueB: fmtWr(profileB?.kills, profileB?.deaths),
    },
    { label: "Kill Fame", valueA: fmtNum(profileA?.killFame), valueB: fmtNum(profileB?.killFame) },
    { label: "Death Fame", valueA: fmtNum(profileA?.deathFame), valueB: fmtNum(profileB?.deathFame) },
    { label: "Asistencias", valueA: fmtNum(profileA?.assists), valueB: fmtNum(profileB?.assists) },
    { label: "Gremio", valueA: profileA?.guildName ?? "—", valueB: profileB?.guildName ?? "—" },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel-raised)] text-left text-xs">
            <th className="px-3 py-2" />
            <th className="px-3 py-2 font-semibold text-[var(--color-gold)]">{nameA}</th>
            <th className="px-3 py-2 font-semibold text-[var(--color-gold)]">{nameB}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-[var(--color-border)]/50 last:border-b-0">
              <td className="px-3 py-2 text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">{r.label}</td>
              <td className="px-3 py-2 font-medium text-[var(--color-text)]">{r.valueA}</td>
              <td className="px-3 py-2 font-medium text-[var(--color-text)]">{r.valueB}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function fmtKd(kills?: number, deaths?: number) {
  if (kills === undefined || deaths === undefined) return "N/A";
  return deaths > 0 ? (kills / deaths).toFixed(2) : kills > 0 ? "∞" : "N/A";
}

function fmtWr(kills?: number, deaths?: number) {
  if (kills === undefined || deaths === undefined) return "N/A";
  const total = kills + deaths;
  return total > 0 ? `${((kills / total) * 100).toFixed(1)} %` : "N/A";
}

function fmtNum(v?: number) {
  return v !== undefined ? v.toLocaleString("es-ES", { maximumFractionDigits: 0 }) : "N/A";
}