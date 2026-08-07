"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { City, MarketPrice, PriceProvider, Quality } from "@/types/albion";

interface UseMarketPricesResult {
  prices: MarketPrice[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Carga precios via provider. El estado de "cargando" se deriva de comparar
// la firma de la peticion actual con la ultima firma completada, asi no hay
// setState sincronico dentro del efecto (requisito del lint de React 19).
export function useMarketPrices(
  provider: PriceProvider,
  itemIds: string[],
  cities: City[],
  quality: Quality,
  refreshKey: unknown
): UseMarketPricesResult {
  const [tick, setTick] = useState(0);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completedSignature, setCompletedSignature] = useState<string | null>(
    null
  );

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Claves por CONTENIDO: si un caller crea arrays nuevos en cada render,
  // la firma no cambia mientras el contenido sea el mismo (evita bucles de
  // re-ejecucion del efecto).
  const itemIdsKey = useMemo(() => itemIds.join(","), [itemIds]);
  const citiesKey = useMemo(() => cities.join(","), [cities]);

  const signature = useMemo(
    () =>
      `${provider.source}|${itemIdsKey}|${citiesKey}|${quality}|${tick}|${String(refreshKey)}`,
    [provider.source, itemIdsKey, citiesKey, quality, tick, refreshKey]
  );

  const isEmpty = itemIds.length === 0 || cities.length === 0;
  const loading = !isEmpty && completedSignature !== signature;

  useEffect(() => {
    if (isEmpty) return;
    let cancelled = false;
    provider
      .getPrices(itemIds, cities, quality)
      .then((result) => {
        if (cancelled) return;
        setPrices(result);
        setError(null);
        setCompletedSignature(signature);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron obtener los precios."
        );
        setPrices([]);
        setCompletedSignature(signature);
      });
    return () => {
      cancelled = true;
    };
    // La firma ya codifica todo el contenido de la peticion (IDs, ciudades,
    // calidad, tick, refreshKey). Depender de itemIds/cities por identidad
    // re-ejecutaria el efecto en cada render (bucle de fetch -> rate limit).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, signature, isEmpty]);

  return {
    prices: isEmpty ? [] : prices,
    loading,
    error: isEmpty ? null : error,
    refresh,
  };
}
