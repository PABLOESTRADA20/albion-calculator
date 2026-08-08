"use client";

import { useMemo, useState } from "react";
import { BestMoveNow } from "@/components/market/BestMoveNow";
import { Table } from "@/components/market/Table";
import { ItemIcon } from "@/components/ItemIcon";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { useMarketPrices } from "@/lib/useMarketPrices";
import { craftingRecipe } from "@/lib/calc/crafting";
import type { CraftRecipe } from "@/lib/calc/crafting";
import { resourceReturnRate } from "@/lib/calc/returnRate";
import { craftFeePerUnit } from "@/lib/calc/fees";
import { sellOrderRevenue } from "@/lib/calc/market";
import { formatPercent, formatSilver, profitClass } from "@/lib/calc/format";
import { itemCategory } from "@/lib/market/finders";
import type { MarketOpportunity } from "@/lib/market/types";
import { itemName } from "@/lib/builds/items";
import { buildItemId } from "@/lib/builds/types";
import { PVE_BUILDS } from "@/data/builds/pve";
import { PVP_BUILDS } from "@/data/builds/pvp";
import type { City, PriceProvider } from "@/types/albion";
import { CITIES } from "@/types/albion";
import { Checkbox, NumberField, SelectField } from "@/components/UI";

interface CraftingOptimizerProps {
  provider: PriceProvider;
}

interface RecipeRow {
  recipe: CraftRecipe;
  city: City;
  rrr: number;
  materialCost: number;
  fee: number;
  revenue: number;
  profit: number;
  roi: number;
  missing: boolean;
}

function outputIds(): string[] {
  const bases = new Set<string>();
  for (const b of [...PVP_BUILDS, ...PVE_BUILDS]) {
    for (const spec of b.items) {
      const family = spec.baseId;
      if (itemCategory(family) === "other") continue;
      if (craftingRecipe(family) === null) continue;
      bases.add(family);
    }
  }
  const ids = new Set<string>();
  for (const base of bases) {
    for (const tier of [4, 5, 6]) {
      for (const enchant of [0, 1]) {
        ids.add(buildItemId({ baseId: base, tier, enchant }));
      }
    }
  }
  return [...ids];
}

export function CraftingOptimizer({ provider }: CraftingOptimizerProps) {
  const [tier, setTier] = useState(0);
  const [kind, setKind] = useState("all");
  const [useFocus, setUseFocus] = useState(false);
  const [premium, setPremium] = useState(true);
  const [usageFee, setUsageFee] = useState(1000);
  const [quantity, setQuantity] = useState(1);

  const cities: City[] = useMemo(() => [...CITIES], []);

  const recipes = useMemo(() => {
    const list: CraftRecipe[] = [];
    for (const id of outputIds()) {
      const recipe = craftingRecipe(id);
      if (recipe) list.push(recipe);
    }
    return list;
  }, []);

  const itemIds = useMemo(() => {
    const ids = new Set<string>(outputIds());
    for (const r of recipes) {
      for (const ing of r.ingredients) ids.add(ing.itemId);
    }
    return [...ids];
  }, [recipes]);

  const { prices, loading, error, refresh } = useMarketPrices(
    provider,
    itemIds,
    cities,
    1,
    "crafting-optimizer"
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
    for (const recipe of recipes) {
      const output = priceMap.get(recipe.outputItemId);
      if (!output) continue;
      for (const city of cities) {
        const outPrice = output.get(city) ?? 0;
        const missing =
          outPrice <= 0 ||
          recipe.ingredients.some(
            (ing) => (priceMap.get(ing.itemId)?.get(city) ?? 0) <= 0
          );
        const rrr = resourceReturnRate({
          kind: "crafting",
          hasCitySpecialty: false,
          useFocus,
          dailyBonus: 0,
        });
        const materialBase = recipe.ingredients.reduce((sum, ing) => {
          const price = priceMap.get(ing.itemId)?.get(city) ?? 0;
          return sum + price * ing.quantity;
        }, 0);
        const materialCost = materialBase * quantity * (1 - rrr);
        const fee =
          craftFeePerUnit(
            usageFee,
            recipe.tier,
            recipe.ingredients.reduce((s, i) => s + i.quantity, 0),
            0,
            recipe.enchant
          ) * quantity;
        const revenue = sellOrderRevenue(outPrice, premium) * quantity;
        const profit = missing ? 0 : revenue - materialCost - fee;
        const totalCost = materialCost + fee;
        out.push({
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
  }, [recipes, cities, priceMap, useFocus, premium, usageFee, quantity]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const itemTier = r.recipe.tier;
        if (tier > 0 && itemTier !== tier) return false;
        if (kind !== "all" && itemCategory(r.recipe.outputItemId) !== kind)
          return false;
        return true;
      }),
    [rows, tier, kind]
  );

  const top = filtered[0] ?? null;

  const move: MarketOpportunity | null = useMemo(() => {
    if (!top) return null;
    return {
      id: `${top.recipe.outputItemId}|${top.city}`,
      activity: "Crafteo",
      title: itemName(top.recipe.outputItemId),
      detail: `Fabricar y vender en ${top.city} (${top.recipe.ingredients
        .map((i) => `${i.quantity}× ${itemName(i.itemId)}`)
        .join(" + ")})`,
      city: top.city,
      capital: Math.round(top.materialCost + top.fee),
      profit: top.profit,
      roi: top.roi,
      risk: top.roi > 25 ? "MEDIUM" : "LOW",
    };
  }, [top]);

  return (
    <div className="space-y-4">
      <HowToCrafting />
      <BestMoveNow move={move} loading={loading} error={error} />

      <div className="grid gap-x-4 gap-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4 sm:grid-cols-3">
        <SelectField
          label="Tipo de item"
          value={kind}
          onChange={setKind}
          options={[
            { value: "all", label: "Todos" },
            { value: "weapon", label: "Armas" },
            { value: "offhand", label: "Mano izquierda" },
            { value: "armor", label: "Armadura" },
          ]}
        />
        <SelectField
          label="Tier"
          value={tier}
          onChange={setTier}
          options={[
            { value: 0, label: "Todos" },
            { value: 4, label: "T4" },
            { value: 5, label: "T5" },
            { value: 6, label: "T6" },
          ]}
        />
        <NumberField
          label="Cantidad de unidades"
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
          Consultando {itemIds.length} items de crafteo en {cities.length}{" "}
          ciudades…
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <Table
          headers={[
            "Item",
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

function HowToCrafting() {
  return (
    <p className="text-xs leading-relaxed text-[var(--color-text-dim)]">
      Recetas estándar de economía:{" "}
      <b>2× recurso refinado del tier y enchant del item + 1× recurso
      refinado del tier inferior sin encantar</b>. No se modelan artefactos,
      capas de facción, pociones ni monturas. Los materiales y el producto se
      valoran en la misma ciudad; sin bonus de especialización de ciudad en el
      RRR.
    </p>
  );
}
