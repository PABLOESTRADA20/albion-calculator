"use client";

import { useMemo, useState } from "react";
import { BestBadge, Table } from "@/components/market/Table";
import { ItemIcon } from "@/components/ItemIcon";
import { useMarketPrices } from "@/lib/useMarketPrices";
import { buildItemId, SLOT_LABELS } from "@/lib/builds/types";
import type { Build } from "@/lib/builds/types";
import { itemName } from "@/lib/builds/items";
import type { City, PriceProvider, Quality } from "@/types/albion";
import { CITIES } from "@/types/albion";

interface BuildCostOptimizerProps {
  provider: PriceProvider;
  build: Build;
}

export function BuildCostOptimizer({ provider, build }: BuildCostOptimizerProps) {
  const [tier, setTier] = useState(4);
  const [enchant, setEnchant] = useState(0);
  const [quality, setQuality] = useState<Quality>(1);
  const [showStrategy, setShowStrategy] = useState(false);

  const cities: City[] = useMemo(() => [...CITIES], []);

  const items = useMemo(
    () =>
      build.items.map((spec) => ({
        ...spec,
        id: buildItemId({ ...spec, tier, enchant }),
      })),
    [build.items, tier, enchant]
  );

  const itemIds = useMemo(() => items.map((i) => i.id), [items]);

  const { prices, loading, error, refresh } = useMarketPrices(
    provider,
    itemIds,
    cities,
    quality,
    "build-cost"
  );

  const rows = (() => {
    if (prices.length === 0) return [];
    const byItem = new Map<string, Map<City, number>>();
    for (const p of prices) {
      if (p.sellPriceMin <= 0) continue;
      let cityMap = byItem.get(p.itemId);
      if (!cityMap) {
        cityMap = new Map();
        byItem.set(p.itemId, cityMap);
      }
      const current = cityMap.get(p.city);
      if (current === undefined || p.sellPriceMin < current) {
        cityMap.set(p.city, p.sellPriceMin);
      }
    }
    return items.map((spec) => {
      const cityMap = byItem.get(spec.id);
      if (!cityMap || cityMap.size === 0) {
        return { spec, city: null as City | null, price: 0 };
      }
      let bestCity: City | null = null;
      let bestPrice = Infinity;
      for (const [city, price] of cityMap) {
        if (price < bestPrice) {
          bestPrice = price;
          bestCity = city;
        }
      }
      return { spec, city: bestCity, price: bestPrice };
    });
  })();

  const totals = (() => {
    const byCity = new Map<City, { sum: number; count: number; missing: string[] }>();
    for (const city of cities) {
      byCity.set(city, { sum: 0, count: 0, missing: [] });
    }
    for (const p of prices) {
      if (p.sellPriceMin <= 0) continue;
      const entry = byCity.get(p.city)!;
      entry.sum += p.sellPriceMin;
      entry.count += 1;
    }
    let normal = Infinity;
    let normalCity: City | null = null;
    for (const city of cities) {
      const entry = byCity.get(city)!;
      if (entry.count === items.length && entry.sum < normal) {
        normal = entry.sum;
        normalCity = city;
      }
    }
    const optimized = rows.reduce((acc, r) => acc + r.price, 0);
    const dataItems = rows.filter((r) => r.price > 0).length;
    const savings = normal === Infinity ? 0 : normal - optimized;
    const savingsPct = normal === Infinity ? 0 : (savings / normal) * 100;

    const groups = new Map<City, { count: number; subtotal: number; names: string[] }>();
    for (const r of rows) {
      if (!r.city) continue;
      let g = groups.get(r.city);
      if (!g) {
        g = { count: 0, subtotal: 0, names: [] };
        groups.set(r.city, g);
      }
      g.count += 1;
      g.subtotal += r.price;
      g.names.push(itemName(r.spec.id));
    }
    const strategy = [...groups.entries()]
      .sort((a, b) => b[1].subtotal - a[1].subtotal)
      .map(([city, g]) => ({ city, ...g }));

    return {
      normal,
      normalCity,
      optimized,
      dataItems,
      totalItems: items.length,
      savings,
      savingsPct,
      strategy,
    };
  })();

  const formatPrice = (v: number) =>
    v.toLocaleString("es-ES", { maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            Tier
          </p>
          <div className="flex gap-1">
            {[4, 5, 6, 7, 8].map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  tier === t
                    ? "bg-[var(--color-gold)] text-black"
                    : "bg-[var(--color-panel-raised)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                }`}
              >
                T{t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            Overenchant
          </p>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((e) => (
              <button
                key={e}
                onClick={() => setEnchant(e)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  enchant === e
                    ? "bg-[var(--color-gold)] text-black"
                    : "bg-[var(--color-panel-raised)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                }`}
              >
                .{e}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            Calidad
          </p>
          <select
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value) as Quality)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-1.5 text-sm text-[var(--color-text)]"
          >
            {[1, 2, 3, 4, 5].map((q) => (
              <option key={q} value={q}>
                {q} (calidad {q})
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
        >
          Actualizar
        </button>
      </div>

      {loading && (
        <p className="text-sm text-[var(--color-text-dim)]">
          Consultando precios en las {cities.length} ciudades…
        </p>
      )}

      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
                Coste normal (una ciudad)
              </p>
              <p className="mt-1 text-xl font-semibold text-[var(--color-text)]">
                {totals.normal === Infinity ? "—" : formatPrice(totals.normal)}
              </p>
              {totals.normalCity && (
                <p className="mt-0.5 text-xs text-[var(--color-gold)]">
                  Mejor ciudad: {totals.normalCity}
                </p>
              )}
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
                Coste optimizado (item a item)
              </p>
              <p className="mt-1 text-xl font-semibold text-emerald-400">
                {totals.optimized === 0 && totals.dataItems === 0
                  ? "—"
                  : formatPrice(totals.optimized)}
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-dim)]">
                {totals.dataItems}/{totals.totalItems} items con datos
              </p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
                Ahorro
              </p>
              <p className="mt-1 text-xl font-semibold text-[var(--color-gold)]">
                {totals.savings > 0
                  ? `${formatPrice(totals.savings)} (${totals.savingsPct.toFixed(1)} %)`
                  : "—"}
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-dim)]">
                {totals.savings > 0
                  ? `Comprando en ${totals.strategy.length} ciudades distintas`
                  : "Sin ahorro posible ahora mismo"}
              </p>
            </div>
          </div>

          <div
            className={`rounded-lg border p-4 transition-colors ${
              showStrategy
                ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5"
                : "border-[var(--color-border)] bg-[var(--color-panel-raised)]"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Estrategia de compra
              </p>
              <button
                onClick={() => setShowStrategy((s) => !s)}
                className="rounded-md bg-[var(--color-gold)] px-3 py-1.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                {showStrategy ? "Ocultar" : "Optimizar compra"}
              </button>
            </div>
            {totals.strategy.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {totals.strategy.map((g) => (
                  <li key={g.city} className="text-sm text-[var(--color-text-dim)]">
                    <span className="font-medium text-[var(--color-gold)]">
                      {g.city} · {g.count} items · {formatPrice(g.subtotal)}
                    </span>
                    <span className="block text-xs">
                      {g.names.join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[var(--color-text-dim)]">
                Sin precios disponibles para esta combinación de tier/calidad.
              </p>
            )}
          </div>

          {rows.length > 0 && (
            <Table headers={["Slot", "Item", "Mejor ciudad", "Precio"]}>
              {rows.map((r) => (
                <tr key={r.spec.slot} className="bg-[var(--color-panel)]">
                  <td className="px-3 py-2 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
                    {SLOT_LABELS[r.spec.slot]}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <ItemIcon itemId={r.spec.id} size={22} className="shrink-0" />
                      <span className="text-sm text-[var(--color-text)]">
                        {itemName(r.spec.id)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-[var(--color-text)]">
                    {r.city ? (
                      <>
                        {r.city}
                        <span className="ml-1">
                          <BestBadge>mejor</BestBadge>
                        </span>
                      </>
                    ) : (
                      <span className="text-[var(--color-text-dim)]">sin datos</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-medium text-[var(--color-text)]">
                    {r.price > 0 ? formatPrice(r.price) : "—"}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </>
      )}
    </div>
  );
}
