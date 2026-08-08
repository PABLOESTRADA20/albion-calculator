import type { City, Quality } from "@/types/albion";

export interface PriceAlert {
  id: string;
  itemId: string;
  quality: Quality;
  city: City | null;
  direction: "below" | "above";
  threshold: number;
  active: boolean;
}

const STORAGE_KEY = "albion-calculator.alerts.v1";

export function loadAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as PriceAlert[];
  } catch {
    return [];
  }
}

export function saveAlerts(alerts: PriceAlert[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch {
    // localStorage puede no estar disponible (modo privado): se ignora.
  }
}

export function upsertAlert(
  alerts: PriceAlert[],
  alert: Omit<PriceAlert, "id" | "active">
): PriceAlert[] {
  const newAlert: PriceAlert = { ...alert, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, active: true };
  return [...alerts, newAlert];
}

/** Alertas disparadas por los precios actuales (sellPriceMin). */
export function evaluateAlerts(
  alerts: PriceAlert[],
  priceByItem: Map<string, number>
): PriceAlert[] {
  return alerts.filter((a) => {
    if (!a.active) return false;
    const price = priceByItem.get(a.itemId);
    if (price === undefined || price <= 0) return false;
    return a.direction === "below" ? price <= a.threshold : price >= a.threshold;
  });
}
