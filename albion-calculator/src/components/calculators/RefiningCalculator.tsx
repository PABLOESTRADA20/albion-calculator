"use client";

import { useMemo, useState } from "react";
import type { City, PriceProvider } from "@/types/albion";
import { CITIES } from "@/types/albion";
import { ManualPriceProvider } from "@/lib/pricing/manualPriceProvider";
import {
  ENCHANT_LABELS,
  REFINE_ENCHANTS,
  RESOURCE_GROUPS,
  REFINE_TIERS,
  refineRecipe,
} from "@/lib/calc/refining";
import type { ResourceGroup } from "@/lib/calc/refining";
import { resourceReturnRate } from "@/lib/calc/returnRate";
import { refineFeePerUnit } from "@/lib/calc/fees";
import { sellOrderRevenue } from "@/lib/calc/market";
import {
  formatPercent,
  formatSilver,
  profitClass,
} from "@/lib/calc/format";
import { useMarketPrices } from "@/lib/useMarketPrices";
import { ManualPricesEditor } from "@/components/ManualPricesEditor";
import { ItemIcon } from "@/components/ItemIcon";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { HowTo } from "@/components/HowTo";
import {
  Checkbox,
  NumberField,
  Panel,
  SelectField,
} from "@/components/UI";

interface RefiningCalculatorProps {
  provider: PriceProvider;
}

interface CityRow {
  city: City;
  rrr: number;
  materialCost: number;
  fee: number;
  revenue: number;
  profit: number;
  roi: number;
  missing: boolean;
}

export function RefiningCalculator({ provider }: RefiningCalculatorProps) {
  const isManual = provider.source === "manual";
  const manualProvider = isManual ? (provider as ManualPriceProvider) : null;

  const [group, setGroup] = useState<ResourceGroup>(RESOURCE_GROUPS[0]);
  const [tier, setTier] = useState(5);
  const [enchant, setEnchant] = useState(0);
  const [quantity, setQuantity] = useState(100);
  const [useFocus, setUseFocus] = useState(false);
  const [dailyBonus, setDailyBonus] = useState<0 | 10 | 20>(0);
  const [usageFee, setUsageFee] = useState(1000);
  const [premium, setPremium] = useState(true);
  const [manualVersion, setManualVersion] = useState(0);
  const [manualCity, setManualCity] = useState<City>("Thetford");

  const enchantDisabled = tier === 2 || group.id === "stone";
  const effectiveEnchant = enchantDisabled ? 0 : enchant;

  const recipe = useMemo(
    () => refineRecipe(group, tier, effectiveEnchant),
    [group, tier, effectiveEnchant]
  );
  const itemIds = useMemo(
    () => [recipe.outputItemId, ...recipe.ingredients.map((i) => i.itemId)],
    [recipe]
  );
  const cities: City[] = useMemo(
    () => (isManual ? [manualCity] : [...CITIES]),
    [isManual, manualCity]
  );

  const { prices, loading, error, refresh } = useMarketPrices(
    provider,
    itemIds,
    cities,
    1,
    manualVersion
  );

  const priceMap = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const p of prices) {
      if (!map.has(p.itemId)) map.set(p.itemId, new Map());
      map.get(p.itemId)!.set(p.city, p.sellPriceMin);
    }
    return map;
  }, [prices]);

  const rows: CityRow[] = useMemo(() => {
    if (itemIds.length === 0) return [];
    return cities.map((city) => {
      const hasBonus = city === group.bonusCity;
      const rrr = resourceReturnRate({
        kind: "refining",
        hasCitySpecialty: hasBonus,
        useFocus,
        dailyBonus,
      });
      const materialCost = recipe.ingredients.reduce((sum, ing) => {
        const price = priceMap.get(ing.itemId)?.get(city) ?? 0;
        return sum + price * ing.quantity;
      }, 0);
      const outPrice = priceMap.get(recipe.outputItemId)?.get(city) ?? 0;
      const missing =
        outPrice <= 0 ||
        recipe.ingredients.some(
          (ing) => (priceMap.get(ing.itemId)?.get(city) ?? 0) <= 0
        );
      const costAfterReturn = materialCost * quantity * (1 - rrr);
      const fee =
        refineFeePerUnit(usageFee, tier, effectiveEnchant) * quantity;
      const revenue = sellOrderRevenue(outPrice, premium) * quantity;
      const profit = missing ? 0 : revenue - costAfterReturn - fee;
      const totalCost = costAfterReturn + fee;
      return {
        city,
        rrr,
        materialCost: costAfterReturn,
        fee,
        revenue,
        profit,
        roi: totalCost > 0 ? (profit / totalCost) * 100 : 0,
        missing,
      };
    });
  }, [
    cities,
    group,
    useFocus,
    dailyBonus,
    recipe,
    priceMap,
    quantity,
    usageFee,
    tier,
    premium,
    effectiveEnchant,
    itemIds.length,
  ]);

  const sorted = useMemo(
    () =>
      [...rows].sort(
        (a, b) =>
          (b.missing ? -Infinity : b.profit) -
          (a.missing ? -Infinity : a.profit)
      ),
    [rows]
  );
  const bestCity = sorted.length > 0 ? sorted[0].city : null;

  const manualEntries = [
    { itemId: recipe.outputItemId, label: recipe.outputItemId, quality: 1 as const },
    ...recipe.ingredients.map((ing) => ({
      itemId: ing.itemId,
      label: ing.label,
      quality: 1 as const,
    })),
  ];

  return (
    <Panel title="Refinado: materia prima a material refinado">
      <div className="space-y-4">
        <HowTo
          steps={[
            <>
              Elige el <b>tipo de recurso</b> (mineral, fibra, piel, madera o
              piedra), su <b>tier</b> y el <b>enchant</b> del producto que
              quieres refinar.
            </>,
            <>
              Introduce la <b>cantidad</b> de lingotes/lotes y la{" "}
              <b>tarifa de estación</b> que cobra el dueño de la estación por
              100 de nutrición (se ve al abrir la ventana de refinado en el
              juego).
            </>,
            <>
              Marca <b>focus</b>, <b>bonus diario</b> y <b>premium</b> si se
              aplican: suben el retorno de recursos (RRR) y/o bajan el
              impuesto de venta.
            </>,
            <>
              La <b>receta</b> (materiales → producto) y la ciudad con bonus
              se muestran al momento. La tabla compara todas las ciudades:
              la mejor con ★.
            </>,
          ]}
          notes={[
            "RRR = porcentaje de materiales que recuperas al refinar.",
            "«—» = sin órdenes de mercado para ese material en esa ciudad.",
            "La piedra no se puede encantar; el T2 no tiene variantes encantadas.",
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Tipo de recurso"
            value={group.id}
            onChange={(id) => {
              const next = RESOURCE_GROUPS.find((g) => g.id === id)!;
              setGroup(next);
              setTier(5);
              if (isManual) setManualCity(next.bonusCity as City);
            }}
            options={RESOURCE_GROUPS.map((g) => ({
              value: g.id,
              label: g.label,
            }))}
          />
          <SelectField
            label="Tier"
            value={tier}
            onChange={setTier}
            options={REFINE_TIERS.map((t) => ({ value: t, label: `T${t}` }))}
          />
          <SelectField
            label="Enchant"
            value={effectiveEnchant}
            onChange={setEnchant}
            disabled={enchantDisabled}
            options={REFINE_ENCHANTS.map((e) => ({
              value: e,
              label: ENCHANT_LABELS[e],
            }))}
          />
          <NumberField
            label="Cantidad (lingotes/lotes)"
            value={quantity}
            onChange={setQuantity}
            min={1}
          />
        </div>

        {group.id === "stone" && (
          <p className="text-xs text-[var(--color-text-dim)]">
            La piedra no tiene variantes encantadas: las rocas encantadas
            multiplican la cantidad de bloques de entrada y salida (×2/×4/×8),
            mecánica que no se modela aquí.
          </p>
        )}
        {tier === 2 && (
          <p className="text-xs text-[var(--color-text-dim)]">
            El T2 no tiene variantes encantadas.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Tarifa de estación (silver / 100 nutrición)"
            value={usageFee}
            onChange={setUsageFee}
            min={0}
            step={100}
          />
          <SelectField
            label="Bonus diario de actividades"
            value={dailyBonus}
            onChange={setDailyBonus}
            options={[
              { value: 0, label: "Sin bonus" },
              { value: 10, label: "+10 %" },
              { value: 20, label: "+20 %" },
            ]}
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <Checkbox
            label="Usar focus (+59 % de bonus)"
            checked={useFocus}
            onChange={setUseFocus}
          />
          <Checkbox
            label="Premium (menos impuesto de venta)"
            checked={premium}
            onChange={setPremium}
          />
        </div>

        <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-2 text-sm text-[var(--color-text-dim)]">
          <ItemIcon itemId={recipe.outputItemId} size={24} />
          <span>
            Receta:{" "}
            {recipe.ingredients
              .map((ing) => `${ing.quantity}× ${ing.itemId}`)
              .join(" + ")}{" "}
            → {recipe.outputItemId}. Ciudad con bonus de refinado:{" "}
            <span className="text-[var(--color-gold)]">{group.bonusCity}</span>.
          </span>
        </div>

        {isManual && manualProvider && (
          <ManualPricesEditor
            provider={manualProvider}
            entries={manualEntries}
            city={manualCity}
            onCityChange={setManualCity}
            onManualChange={() => setManualVersion((v) => v + 1)}
          />
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-text-dim)] hover:text-[var(--color-text)]"
          >
            Actualizar precios
          </button>
          {loading && (
            <span className="text-xs text-[var(--color-text-dim)]">
              Consultando el mercado...
            </span>
          )}
          {error && (
            <span className="text-xs text-[var(--color-loss)]">{error}</span>
          )}
        </div>

        {sorted.length > 0 && (
          <div className="overflow-x-auto">
            <table className="tabular w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wider text-[var(--color-text-dim)]">
                  <th className="py-2 pr-3 font-medium">Ciudad</th>
                  <th className="py-2 pr-3 font-medium">RRR</th>
                  <th className="py-2 pr-3 font-medium">Materiales</th>
                  <th className="py-2 pr-3 font-medium">Tarifa</th>
                  <th className="py-2 pr-3 font-medium">Ingresos</th>
                  <th className="py-2 pr-3 text-right font-medium">Ganancia</th>
                  <th className="py-2 pr-3 text-right font-medium">ROI</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr
                    key={row.city}
                    className={
                      row.city === bestCity && row.profit > 0
                        ? "bg-[var(--color-gold)]/5"
                        : ""
                    }
                  >
                    <td className="py-1.5 pr-3 text-[var(--color-text)]">
                      {row.city}
                      {row.city === group.bonusCity && (
                        <span className="ml-1 text-xs text-[var(--color-gold)]">
                          (bonus)
                        </span>
                      )}
                      {row.city === bestCity && row.profit > 0 && " ★"}
                    </td>
                    <td className="py-1.5 pr-3">{formatPercent(row.rrr * 100)}</td>
                    <td className="py-1.5 pr-3">
                      {row.missing
                        ? "—"
                        : formatSilver(row.materialCost)}
                    </td>
                    <td className="py-1.5 pr-3">{formatSilver(row.fee)}</td>
                    <td className="py-1.5 pr-3">
                      {row.missing ? "—" : formatSilver(row.revenue)}
                    </td>
                    <td
                      className={`py-1.5 pr-3 text-right font-medium ${profitClass(row.missing ? 0 : row.profit)}`}
                    >
                      {row.missing ? (
                        "—"
                      ) : (
                        <AnimatedNumber
                          value={row.profit}
                          format={formatSilver}
                        />
                      )}
                    </td>
                    <td
                      className={`py-1.5 pr-3 text-right ${profitClass(row.missing ? 0 : row.profit)}`}
                    >
                      {row.missing ? "—" : formatPercent(row.roi)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-[var(--color-text-dim)]">
              RRR = retorno de recursos. Los materiales y el producto se
              valoran en la misma ciudad (compras y vendes ahí). Con{" "}
              {useFocus ? "focus" : "sin focus"}:{" "}
              {formatPercent(sorted[0]?.rrr * 100)} en{" "}
              {sorted[0]?.city === group.bonusCity
                ? "ciudad con bonus"
                : "ciudad sin bonus"}. — = sin órdenes de mercado en esa
              ciudad.
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}
