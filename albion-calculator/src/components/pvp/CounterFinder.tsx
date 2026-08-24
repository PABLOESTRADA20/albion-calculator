"use client";

import { useMemo, useState } from "react";
import { countersFor } from "@/lib/pvp/analytics";
import { bestBuildForFamily } from "@/lib/pvp/builds";
import { usePvpEvents } from "@/lib/pvp/usePvp";
import { WEAPON_FAMILIES, UNKNOWN_WEAPON } from "@/lib/pvp/weapons";
import type { WeaponFamilyKey } from "@/lib/pvp/weapons";
import type { ServerId } from "@/types/albion";
import { BuildCostPanel } from "@/components/builds/BuildCostPanel";
import type { PriceProvider } from "@/types/albion";

interface CounterFinderProps {
  serverId: ServerId;
  marketProvider: PriceProvider;
  onOpenBuilds: (weaponFamily?: string) => void;
}

export function CounterFinder({ serverId, marketProvider, onOpenBuilds }: CounterFinderProps) {
  const [enemyWeapon, setEnemyWeapon] = useState<WeaponFamilyKey>("Curse");
  const { events, loading, error, refresh } = usePvpEvents(serverId);

  const counters = useMemo(
    () => countersFor(events, enemyWeapon),
    [events, enemyWeapon]
  );

  const topBuild = useMemo(
    () => (counters[0] ? bestBuildForFamily(counters[0].counterFamily) : null),
    [counters]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            Arma enemiga
          </span>
          <select
            value={enemyWeapon}
            onChange={(e) => setEnemyWeapon(e.target.value as WeaponFamilyKey)}
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
      </div>

      {loading && <p className="text-sm text-[var(--color-text-dim)]">Cargando combates recientes…</p>}
      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      {!loading && !error && counters.length === 0 && (
        <p className="rounded-md bg-[var(--color-panel-raised)] px-3 py-3 text-sm text-[var(--color-text-dim)]">
          Data unavailable: no hay suficientes combates recientes contra {enemyWeapon} para
          calcular counters fiables.
        </p>
      )}

      {!loading && !error && counters.length > 0 && (
        <div className="space-y-3">
          <ol className="space-y-1.5">
            {counters.slice(0, 5).map((c, i) => (
              <li
                key={c.counterFamily}
                className="flex items-center gap-3 rounded-md bg-[var(--color-panel)] px-3 py-2"
              >
                <span className="w-6 text-center text-sm font-semibold text-[var(--color-gold)]">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-[var(--color-text)]">{c.counterFamily}</span>
                <span className="text-xs text-[var(--color-text-dim)]">{c.fights} fights</span>
                <span className="w-16 text-right text-sm font-semibold text-emerald-400">
                  {(c.winRate * 100).toFixed(0)} %
                </span>
                <button
                  onClick={() => onOpenBuilds(c.counterFamily)}
                  className="rounded-md border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 px-2 py-1 text-xs font-medium text-[var(--color-gold)] transition-colors hover:bg-[var(--color-gold)]/20"
                >
                  VIEW BUILDS
                </button>
              </li>
            ))}
          </ol>

          {topBuild && (
            <div className="rounded-lg border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 p-4">
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
                Counter recomendado (fuente: Builds)
              </p>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {topBuild.name}
                  <span className="ml-2 rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-xs text-[var(--color-text-dim)]">
                    {counters[0].counterFamily} · WR {(counters[0].winRate * 100).toFixed(0)} % ({counters[0].fights} fights)
                  </span>
                </p>
                <button
                  onClick={() => onOpenBuilds(counters[0].counterFamily)}
                  className="rounded-md bg-[var(--color-gold)] px-3 py-1.5 text-xs font-bold text-black transition-opacity hover:opacity-90"
                >
                  VIEW BUILDS
                </button>
              </div>
              <BuildCostPanel
                provider={marketProvider}
                items={topBuild.items}
                refreshKey={`counter-${topBuild.id}`}
                title="Coste del counter"
              />
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
        Basado en combates reales recientes. El ranking de counters es orientativo
        y depende de la muestra disponible.
      </p>
    </div>
  );
}