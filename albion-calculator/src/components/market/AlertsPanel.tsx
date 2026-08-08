"use client";

import { useEffect, useMemo, useState } from "react";
import { ItemSearchInput } from "@/components/ItemSearchInput";
import type { SelectedItem } from "@/components/ItemSearchInput";
import { ItemIcon } from "@/components/ItemIcon";
import { useMarketPrices } from "@/lib/useMarketPrices";
import {
  evaluateAlerts,
  loadAlerts,
  saveAlerts,
  upsertAlert,
} from "@/lib/alerts";
import type { PriceAlert } from "@/lib/alerts";
import { itemName } from "@/lib/builds/items";
import type { City, PriceProvider, Quality } from "@/types/albion";
import { CITIES, QUALITIES, QUALITY_LABELS } from "@/types/albion";

interface AlertsPanelProps {
  provider: PriceProvider;
}

export function AlertsPanel({ provider }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [item, setItem] = useState<SelectedItem | null>(null);
  const [quality, setQuality] = useState<Quality>(1);
  const [city, setCity] = useState<City | "all">("all");
  const [direction, setDirection] = useState<"below" | "above">("below");
  const [threshold, setThreshold] = useState("");

  useEffect(() => {
    if (loaded) return;
    // Carga local sincrona diferida a un callback asincrono
    // (patron firma/completado: el setState ocurre fuera del cuerpo del effect).
    Promise.resolve().then(() => {
      setAlerts(loadAlerts());
      setLoaded(true);
    });
  }, [loaded]);

  const itemIds = useMemo(
    () => [...new Set(alerts.map((a) => a.itemId))],
    [alerts]
  );
  const cities: City[] = useMemo(() => [...CITIES], []);

  const { prices, loading, error } = useMarketPrices(
    provider,
    itemIds,
    cities,
    1,
    "alerts"
  );

  const currentPriceByItem = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of prices) {
      const prev = map.get(p.itemId);
      if (p.sellPriceMin > 0 && (prev === undefined || p.sellPriceMin < prev)) {
        map.set(p.itemId, p.sellPriceMin);
      }
    }
    return map;
  }, [prices]);

  const triggered = useMemo(
    () =>
      evaluateAlerts(
        alerts.filter((a) => a.quality === 1),
        currentPriceByItem
      ),
    [alerts, currentPriceByItem]
  );
  const triggeredIds = useMemo(
    () => new Set(triggered.map((t) => t.id)),
    [triggered]
  );

  const addAlert = () => {
    if (!item || !threshold.trim()) return;
    const value = Number(threshold);
    if (!Number.isFinite(value) || value <= 0) return;
    const next = upsertAlert(alerts, {
      itemId: item.id,
      quality,
      city: city === "all" ? null : city,
      direction,
      threshold: Math.round(value),
    });
    setAlerts(next);
    saveAlerts(next);
    setItem(null);
    setThreshold("");
  };

  const removeAlert = (id: string) => {
    const next = alerts.filter((a) => a.id !== id);
    setAlerts(next);
    saveAlerts(next);
  };

  const toggleAlert = (id: string) => {
    const next = alerts.map((a) =>
      a.id === id ? { ...a, active: !a.active } : a
    );
    setAlerts(next);
    saveAlerts(next);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-x-4 gap-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            Item
          </p>
          <ItemSearchInput value={item} onSelect={setItem} />
        </div>
        <div className="grid grid-cols-2 gap-x-3">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
              Ciudad
            </p>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value as City | "all")}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-2 text-sm text-[var(--color-text)]"
            >
              <option value="all">Todas (la más barata)</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
              Cuando el precio esté
            </p>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as "below" | "above")}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-2 text-sm text-[var(--color-text)]"
            >
              <option value="below">por debajo de</option>
              <option value="above">por encima de</option>
            </select>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
              Umbral (silver)
            </p>
            <input
              type="number"
              min={1}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="50000"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-2 text-sm text-[var(--color-text)]"
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <button
            onClick={addAlert}
            disabled={!item || !threshold.trim()}
            className="rounded-md bg-[var(--color-gold)] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Crear alerta
          </button>
        </div>
      </div>

      {!loaded && (
        <p className="text-sm text-[var(--color-text-dim)]">Cargando alertas…</p>
      )}

      {loaded && alerts.length === 0 && (
        <p className="text-sm text-[var(--color-text-dim)]">
          No hay alertas guardadas (se guardan en tu navegador). Crea una para
          que te avise cuando un precio cruce un umbral.
        </p>
      )}

      {loaded && alerts.length > 0 && (
        <ul className="space-y-2">
          {alerts.map((a) => {
            const current = currentPriceByItem.get(a.itemId);
            const isTriggered = triggeredIds.has(a.id);
            return (
              <li
                key={a.id}
                className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 ${
                  isTriggered
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5"
                    : "border-[var(--color-border)] bg-[var(--color-panel-raised)]"
                }`}
              >
                <ItemIcon itemId={a.itemId} size={26} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--color-text)]">
                    {itemName(a.itemId)}
                    {!a.active && (
                      <span className="ml-2 text-xs text-[var(--color-text-dim)]">
                        (pausada)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--color-text-dim)]">
                    {a.city ?? "Todas las ciudades"} · {QUALITY_LABELS[a.quality]} ·{" "}
                    {a.direction === "below" ? "≤" : "≥"}{" "}
                    {a.threshold.toLocaleString("es-ES")}
                  </p>
                </div>
                <div className="text-right text-xs">
                  {a.quality !== 1 ? (
                    <p className="text-[var(--color-text-dim)]">
                      Calidad no evaluada
                    </p>
                  ) : current !== undefined ? (
                    <p className={isTriggered ? "font-medium text-[var(--color-gold)]" : "text-[var(--color-text-dim)]"}>
                      Ahora: {current.toLocaleString("es-ES")}
                    </p>
                  ) : (
                    <p className="text-[var(--color-text-dim)]">Sin precio</p>
                  )}
                  {isTriggered && <p className="font-medium text-[var(--color-gold)]">¡Alerta!</p>}
                  {loading && <p className="text-[var(--color-text-dim)]">…</p>}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => toggleAlert(a.id)}
                    className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)]"
                  >
                    {a.active ? "Pausar" : "Reanudar"}
                  </button>
                  <button
                    onClick={() => removeAlert(a.id)}
                    className="rounded-md border border-red-500/30 px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
