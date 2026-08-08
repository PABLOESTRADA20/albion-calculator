"use client";

import { useEffect, useState } from "react";
import type { City, Quality } from "@/types/albion";
import type { HistoryProvider, PriceHistoryPoint } from "@/lib/history/historyProvider";

interface UsePriceHistoryResult {
  points: PriceHistoryPoint[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Carga del historial de precios de un item en una ciudad (patron firma/completado).
export function usePriceHistory(
  provider: HistoryProvider,
  itemId: string | null,
  city: City,
  quality: Quality,
  refreshKey: unknown
): UsePriceHistoryResult {
  const [tick, setTick] = useState(0);
  const [points, setPoints] = useState<PriceHistoryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completedSignature, setCompletedSignature] = useState<string | null>(
    null
  );

  const refresh = () => setTick((t) => t + 1);

  const signature = `${provider.source}|${itemId}|${city}|${quality}|${tick}|${String(refreshKey)}`;
  const isEmpty = !itemId;
  const loading = !isEmpty && completedSignature !== signature;

  useEffect(() => {
    if (isEmpty) return;
    let cancelled = false;
    provider
      .getHistory(itemId!, city, quality)
      .then((result) => {
        if (cancelled) return;
        setPoints(result);
        setError(null);
        setCompletedSignature(signature);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo obtener el historial de precios."
        );
        setPoints([]);
        setCompletedSignature(signature);
      });
    return () => {
      cancelled = true;
    };
    // La firma codifica todo el contenido de la peticion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, signature, isEmpty]);

  return { points: isEmpty ? [] : points, loading, error, refresh };
}
