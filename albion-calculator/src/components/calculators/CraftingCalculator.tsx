"use client";

import { useMemo, useState } from "react";
import type { City, PriceProvider, Quality } from "@/types/albion";
import { CITIES, QUALITIES, QUALITY_LABELS } from "@/types/albion";
import { ManualPriceProvider } from "@/lib/pricing/manualPriceProvider";
import { resourceReturnRate } from "@/lib/calc/returnRate";
import { craftFeePerUnit } from "@/lib/calc/fees";
import { sellOrderRevenue } from "@/lib/calc/market";
import { formatPercent, formatSilver, profitClass } from "@/lib/calc/format";
import { useMarketPrices } from "@/lib/useMarketPrices";
import { ItemSearchInput } from "@/components/ItemSearchInput";
import type { SelectedItem } from "@/components/ItemSearchInput";
import { ItemIcon } from "@/components/ItemIcon";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ManualPricesEditor } from "@/components/ManualPricesEditor";
import { HowTo } from "@/components/HowTo";
import {
  Checkbox,
  NumberField,
  Panel,
  SelectField,
} from "@/components/UI";

interface CraftingCalculatorProps {
  provider: PriceProvider;
}

interface MaterialRow {
  item: SelectedItem | null;
  quantity: number;
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

interface ParsedOutput {
  tier: number | null;
  enchant: number;
}

function parseOutput(itemId: string): ParsedOutput {
  const tierMatch = itemId.match(/^T(\d+)/);
  const enchantMatch = itemId.match(/@(\d+)$/);
  return {
    tier: tierMatch ? Number(tierMatch[1]) : null,
    enchant: enchantMatch ? Number(enchantMatch[1]) : 0,
  };
}

export function CraftingCalculator({ provider }: CraftingCalculatorProps) {
  const isManual = provider.source === "manual";
  const manualProvider = isManual ? (provider as ManualPriceProvider) : null;

  const [output, setOutput] = useState<SelectedItem | null>(null);
  const [outputQuality, setOutputQuality] = useState<Quality>(1);
  const [quantity, setQuantity] = useState(1);
  const [materials, setMaterials] = useState<MaterialRow[]>([
    { item: null, quantity: 1 },
    { item: null, quantity: 1 },
  ]);
  const [artifactTier, setArtifactTier] = useState(0);
  const [usageFee, setUsageFee] = useState(1000);
  const [cityBonus, setCityBonus] = useState(false);
  const [useFocus, setUseFocus] = useState(false);
  const [dailyBonus, setDailyBonus] = useState<0 | 10 | 20>(0);
  const [premium, setPremium] = useState(true);
  const [manualVersion, setManualVersion] = useState(0);
  const [manualCity, setManualCity] = useState<City>("Thetford");

  const parsed: ParsedOutput = useMemo(
    () => parseOutput(output?.id ?? ""),
    [output]
  );

  const materialItemIds = useMemo(
    () =>
      materials
        .filter((m) => m.item)
        .map((m) => m.item!.id),
    [materials]
  );
  const materialCount = useMemo(
    () =>
      materials.reduce(
        (sum, m) => sum + (m.item ? Math.max(1, m.quantity) : 0),
        0
      ),
    [materials]
  );
  const itemIds = useMemo(() => [...materialItemIds], [materialItemIds]);
  const outputItemIds = useMemo(
    () => (output ? [output.id] : []),
    [output]
  );

  const cities: City[] = useMemo(
    () => (isManual ? [manualCity] : [...CITIES]),
    [isManual, manualCity]
  );

  const materialsState = useMarketPrices(
    provider,
    itemIds,
    cities,
    1,
    manualVersion
  );
  const outputState = useMarketPrices(
    provider,
    outputItemIds,
    cities,
    outputQuality,
    manualVersion
  );
  const loading = materialsState.loading || outputState.loading;
  const error = materialsState.error ?? outputState.error;
  const refresh = () => {
    materialsState.refresh();
    outputState.refresh();
  };

  const materialPriceMap = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const p of materialsState.prices) {
      if (!map.has(p.itemId)) map.set(p.itemId, new Map());
      map.get(p.itemId)!.set(p.city, p.sellPriceMin);
    }
    return map;
  }, [materialsState.prices]);

  const outputPriceMap = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const p of outputState.prices) {
      if (!map.has(p.itemId)) map.set(p.itemId, new Map());
      map.get(p.itemId)!.set(p.city, p.sellPriceMin);
    }
    return map;
  }, [outputState.prices]);

  const rows: CityRow[] = useMemo(() => {
    if (!output || materialItemIds.length === 0 || parsed.tier === null)
      return [];
    const { tier, enchant } = parsed;
    return cities.map((city) => {
      const rrr = resourceReturnRate({
        kind: "crafting",
        hasCitySpecialty: cityBonus,
        useFocus,
        dailyBonus,
      });
      const materialCost = materialItemIds.reduce((sum, id) => {
        const qty = materials.find((m) => m.item?.id === id)?.quantity ?? 1;
        const price = materialPriceMap.get(id)?.get(city) ?? 0;
        return sum + price * Math.max(1, qty);
      }, 0);
      const outPrice = outputPriceMap.get(output.id)?.get(city) ?? 0;
      const missing =
        outPrice <= 0 ||
        materialItemIds.some(
          (id) => (materialPriceMap.get(id)?.get(city) ?? 0) <= 0
        );
      const costAfterReturn = materialCost * quantity * (1 - rrr);
      const fee = craftFeePerUnit(usageFee, tier, materialCount, artifactTier, enchant) * quantity;
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
    output,
    parsed,
    cityBonus,
    useFocus,
    dailyBonus,
    materialItemIds,
    materials,
    materialPriceMap,
    outputPriceMap,
    quantity,
    usageFee,
    materialCount,
    artifactTier,
    premium,
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

  const updateMaterial = (
    index: number,
    patch: Partial<MaterialRow>
  ) => {
    setMaterials((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...patch } : m))
    );
  };

  const manualEntries = [
    ...(output
      ? [{ itemId: output.id, label: output.label, quality: outputQuality }]
      : []),
    ...materials
      .filter((m) => m.item)
      .map((m) => ({
        itemId: m.item!.id,
        label: m.item!.label,
        quality: 1 as Quality,
      })),
  ];

  return (
    <Panel title="Crafteo: materiales a item">
      <div className="space-y-4">
        <HowTo
          steps={[
            <>
              Busca el <b>item a craftear</b> y elige su <b>calidad</b> y{" "}
              <b>cantidad</b>.
            </>,
            <>
              Añade los <b>materiales</b> con sus cantidades (se valoran al
              precio de compra inmediata de cada ciudad).
            </>,
            <>
              Ajusta la <b>tarifa de estación</b> (lo que cobra el dueño por
              100 de nutrición), el <b>tipo de artefacto</b> si el item lo
              requiere (Runa/Alma/Reliquia/Avaloniano) y los modificadores:
              <b> focus</b>, <b>bonus diario</b>, <b>ciudad especializada</b>{" "}
              y <b>premium</b>.
            </>,
            <>
              Lee la tabla: RRR, coste de materiales (ya con devolución),
              tarifa, ingresos (impuestos descontados), ganancia y ROI por
              ciudad. La mejor ciudad lleva ★.
            </>,
          ]}
          notes={[
            "Los items encantados (.1-.4) se buscan con su nombre y el tier se deduce del id.",
            "«—» = sin órdenes de mercado para algún material o el item en esa ciudad.",
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-xs text-[var(--color-text-dim)]">
              Item a craftear
            </span>
            <ItemSearchInput
              value={output}
              onSelect={setOutput}
              placeholder="Busca el item que quieres craftear..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Calidad del item"
              value={outputQuality}
              onChange={setOutputQuality}
              options={QUALITIES.map((q) => ({
                value: q,
                label: QUALITY_LABELS[q],
              }))}
            />
            <NumberField
              label="Cantidad a craftear"
              value={quantity}
              onChange={setQuantity}
              min={1}
            />
          </div>
        </div>

        {output && (
          <p className="flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
            <ItemIcon itemId={output.id} quality={outputQuality} size={20} />
            <span>
              Tarifa de crafteo estimada con tier {parsed.tier}
              {parsed.enchant > 0 ? ` y enchant ${parsed.enchant}` : ""}
              {parsed.tier === null && " (no reconocido)"}.
            </span>
          </p>
        )}

        <div>
          <span className="mb-1 block text-xs text-[var(--color-text-dim)]">
            Materiales
          </span>
          <div className="space-y-2">
            {materials.map((row, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <ItemSearchInput
                    value={row.item}
                    onSelect={(item) => updateMaterial(index, { item })}
                    placeholder={`Material ${index + 1}...`}
                  />
                </div>
                <div className="w-28 shrink-0">
                  <NumberField
                    label="Cantidad"
                    value={row.quantity}
                    onChange={(quantity) => updateMaterial(index, { quantity })}
                    min={1}
                  />
                </div>
                <button
                  onClick={() =>
                    setMaterials((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                  disabled={materials.length <= 1}
                  className="mt-6 shrink-0 rounded px-2 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-loss)] disabled:opacity-30"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              setMaterials((prev) => [...prev, { item: null, quantity: 1 }])
            }
            className="mt-2 rounded-md border border-dashed border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-text-dim)] hover:text-[var(--color-text)]"
          >
            + Añadir material
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Tarifa de estación (silver / 100 nutrición)"
            value={usageFee}
            onChange={setUsageFee}
            min={0}
            step={100}
          />
          <SelectField
            label="Tipo de artefacto"
            value={artifactTier}
            onChange={setArtifactTier}
            options={[
              { value: 0, label: "Sin artefacto" },
              { value: 1, label: "Runa" },
              { value: 2, label: "Alma" },
              { value: 3, label: "Reliquia" },
              { value: 4, label: "Avaloniano" },
            ]}
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
            label="Ciudad especializada en tu item (+15 %)"
            checked={cityBonus}
            onChange={setCityBonus}
          />
          <Checkbox
            label="Premium (menos impuesto de venta)"
            checked={premium}
            onChange={setPremium}
          />
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
                      {row.city === bestCity && row.profit > 0 && " ★"}
                    </td>
                    <td className="py-1.5 pr-3">{formatPercent(row.rrr * 100)}</td>
                    <td className="py-1.5 pr-3">
                      {row.missing ? "—" : formatSilver(row.materialCost)}
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
              Los materiales se valoran al precio de compra inmediata en cada
              ciudad; el item se vende por orden de venta (impuestos aplicados).
              RRR calculado con{" "}
              {cityBonus ? "bonus de ciudad (+15 %)" : "bonus base (+18 %)"}
              {useFocus ? " + focus (+59 %)" : ""}
              {dailyBonus > 0 ? ` + bonus diario (+${dailyBonus} %)` : ""}. — =
              sin órdenes de mercado en esa ciudad.
            </p>
          </div>
        )}

        {!output && (
          <p className="text-sm text-[var(--color-text-dim)]">
            Selecciona el item a craftear y sus materiales para comparar
            ciudades.
          </p>
        )}
      </div>
    </Panel>
  );
}
