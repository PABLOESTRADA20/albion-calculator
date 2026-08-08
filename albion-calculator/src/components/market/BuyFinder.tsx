"use client";

import { useMemo, useState } from "react";
import type { City, PriceProvider, Quality } from "@/types/albion";
import { CITIES, QUALITIES, QUALITY_LABELS } from "@/types/albion";
import { useMarketPrices } from "@/lib/useMarketPrices";
import { buildBuyFinderRows } from "@/lib/market/finders";
import { formatSilver, marketPriceOrDash } from "@/lib/calc/format";
import { ItemSearchInput } from "@/components/ItemSearchInput";
import type { SelectedItem } from "@/components/ItemSearchInput";
import { ItemIcon } from "@/components/ItemIcon";
import { NumberField, SelectField } from "@/components/UI";
import { HowTo } from "@/components/HowTo";
import { AnimatedPrice, BestBadge, Table } from "@/components/market/Table";

interface BuyFinderProps {
  provider: PriceProvider;
}

export function BuyFinder({ provider }: BuyFinderProps) {
  const [item, setItem] = useState<SelectedItem | null>(null);
  const [quality, setQuality] = useState<Quality>(1);
  const [quantity, setQuantity] = useState(1);

  const cities: City[] = CITIES as unknown as City[];

  const { prices, loading, error, refresh } = useMarketPrices(
    provider,
    useMemo(() => (item ? [item.id] : []), [item]),
    cities,
    quality,
    "buy-finder"
  );

  const rows = useMemo(() => buildBuyFinderRows(prices, quantity), [prices, quantity]);

  const summary = useMemo(() => {
    if (rows.length === 0) return null;
    const cheapest = rows[0];
    const pricesList = rows.map((r) => r.price);
    const avg = pricesList.reduce((a, b) => a + b, 0) / pricesList.length;
    const max = Math.max(...pricesList);
    return {
      cheapest,
      avg,
      savingsVsAvg: Math.round(avg - cheapest.price),
      savingsVsMax: max - cheapest.price,
    };
  }, [rows]);

  const lastUpdated = useMemo(() => {
    const dates = prices.map((p) => p.updatedAt).filter((d): d is string => !!d);
    if (dates.length === 0) return null;
    const max = dates.reduce((a, b) => (a > b ? a : b));
    return new Date(max).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [prices]);

  return (
    <div className="space-y-4">
      <HowTo
        title="Cómo usar"
        steps={[
          "Busca un item (ej. T5_2H_CLEAVER_HELL o «Espada tallada»).",
          "Elige calidad y cantidad.",
          "La tabla ordena las ciudades por precio total: la primera es la más barata.",
        ]}
        notes={["Los precios son del mercado actual (órdenes de venta). «—» = sin órdenes en esa ciudad."]}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <span className="mb-1 block text-xs text-[var(--color-text-dim)]">Item</span>
          <ItemSearchInput value={item} onSelect={setItem} placeholder="Buscar item..." />
        </div>
        <SelectField
          label="Calidad"
          value={quality}
          onChange={setQuality}
          options={QUALITIES.map((q) => ({ value: q, label: QUALITY_LABELS[q] }))}
        />
        <NumberField label="Cantidad" value={quantity} onChange={setQuantity} min={1} step={1} />
      </div>

      {error && (
        <p className="rounded-md border border-[var(--color-loss)]/30 bg-[var(--color-loss)]/10 px-3 py-2 text-sm text-[var(--color-loss)]">
          {error}
        </p>
      )}

      {item && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <ItemIcon itemId={item.id} size={28} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--color-text)]">{item.label}</p>
              <p className="truncate font-mono text-xs text-[var(--color-text-dim)]">{item.id}</p>
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="shrink-0 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-40"
          >
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      )}

      {loading && rows.length === 0 && (
        <p className="py-6 text-center text-sm text-[var(--color-text-dim)]">Consultando mercado...</p>
      )}

      {!loading && item && rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-[var(--color-gold-dim)]/40 bg-[var(--color-gold)]/5 px-4 py-3">
            <div>
              <p className="text-xs text-[var(--color-text-dim)]">Mejor precio · {summary!.cheapest.city}</p>
              <p className="text-lg font-semibold text-[var(--color-gold)]">
                <AnimatedPrice value={summary!.cheapest.total} />
                <span className="ml-1 text-xs font-normal text-[var(--color-text-dim)]">
                  ({formatSilver(summary!.cheapest.price)}/u)
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-dim)]">Ahorro vs. promedio</p>
              <p className="text-sm font-medium text-[var(--color-profit)]">
                +{formatSilver(summary!.savingsVsAvg)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-dim)]">Ahorro vs. más caro</p>
              <p className="text-sm font-medium text-[var(--color-profit)]">
                +{formatSilver(summary!.savingsVsMax)}
              </p>
            </div>
            {lastUpdated && (
              <div className="ml-auto">
                <p className="text-xs text-[var(--color-text-dim)]">Actualizado</p>
                <p className="font-mono text-xs">{lastUpdated}</p>
              </div>
            )}
          </div>

          <Table headers={["Ciudad", "Precio unitario", "Total", ""]}>
            {rows.map((row) => (
              <tr key={row.city} className={row.isCheapest ? "bg-[var(--color-gold)]/5" : ""}>
                <td className="px-3 py-2 font-medium text-[var(--color-text)]">
                  {row.city}
                  {row.isCheapest && (
                    <BestBadge>Mejor</BestBadge>
                  )}
                </td>
                <td className="tabular px-3 py-2">{marketPriceOrDash(row.price)}</td>
                <td className="tabular px-3 py-2 font-medium">
                  <AnimatedPrice value={row.total} />
                </td>
                <td className="px-3 py-2 text-right text-xs text-[var(--color-text-dim)]">
                  {row.updatedAt ? new Date(row.updatedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : ""}
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {!loading && item && rows.length === 0 && (
        <p className="py-6 text-center text-sm text-[var(--color-text-dim)]">
          Sin órdenes de mercado para este item.
        </p>
      )}
    </div>
  );
}
