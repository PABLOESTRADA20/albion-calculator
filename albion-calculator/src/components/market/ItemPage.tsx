"use client";

import { useMemo, useState } from "react";
import { ItemSearchInput } from "@/components/ItemSearchInput";
import type { SelectedItem } from "@/components/ItemSearchInput";
import { ItemIcon } from "@/components/ItemIcon";
import { Table } from "@/components/market/Table";
import { AnimatedPrice } from "@/components/market/Table";
import { PriceHistoryChart } from "@/components/market/PriceHistoryChart";
import { useMarketPrices } from "@/lib/useMarketPrices";
import { usePriceHistory } from "@/lib/history/usePriceHistory";
import { buildCityPriceRows } from "@/lib/market/finders";
import type { HistoryProvider } from "@/lib/history/historyProvider";
import type { City, PriceProvider, Quality } from "@/types/albion";
import { CITIES, QUALITIES, QUALITY_LABELS } from "@/types/albion";

interface ItemPageProps {
  priceProvider: PriceProvider;
  historyProvider: HistoryProvider;
}

export function ItemPage({ priceProvider, historyProvider }: ItemPageProps) {
  const [item, setItem] = useState<SelectedItem | null>(null);
  const [quality, setQuality] = useState<Quality>(1);
  const [historyCity, setHistoryCity] = useState<City>("Thetford");

  const cities: City[] = useMemo(() => [...CITIES], []);
  const itemIds = useMemo(() => (item ? [item.id] : []), [item]);

  const { prices, loading, error, refresh } = useMarketPrices(
    priceProvider,
    itemIds,
    cities,
    quality,
    "item-page"
  );

  const rows = useMemo(() => buildCityPriceRows(prices), [prices]);

  const { points, loading: historyLoading, error: historyError } = usePriceHistory(
    historyProvider,
    item?.id ?? null,
    historyCity,
    quality,
    "item-page-history"
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-x-4 gap-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            Item
          </p>
          <ItemSearchInput value={item} onSelect={setItem} />
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            Calidad
          </p>
          <select
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value) as Quality)}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-2 text-sm text-[var(--color-text)]"
          >
            {QUALITIES.map((q) => (
              <option key={q} value={q}>
                {QUALITY_LABELS[q]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!item && (
        <p className="text-sm text-[var(--color-text-dim)]">
          Busca un item para ver precios por ciudad y su historial.
        </p>
      )}

      {item && (
        <>
          <div className="flex items-center gap-3">
            <ItemIcon itemId={item.id} size={36} />
            <div>
              <p className="text-base font-semibold text-[var(--color-text)]">
                {item.label}
              </p>
              <p className="text-xs text-[var(--color-text-dim)]">
                {item.id}
              </p>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="ml-auto rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
            >
              Actualizar
            </button>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {loading && (
            <p className="text-sm text-[var(--color-text-dim)]">
              Consultando precios…
            </p>
          )}

          {!loading && !error && rows.length > 0 && (
            <Table headers={["Ciudad", "Comprar ahora", "Vender ahora", "Actualizado"]}>
              {rows.map((r) => (
                <tr key={r.city} className="bg-[var(--color-panel)]">
                  <td className="px-3 py-2 text-sm text-[var(--color-text)]">
                    {r.city}
                  </td>
                  <td className="px-3 py-2 text-right text-sm text-[var(--color-text)]">
                    {r.buyPrice > 0 ? <AnimatedPrice value={r.buyPrice} /> : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-sm text-[var(--color-text)]">
                    {r.sellPrice > 0 ? <AnimatedPrice value={r.sellPrice} /> : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-xs text-[var(--color-text-dim)]">
                    {r.updatedAt ? r.updatedAt.slice(0, 16).replace("T", " ") : "—"}
                  </td>
                </tr>
              ))}
            </Table>
          )}

          {!loading && !error && rows.length === 0 && (
            <p className="text-sm text-[var(--color-text-dim)]">
              Datos insuficientes: no hay precios para este item en la calidad
              seleccionada.
            </p>
          )}

          <div className="grid gap-x-4 gap-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
                Historial en ciudad
              </p>
              <select
                value={historyCity}
                onChange={(e) => setHistoryCity(e.target.value as City)}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-2 text-sm text-[var(--color-text)]"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <p className="pb-2 text-xs text-[var(--color-text-dim)]">
                Precio medio horario de la última semana (fuente oficial de
                Albion).
              </p>
            </div>
          </div>

          {historyError && <p className="text-sm text-red-400">{historyError}</p>}
          {historyLoading && (
            <p className="text-sm text-[var(--color-text-dim)]">
              Cargando historial…
            </p>
          )}
          {!historyLoading && !historyError && (
            <PriceHistoryChart points={points} />
          )}
        </>
      )}
    </div>
  );
}
