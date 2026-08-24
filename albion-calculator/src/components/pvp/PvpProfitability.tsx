"use client";

import { useMemo, useState } from "react";
import { usePvpEvents } from "@/lib/pvp/usePvp";
import { useMarketPrices } from "@/lib/useMarketPrices";
import { WEAPON_FAMILIES, UNKNOWN_WEAPON } from "@/lib/pvp/weapons";
import type { WeaponFamilyKey } from "@/lib/pvp/weapons";
import { CITIES } from "@/types/albion";
import type { City, PriceProvider, ServerId } from "@/types/albion";
import { formatSilver } from "@/lib/calc/format";

interface PvpProfitabilityProps {
  serverId: ServerId;
  marketProvider: PriceProvider;
}

const MAX_VICTIMS = 30;

/**
 * Rentabilidad PvP estimada: valor de mercado del equipo de las victimas
 * (items reales de los eventos) con precios reales del mercado del servidor.
 * Todo lo calculado aqui es "estimated": el loot real difiere (no se incluyen
 * impuestos, reputacion ni drops exactos).
 */
export function PvpProfitability({ serverId, marketProvider }: PvpProfitabilityProps) {
  const { events, loading: eventsLoading, error: eventsError, refresh } = usePvpEvents(serverId);
  const [city, setCity] = useState<City>("Caerleon");
  const [family, setFamily] = useState<WeaponFamilyKey | "all">("all");

  const victims = useMemo(() => events.slice(0, MAX_VICTIMS), [events]);

  const victimItemIds = useMemo(() => {
    const ids = new Set<string>();
    for (const f of victims) {
      for (const item of f.victim.items) {
        if (item.id) ids.add(item.id);
      }
    }
    return [...ids].slice(0, 400);
  }, [victims]);

  const { prices, loading: pricesLoading, error: pricesError } = useMarketPrices(
    marketProvider,
    victimItemIds,
    [city],
    1,
    `pvp-profit-${serverId}-${victimItemIds.length}`
  );

  const priceByItem = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of prices) {
      const current = m.get(p.itemId);
      if (current === undefined || p.sellPriceMin < current) m.set(p.itemId, p.sellPriceMin);
    }
    return m;
  }, [prices]);

  const valueById = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of victims) {
      let total = 0;
      for (const item of f.victim.items) {
        const v = priceByItem.get(item.id);
        if (v !== undefined) total += v;
      }
      m.set(f.victim.id, total);
    }
    return m;
  }, [victims, priceByItem]);

  const byFamily = useMemo(() => {
    const acc = new Map<string, { victims: number; valued: number; total: number; avg: number }>();
    for (const f of victims) {
      const fam = f.victim.weaponFamily;
      const entry = acc.get(fam) ?? { victims: 0, valued: 0, total: 0, avg: 0 };
      entry.victims += 1;
      const v = valueById.get(f.victim.id) ?? 0;
      if (v > 0) {
        entry.valued += 1;
        entry.total += v;
      }
      acc.set(fam, entry);
    }
    return [...acc.entries()]
      .map(([familyKey, e]) => ({ family: familyKey, ...e, avg: e.valued > 0 ? e.total / e.valued : 0 }))
      .sort((a, b) => b.avg - a.avg);
  }, [victims, valueById]);

  const filtered = family === "all" ? byFamily : byFamily.filter((r) => r.family === family);
  const priceCoverage = victimItemIds.length > 0 ? prices.length / victimItemIds.length : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Ciudad</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value as City)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-1.5 text-sm text-[var(--color-text)]"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Familia de víctimas</span>
          <select
            value={family}
            onChange={(e) => setFamily(e.target.value as WeaponFamilyKey | "all")}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-1.5 text-sm text-[var(--color-text)]"
          >
            <option value="all">Todas</option>
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
          disabled={eventsLoading}
          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
        >
          Refrescar datos
        </button>
      </div>

      {(eventsLoading || pricesLoading) && (
        <p className="text-sm text-[var(--color-text-dim)]">Calculando valor estimado del botín…</p>
      )}
      {(eventsError || pricesError) && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {eventsError ?? pricesError}
        </p>
      )}

      {!eventsLoading && !eventsError && filtered.length === 0 && (
        <p className="rounded-md bg-[var(--color-panel-raised)] px-3 py-3 text-sm text-[var(--color-text-dim)]">
          Data unavailable: no hay víctimas con equipo valorado en la muestra.
        </p>
      )}

      {!eventsLoading && !eventsError && filtered.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel-raised)] text-left text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
                <th className="px-3 py-2">Familia</th>
                <th className="px-3 py-2 text-right">Víctimas</th>
                <th className="px-3 py-2 text-right">Valoradas</th>
                <th className="px-3 py-2 text-right">Valor estimado medio</th>
                <th className="px-3 py-2 text-right">Valor total est.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 12).map((r) => (
                <tr key={r.family} className="border-b border-[var(--color-border)]/50 last:border-b-0">
                  <td className="px-3 py-2 font-medium text-[var(--color-text)]">{r.family}</td>
                  <td className="px-3 py-2 text-right text-[var(--color-text-dim)]">{r.victims}</td>
                  <td className="px-3 py-2 text-right text-[var(--color-text-dim)]">{r.valued}</td>
                  <td className="px-3 py-2 text-right font-semibold text-[var(--color-gold)]">
                    {formatSilver(r.avg)}
                  </td>
                  <td className="px-3 py-2 text-right text-[var(--color-text-dim)]">{formatSilver(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="bg-[var(--color-panel-raised)] px-3 py-2 text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
            Estimated: valor del equipo de las víctimas (solo {Math.round(priceCoverage * 100)} % de items con precio)
            en {city} · calidad Normal · sin impuestos ni tasas de venta · {victims.length} víctimas de la muestra
          </p>
        </div>
      )}
    </div>
  );
}