"use client";

import { useMemo, useState } from "react";
import { matchupsFor } from "@/lib/pvp/analytics";
import type { WeaponFamilyKey } from "@/lib/pvp/weapons";
import { WEAPON_FAMILIES, UNKNOWN_WEAPON } from "@/lib/pvp/weapons";
import { usePvpEvents } from "@/lib/pvp/usePvp";
import type { ServerId } from "@/types/albion";

interface MatchupAnalyzerProps {
  serverId: ServerId;
}

export function MatchupAnalyzer({ serverId }: MatchupAnalyzerProps) {
  const [myWeapon, setMyWeapon] = useState<WeaponFamilyKey>("Bloodletter");
  const { events, loading, error, refresh } = usePvpEvents(serverId);

  const result = useMemo(
    () => matchupsFor(events, myWeapon),
    [events, myWeapon]
  );

  const fmt = (v: number) => `${(v * 100).toFixed(0)} %`;

  const badge = (wr: number, fights: number) => {
    if (fights < 10) return <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-[10px] text-[var(--color-text-dim)]">pocos datos</span>;
    if (wr >= 0.55) return <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">🟢 Favorable</span>;
    if (wr <= 0.45) return <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400">🔴 Desfavorable</span>;
    return <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">🟡 Neutral</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Mi arma</span>
          <select
            value={myWeapon}
            onChange={(e) => setMyWeapon(e.target.value as WeaponFamilyKey)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-1.5 text-sm text-[var(--color-text)]"
          >
            {WEAPON_FAMILIES.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
            <option value={UNKNOWN_WEAPON}>Otra arma</option>
          </select>
        </label>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
        >
          Refrescar datos
        </button>
        <span className="text-xs text-[var(--color-text-dim)]">
          {loading ? "Cargando combates recientes…" : `${result.totalFights} combates analizados (muestra global reciente)`}
        </span>
      </div>

      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && result.matchups.length === 0 && (
        <p className="rounded-md bg-[var(--color-panel-raised)] px-3 py-3 text-sm text-[var(--color-text-dim)]">
          Data unavailable: no hay suficientes combates públicos recientes para
          calcular matchups de {myWeapon}.
        </p>
      )}

      {!loading && !error && result.matchups.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
                <th className="px-3 py-2">Arma rival</th>
                <th className="px-3 py-2 text-right">Fights</th>
                <th className="px-3 py-2 text-right">Wins</th>
                <th className="px-3 py-2 text-right">Losses</th>
                <th className="px-3 py-2 text-right">Win Rate</th>
                <th className="px-3 py-2 text-right">Matchup</th>
              </tr>
            </thead>
            <tbody>
              {result.matchups.map((m) => (
                <tr key={m.opponentFamily} className="border-b border-[var(--color-border)] bg-[var(--color-panel)]">
                  <td className="px-3 py-2 font-medium text-[var(--color-text)]">{m.opponentFamily}</td>
                  <td className="px-3 py-2 text-right text-[var(--color-text)]">{m.fights}</td>
                  <td className="px-3 py-2 text-right text-emerald-400">{m.wins}</td>
                  <td className="px-3 py-2 text-right text-red-400">{m.losses}</td>
                  <td className="px-3 py-2 text-right font-medium text-[var(--color-text)]">{fmt(m.winRate)}</td>
                  <td className="px-3 py-2 text-right">{badge(m.winRate, m.fights)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
        Basado en combates reales recientes de la API oficial. El tamaño de muestra
        por matchup puede ser pequeño: trata los % como orientativos.
      </p>
    </div>
  );
}