import type { City, Quality, ServerId } from "@/types/albion";
import { SERVERS } from "@/types/albion";

export interface PriceHistoryPoint {
  timestamp: string;
  avgPrice: number;
  count: number;
}

export interface HistoryProvider {
  readonly source: string;
  getHistory(
    itemId: string,
    city: City,
    quality: Quality
  ): Promise<PriceHistoryPoint[]>;
}

interface RawHistoryEntry {
  location: string;
  item_id: string;
  quality: number;
  data: { timestamp: string; avg_price: number; item_count: number }[];
}

const HISTORY_PATH = "/api/v2/stats/history";
const CACHE_TTL_MS = 5 * 60_000;
const MAX_RETRIES = 2;

const cache = new Map<string, { expires: number; promise: Promise<PriceHistoryPoint[]> }>();

async function fetchWithRetry(url: string): Promise<RawHistoryEntry[]> {
  let delay = 500;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url);
    if (res.ok) return (await res.json()) as RawHistoryEntry[];
    if (res.status === 429 && attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, delay));
      delay *= 3;
      continue;
    }
    throw new Error(
      res.status === 429
        ? "El servidor de datos de Albion está saturado (429). Espera unos segundos e inténtalo de nuevo."
        : `No se pudo consultar el historial (status ${res.status}). El servidor de datos de Albion puede estar caído.`
    );
  }
}

function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expires < now) cache.delete(key);
  }
}

export class ApiHistoryProvider implements HistoryProvider {
  readonly source = "api-history" as const;

  constructor(private readonly serverId: ServerId = "europe") {}

  async getHistory(
    itemId: string,
    city: City,
    quality: Quality
  ): Promise<PriceHistoryPoint[]> {
    const apiBase = SERVERS.find((s) => s.id === this.serverId)!.apiBase;
    const url = `${apiBase}${HISTORY_PATH}/${itemId}?locations=${encodeURIComponent(
      city
    )}&time-scale=1&qualities=${quality}`;

    const cached = cache.get(url);
    if (cached && cached.expires > Date.now()) return cached.promise;

    const promise = (async () => {
      const raw = await fetchWithRetry(url);
      const entry = raw.find((e) => e.location === city && e.item_id === itemId);
      if (!entry) return [];
      return entry.data
        .filter((d) => d.avg_price > 0)
        .map((d) => ({
          timestamp: d.timestamp,
          avgPrice: Math.round(d.avg_price),
          count: d.item_count,
        }));
    })();

    cache.set(url, { expires: Date.now() + CACHE_TTL_MS, promise });
    try {
      return await promise;
    } catch (err) {
      cache.delete(url);
      throw err;
    } finally {
      pruneCache();
    }
  }
}
