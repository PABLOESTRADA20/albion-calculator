"use client";

import { useMemo, useState } from "react";
import { BestMoveNow } from "@/components/market/BestMoveNow";
import { Table } from "@/components/market/Table";
import { ItemIcon } from "@/components/ItemIcon";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { useMarketPrices } from "@/lib/useMarketPrices";
import {
  ENCHANT_LABELS,
  REFINE_ENCHANTS,
  REFINE_TIERS,
  RESOURCE_GROUPS,
  refineRecipe,
} from "@/lib/calc/refining";
import type { RefineRecipe, ResourceGroup } from "@/lib/calc/refining";
import { resourceReturnRate } from "@/lib/calc/returnRate";
import { refineFeePerUnit } from "@/lib/calc/fees";
import { sellOrderRevenue } from "@/lib/calc/market";
import { formatPercent, formatSilver, profitClass } from "@/lib/calc/format";
import type { MarketOpportunity } from "@/lib/market/types";
import { itemName } from "@/lib/builds/items";
import type { City, PriceProvider } from "@/types/albion";
import { CITIES } from "@/types/albion";
import { Checkbox, NumberField, SelectField } from "@/components/UI";

interface RefiningOptimizerProps {
  provider: PriceProvider;
}

interface RecipeRow {
  group: ResourceGroup;
  recipe: RefineRecipe;
  city: City;
  rrr: number;
  materialCost: number;
  fee: number;
  revenue: number;
  profit: number;
  roi: number;
  missing: boolean;
}

function buildRecipes(): { group: ResourceGroup; recipe: RefineRecipe }[] {
  const out: { group: ResourceGroup; recipe: RefineRecipe }[] = [];
  for (const group of RESOURCE_GROUPS) {
    for (const tier of REFINE_TIERS) {
      const enchants =
        group.id === "stone" || tier === 2 ? [0] : [...REFINE_ENCHANTS];
      for (const enchant of enchants) {
        out.push({ group, recipe: refineRecipe(group, tier, enchant) });
      }
    }
  }
  return out;
}

export function RefiningOptimizer({ provider }: RefiningOptimizerProps) {
  const [groupFilter, setGroupFilter] = useState("all");
  const [tier, setTier] = useState(0);
  const [enchant, setEnchant] = useState(-1);
  const [quantity, setQuantity] = useState(100);
  const [useFocus, setUseFocus] = useState(false);
  const [premium, setPremium] = useState(true);
  const [usageFee, setUsageFee] = useState(1000);

  const cities: City[] = useMemo(() => [...CITIES], []);

  const allRecipes = useMemo(() => buildRecipes(), []);

  const itemIds = useMemo(() => {
    const ids = new Set<string>();
    for (const { recipe } of allRecipes) {
      ids.add(recipe.outputItemId);
      for (const ing of recipe.ingredients) ids.add(ing.itemId);
    }
    return [...ids];
  }, [allRecipes]);

  const { prices, loading, error, refresh } = useMarketPrices(
    provider,
    itemIds,
    cities,
    1,
    "refining-optimizer"
  );

  const priceMap = useMemo(() => {
    const map = new Map<string, Map<City, number>>();
    for (const p of prices) {
      if (p.sellPriceMin <= 0) continue;
      let byCity = map.get(p.itemId);
      if (!byCity) {
        byCity = new Map();
        map.set(p.itemId, byCity);
      }
      byCity.set(p.city, p.sellPriceMin);
    }
    return map;
  }, [prices]);

  const rows: RecipeRow[] = useMemo(() => {
    const out: RecipeRow[] = [];
    for (const { group, recipe } of allRecipes) {
      for (const city of cities) {
        const outPrice = priceMap.get(recipe.outputItemId)?.get(city) ?? 0;
        const missing =
          outPrice <= 0 ||
          recipe.ingredients.some(
            (ing) => (priceMap.get(ing.itemId)?.get(city) ?? 0) <= 0
          );
        const hasBonus = city === group.bonusCity;
        const rrr = resourceReturnRate({
          kind: "refining",
          hasCitySpecialty: hasBonus,
          useFocus,
          dailyBonus: 0,
        });
        const materialBase = recipe.ingredients.reduce((sum, ing) => {
          const price = priceMap.get(ing.itemId)?.get(city) ?? 0;
          return sum + price * ing.quantity;
        }, 0);
        const materialCost = materialBase * quantity * (1 - rrr);
        const fee = refineFeePerUnit(usageFee, recipe.tier, 0) * quantity;
        const revenue = sellOrderRevenue(outPrice, premium) * quantity;
        const profit = missing ? 0 : revenue - materialCost - fee;
        const totalCost = materialCost + fee;
        out.push({
          group,
          recipe,
          city,
          rrr,
          materialCost,
          fee,
          revenue,
          profit,
          roi: totalCost > 0 ? (profit / totalCost) * 100 : 0,
          missing,
        });
      }
    }
    return out.filter((r) => !r.missing).sort((a, b) => b.profit - a.profit);
  }, [allRecipes, cities, priceMap, useFocus, premium, usageFee, quantity]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (groupFilter !== "all" && r.group.id !== groupFilter) return false;
        if (tier > 0 && r.recipe.tier !== tier) return false;
        if (enchant >= 0 && r.recipe.enchant !== enchant) return false;
        return true;
      }),
    [rows, groupFilter, tier, enchant]
  );

  const top = filtered[0] ?? null;

  const move: MarketOpportunity | null = useMemo(() => {
    if (!top) return null;
    return {
      id: `${top.recipe.outputItemId}|${top.city}`,
      activity: "Refinado",
      title: itemName(top.recipe.outputItemId),
      detail: `Refinar ${top.group.label.toLowerCase()} en ${top.city}${
        top.city === top.group.bonusCity ? " (bonus)" : ""
      }`,
      city: top.city,
      capital: Math.round(top.materialCost + top.fee),
      profit: top.profit,
      roi: top.roi,
      risk: top.roi > 25 ? "MEDIUM" : "LOW",
    };
  }, [top]);

  return (
    <div className="space-y-4">
      <BestMoveNow move={move} loading={loading} error={error} />

      <div className="grid gap-x-4 gap-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4 sm:grid-cols-4">
        <SelectField
          label="Tipo de recurso"
          value={groupFilter}
          onChange={setGroupFilter}
          options={[
            { value: "all", label: "Todos" },
            ...RESOURCE_GROUPS.map((g) => ({ value: g.id, label: g.label })),
          ]}
        />
        <SelectField
          label="Tier"
          value={tier}
          onChange={setTier}
          options={[
            { value: 0, label: "Todos" },
            ...REFINE_TIERS.map((t) => ({ value: t, label: `T${t}` })),
          ]}
        />
        <SelectField
          label="Enchant"
          value={enchant}
          onChange={setEnchant}
          options={[
            { value: -1, label: "Todos" },
            ...REFINE_ENCHANTS.map((e) => ({
              value: e,
              label: ENCHANT_LABELS[e],
            })),
          ]}
        />
        <NumberField
          label="Cantidad (lingotes/lotes)"
          value={quantity}
          onChange={setQuantity}
          min={1}
        />
        <NumberField
          label="Tarifa de estación (/100 nutrición)"
          value={usageFee}
          onChange={setUsageFee}
          min={0}
          step={100}
        />
        <div className="flex flex-wrap items-end gap-6">
          <Checkbox
            label="Focus (+59 %)"
            checked={useFocus}
            onChange={setUseFocus}
          />
          <Checkbox
            label="Premium"
            checked={premium}
            onChange={setPremium}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={refresh}
            disabled={loading}
            className="w-full rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
          >
            Actualizar
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-[var(--color-text-dim)]">
          Consultando {itemIds.length} materiales en {cities.length} ciudades…
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <Table
          headers={[
            "Producto",
            "Receta",
            "Ciudad",
            "Coste",
            "Ingresos",
            "Ganancia",
            "ROI",
          ]}
        >
          {filtered.slice(0, 25).map((r) => (
            <tr key={`${r.recipe.outputItemId}|${r.city}`} className="bg-[var(--color-panel)]">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <ItemIcon
                    itemId={r.recipe.outputItemId}
                    size={22}
                    className="shrink-0"
                  />
                  <span className="text-sm text-[var(--color-text)]">
                    {itemName(r.recipe.outputItemId)}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 text-xs text-[var(--color-text-dim)]">
                {r.recipe.ingredients
                  .map((i) => `${i.quantity}× ${itemName(i.itemId)}`)
                  .join(" + ")}
              </td>
              <td className="px-3 py-2 text-sm text-[var(--color-text)]">
                {r.city}
                {r.city === r.group.bonusCity && (
                  <span className="ml-1 text-xs text-[var(--color-gold)]">
                    (bonus)
                  </span>
                )}
              </td>
              <td className="px-3 py-2 text-right text-sm text-[var(--color-text)]">
                {formatSilver(Math.round(r.materialCost + r.fee))}
              </td>
              <td className="px-3 py-2 text-right text-sm text-[var(--color-text)]">
                {formatSilver(Math.round(r.revenue))}
              </td>
              <td
                className={`px-3 py-2 text-right text-sm font-medium ${profitClass(r.profit)}`}
              >
                <AnimatedNumber value={r.profit} format={formatSilver} />
              </td>
              <td
                className={`px-3 py-2 text-right text-sm ${profitClass(r.profit)}`}
              >
                {formatPercent(r.roi)}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-[var(--color-text-dim)]">
          Datos insuficientes: no hay recetas con precios completos que
          cumplan los filtros.
        </p>
      )}
    </div>
  );
}
