"use client";

import { useMemo, useState } from "react";
import type { City, PriceProvider, Quality } from "@/types/albion";
import { CITIES, QUALITIES, QUALITY_LABELS } from "@/types/albion";
import { ManualPriceProvider } from "@/lib/pricing/manualPriceProvider";
import { buyOrderCost } from "@/lib/calc/market";
import {
  formatPercent,
  formatSilver,
  marketPriceOrDash,
  profitClass,
} from "@/lib/calc/format";
import { useMarketPrices } from "@/lib/useMarketPrices";
import { ItemSearchInput } from "@/components/ItemSearchInput";
import type { SelectedItem } from "@/components/ItemSearchInput";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ManualPricesEditor } from "@/components/ManualPricesEditor";
import { HowTo } from "@/components/HowTo";
import { Checkbox, NumberField, Panel, SelectField } from "@/components/UI";

interface FlippingCalculatorProps {
  provider: PriceProvider;
}

interface CityRow {
  city: City;
  sellPriceMin: number;
  buyPriceMax: number;
  bid: number;
  fee: number;
  profit: number;
  roi: number;
  missing: boolean;
}

export function FlippingCalculator({ provider }: FlippingCalculatorProps) {
  const isManual = provider.source === "manual";
  const manualProvider = isManual ? (provider as ManualPriceProvider) : null;

  const [item, setItem] = useState<SelectedItem | null>(null);
  const [quality, setQuality] = useState<Quality>(1);
  const [premium, setPremium] = useState(true);
  const [bidPct, setBidPct] = useState(90);
  const [manualVersion, setManualVersion] = useState(0);
  const [manualCity, setManualCity] = useState<City>("Thetford");

  const cities: City[] = useMemo(
    () => (isManual ? [manualCity] : [...CITIES]),
    [isManual, manualCity]
  );
  const itemIds = useMemo(
    () => (item ? [item.id] : []),
    [item]
  );

  const { prices, loading, error, refresh } = useMarketPrices(
    provider,
    itemIds,
    cities,
    quality,
    manualVersion
  );

  const rows: CityRow[] = useMemo(() => {
    if (itemIds.length === 0) return [];
    return prices.map((p) => {
      const missing = p.sellPriceMin <= 0 || p.buyPriceMax <= 0;
      const bid = Math.max(0, Math.round((p.buyPriceMax * bidPct) / 100));
      const cost = buyOrderCost(bid, premium);
      const profit = missing ? 0 : p.buyPriceMax - cost;
      return {
        city: p.city,
        sellPriceMin: p.sellPriceMin,
        buyPriceMax: p.buyPriceMax,
        bid,
        fee: cost - bid,
        profit,
        roi: cost > 0 ? (profit / cost) * 100 : 0,
        missing,
      };
    });
  }, [prices, bidPct, premium, itemIds.length]);

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

  const manualEntries = item
    ? [{ itemId: item.id, label: item.label, quality }]
    : [];

  return (
    <Panel title="Flipping: compra por orden, vende al contado">
      <div className="space-y-4">
        <HowTo
          steps={[
            <>
              Busca el <b>item</b> y elige su <b>calidad</b>.
            </>,
            <>
              <b>Tu oferta</b> = porcentaje del precio de venta al que
              publicas tu orden de compra (ej. 90 % para que la orden se
              llene antes).
            </>,
            <>
              Lee la tabla por ciudad: <b>Comprar ahora</b> (lo que pagas al
              contado), <b>Vender ahora</b> (lo que te pagan al contado) y el{" "}
              <b>spread</b> entre ambos.
            </>,
            <>
              Estrategia: publicas una orden de compra con tu oferta y, cuando
              se llena, vendes al contado al mejor comprador de la ciudad
              (orden de compra existente). La mejor ciudad lleva ★.
            </>,
          ]}
          notes={[
            "Las comisiones (setup y de venta) ya están descontadas de la ganancia.",
            "«—» = sin órdenes de mercado para el item en esa ciudad.",
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-xs text-[var(--color-text-dim)]">
              Item
            </span>
            <ItemSearchInput
              value={item}
              onSelect={setItem}
              placeholder="Busca el item a voltear..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Calidad"
              value={quality}
              onChange={setQuality}
              options={QUALITIES.map((q) => ({
                value: q,
                label: QUALITY_LABELS[q],
              }))}
            />
            <NumberField
              label="Tu oferta (% del precio de venta)"
              value={bidPct}
              onChange={setBidPct}
              min={1}
              max={100}
              suffix="%"
            />
          </div>
        </div>

        <Checkbox
          label="Premium (comisiones reducidas)"
          checked={premium}
          onChange={setPremium}
        />

        {isManual && manualProvider && (
          <ManualPricesEditor
            provider={manualProvider}
            entries={manualEntries}
            city={manualCity}
            onCityChange={setManualCity}
            onManualChange={() => setManualVersion((v) => v + 1)}
          />
        )}

        {item && (
          <div className="mt-2 flex items-center gap-3">
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
        )}

        {item && sorted.length > 0 && (
          <div className="overflow-x-auto">
            <table className="tabular w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wider text-[var(--color-text-dim)]">
                  <th className="py-2 pr-3 font-medium">Ciudad</th>
                  <th className="py-2 pr-3 font-medium">Comprar ahora</th>
                  <th className="py-2 pr-3 font-medium">Vender ahora</th>
                  <th className="py-2 pr-3 font-medium">Spread</th>
                  <th className="py-2 pr-3 font-medium">Tu orden</th>
                  <th className="py-2 pr-3 font-medium">Fee</th>
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
                    <td className="py-1.5 pr-3">
                      {marketPriceOrDash(row.sellPriceMin)}
                    </td>
                    <td className="py-1.5 pr-3">
                      {marketPriceOrDash(row.buyPriceMax)}
                    </td>
                    <td className="py-1.5 pr-3">
                      {row.missing
                        ? "—"
                        : formatSilver(row.buyPriceMax - row.sellPriceMin)}
                    </td>
                    <td className="py-1.5 pr-3">
                      {row.missing ? "—" : formatSilver(row.bid)}
                    </td>
                    <td className="py-1.5 pr-3">
                      {row.missing ? "—" : formatSilver(row.fee)}
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
              Estrategia: publicas una orden de compra por{" "}
              {sorted[0] && !sorted[0].missing
                ? formatSilver(sorted[0].bid)
                : "—"}{" "}
              y vendes al contado a quien paga más (orden de compra
              existente). — = sin órdenes de mercado en esa ciudad.
            </p>
          </div>
        )}

        {!item && (
          <p className="text-sm text-[var(--color-text-dim)]">
            Selecciona un item para comparar ciudades.
          </p>
        )}
      </div>
    </Panel>
  );
}
