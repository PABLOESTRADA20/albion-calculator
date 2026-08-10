"use client";

import { useMemo, useState } from "react";
import { useMarketPrices } from "@/lib/useMarketPrices";
import { buildItemId } from "@/lib/builds/types";
import type { BuildItemSpec } from "@/lib/builds/types";
import { itemName } from "@/lib/builds/items";
import type { City, PriceProvider, Quality } from "@/types/albion";
import { CITIES } from "@/types/albion";

export interface BuildCostRow {
  spec: BuildItemSpec;
  resolvedId: string;
  city: City | null;
  price: number;
}

export interface BuildCostSummary {
  rows: BuildCostRow[];
  optimized: number;
  dataItems: number;
  totalItems: number;
  normal: number;
  normalCity: City | null;
  savings: number;
  savingsPct: number;
  strategy: { city: City; count: number; subtotal: number; names: string[] }[];
  missing: string[];
}

/** Las pociones solo existen en T4/T6 en el dataset: se clampa su tier a 4. */
function resolvedSpec(spec: BuildItemSpec, tier: number, enchant: number) {
  const potion = spec.slot === "potion";
  const specTier = potion ? 4 : tier;
  const specEnchant = potion ? 0 : enchant;
  return {
    ...spec,
    tier: specTier,
    enchant: specEnchant,
    id: buildItemId({ ...spec, tier: specTier, enchant: specEnchant }),
  };
}

/** Resumen de compra de una build partiendo del mapa de precios ya cargado. */
export function buildPurchaseSummary(
  items: BuildItemSpec[],
  prices: { itemId: string; city: City; sellPriceMin: number }[],
  cities: City[]
): BuildCostSummary {
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

  const rows: BuildCostRow[] = items.map((spec) => {
    const resolved = resolvedSpec(spec, spec.tier, spec.enchant);
    const cityMap = byItem.get(resolved.id);
    if (!cityMap || cityMap.size === 0) {
      return { spec: resolved, resolvedId: resolved.id, city: null, price: 0 };
    }
    let bestCity: City | null = null;
    let bestPrice = Infinity;
    for (const [city, price] of cityMap) {
      if (price < bestPrice) {
        bestPrice = price;
        bestCity = city;
      }
    }
    return { spec: resolved, resolvedId: resolved.id, city: bestCity, price: bestPrice };
  });

  const byCitySum = new Map<City, { sum: number; count: number }>();
  for (const city of cities) byCitySum.set(city, { sum: 0, count: 0 });
  for (const p of prices) {
    if (p.sellPriceMin <= 0) continue;
    const entry = byCitySum.get(p.city);
    if (entry) {
      entry.sum += p.sellPriceMin;
      entry.count += 1;
    }
  }

  let normal = Infinity;
  let normalCity: City | null = null;
  for (const city of cities) {
    const entry = byCitySum.get(city);
    if (entry && entry.count === items.length && entry.sum < normal) {
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
    g.names.push(r.spec.label ?? itemName(r.resolvedId));
  }
  const strategy = [...groups.entries()]
    .sort((a, b) => b[1].subtotal - a[1].subtotal)
    .map(([city, g]) => ({ city, ...g }));

  const missing = rows.filter((r) => r.price === 0).map((r) => r.spec.label ?? itemName(r.resolvedId));

  return {
    rows,
    optimized,
    dataItems,
    totalItems: items.length,
    normal,
    normalCity,
    savings,
    savingsPct,
    strategy,
    missing,
  };
}

/** Coste de compra de una build (o composicion) con precios reales. */
export function useBuildCost(
  provider: PriceProvider,
  items: BuildItemSpec[],
  refreshKey: unknown
) {
  const [quality, setQuality] = useState<Quality>(1);
  const [tier, setTier] = useState(4);
  const [enchant, setEnchant] = useState(0);

  const cities: City[] = useMemo(() => [...CITIES], []);

  const resolvedItems = useMemo(
    () => items.map((spec) => resolvedSpec(spec, tier, enchant)),
    [items, tier, enchant]
  );

  const itemIds = useMemo(() => resolvedItems.map((i) => i.id), [resolvedItems]);

  const { prices, loading, error, refresh } = useMarketPrices(
    provider,
    itemIds,
    cities,
    quality,
    String(refreshKey)
  );

  const summary = (() => {
    if (prices.length === 0) return null;
    return buildPurchaseSummary(items, prices, cities);
  })();

  return {
    tier,
    setTier,
    enchant,
    setEnchant,
    quality,
    setQuality,
    loading,
    error,
    refresh,
    summary,
    cities,
  };
}