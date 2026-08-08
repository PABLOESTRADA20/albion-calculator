"use client";

import { useMemo, useState } from "react";
import type { City, PriceProvider, Quality } from "@/types/albion";
import { CITIES, QUALITIES, QUALITY_LABELS } from "@/types/albion";
import { useMarketPrices } from "@/lib/useMarketPrices";
import { buildSellFinderRows } from "@/lib/market/finders";
import { formatSilver, marketPriceOrDash } from "@/lib/calc/format";
import { ItemSearchInput } from "@/components/ItemSearchInput";
import type { SelectedItem } from "@/components/ItemSearchInput";
import { ItemIcon } from "@/components/ItemIcon";
import { Checkbox, NumberField, SelectField } from "@/components/UI";
import { HowTo } from "@/components/HowTo";
import { AnimatedPrice, BestBadge, Table } from "@/components/market/Table";

interface SellFinderProps {
  provider: PriceProvider;
}

export function SellFinder({ provider }: SellFinderProps) {
  const [item, setItem] = useState<SelectedItem | null>(null);
  const [quality, setQuality] = useState<Quality>(1);
  const [quantity, setQuantity] = useState(1);
  const [premium, setPremium] = useState(true);

  const cities: City[] = CITIES as unknown as City[];

  const { prices, loading, error, refresh } = useMarketPrices(
    provider,
    useMemo(() => (item ? [item.id] : []), [item]),
    cities,
    quality,
    "sell-finder"
  );

  const rows = useMemo(
    () => buildSellFinderRows(prices, quantity, premium),
    [prices, quantity, premium]
  );

  const summary = useMemo(() => {
    if (rows.length === 0) return null;
    const best = rows[0];
    const nets = rows.map((r) => r.net);
    const avg = nets.reduce((a, b) => a + b, 0) / nets.length;
    return { best, diffVsAvg: Math.round(best.net - avg) };
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
          "Busca un item y elige calidad y cantidad.",
          "La tabla ordena las ciudades por ingreso neto (fees descontados).",
          "La primera fila es la mejor ciudad para vender ahora mismo.",
        ]}
        notes={[
          "El neto supone vender vía orden de venta (setup + impuesto).",
          "«—» = sin órdenes de compra en esa ciudad.",
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-4">
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
        <div className="flex items-end pb-1">
          <Checkbox label="Premium" checked={premium} onChange={setPremium} />
        </div>
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
              <p className="text-xs text-[var(--color-text-dim)]">Mejor ciudad para vender · {summary!.best.city}</p>
              <p className="text-lg font-semibold text-[var(--color-gold)]">
                <AnimatedPrice value={summary!.best.net} />
                <span className="ml-1 text-xs font-normal text-[var(--color-text-dim)]">neto</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-dim)]">Precio de venta</p>
              <p className="text-sm font-medium">{formatSilver(summary!.best.price)}/u</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-dim)]">Vs. promedio</p>
              <p className="text-sm font-medium text-[var(--color-profit)]">
                +{formatSilver(summary!.diffVsAvg)}
              </p>
            </div>
            {lastUpdated && (
              <div className="ml-auto">
                <p className="text-xs text-[var(--color-text-dim)]">Actualizado</p>
                <p className="font-mono text-xs">{lastUpdated}</p>
              </div>
            )}
          </div>

          <Table headers={["Ciudad", "Precio venta", "Bruto", "Fees", "Neto", ""]}>
            {rows.map((row) => (
              <tr key={row.city} className={row.isBest ? "bg-[var(--color-gold)]/5" : ""}>
                <td className="px-3 py-2 font-medium text-[var(--color-text)]">
                  {row.city}
                  {row.isBest && <BestBadge>Mejor</BestBadge>}
                </td>
                <td className="tabular px-3 py-2">{marketPriceOrDash(row.price)}</td>
                <td className="tabular px-3 py-2">{marketPriceOrDash(row.gross)}</td>
                <td className="tabular px-3 py-2 text-[var(--color-loss)]">−{formatSilver(row.fees)}</td>
                <td className="tabular px-3 py-2 font-medium">
                  <AnimatedPrice value={row.net} />
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
          Sin órdenes de compra para este item.
        </p>
      )}
    </div>
  );
}
