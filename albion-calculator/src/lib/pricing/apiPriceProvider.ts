import type {
  City,
  MarketPrice,
  PriceProvider,
  Quality,
  ServerId,
} from "@/types/albion";
import { SERVERS } from "@/types/albion";

const PRICES_PATH = "/api/v2/stats/prices";
const CACHE_TTL_MS = 60_000;
const MAX_RETRIES = 2;
const CHUNK_SIZE = 60;

interface RawPriceEntry {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  buy_price_max: number;
  sell_price_min_date: string;
}

// Caché por URL a nivel de módulo: deduplica peticiones en vuelo (StrictMode,
// remontajes al cambiar de pestaña) y evita reconsultar el mismo item dentro
// de la ventana TTL. Las entradas fallidas se eliminan para poder reintentar.
const cache = new Map<
  string,
  { expires: number; promise: Promise<MarketPrice[]> }
>();

async function fetchWithRetry(url: string): Promise<RawPriceEntry[]> {
  let delay = 500;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url);
    if (res.ok) return (await res.json()) as RawPriceEntry[];
    if (res.status === 429 && attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, delay));
      delay *= 3;
      continue;
    }
    throw new Error(
      res.status === 429
        ? "El servidor de datos de Albion está saturado (429). Espera unos segundos e inténtalo de nuevo."
        : `No se pudo consultar el mercado (status ${res.status}). El servidor de datos de Albion puede estar caído.`
    );
  }
}

function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expires < now) cache.delete(key);
  }
}

export class ApiPriceProvider implements PriceProvider {
  readonly source = "api" as const;

  constructor(private readonly serverId: ServerId = "europe") {}

  async getPrices(
    itemIds: string[],
    cities: City[],
    quality: Quality
  ): Promise<MarketPrice[]> {
    if (itemIds.length === 0 || cities.length === 0) return [];

    const apiBase = SERVERS.find((s) => s.id === this.serverId)!.apiBase;

    // El endpoint acepta listas largas de items, pero las URLs gigantes
    // pueden rechazarse; se consulta por lotes de CHUNK_SIZE.
    const all: MarketPrice[] = [];
    for (let i = 0; i < itemIds.length; i += CHUNK_SIZE) {
      const chunk = itemIds.slice(i, i + CHUNK_SIZE);
      const itemsParam = chunk.join(",");
      const url = `${apiBase}${PRICES_PATH}/${itemsParam}?locations=${encodeURIComponent(
        cities.join(",")
      )}&qualities=${quality}`;

      const cached = cache.get(url);
      const promise =
        cached && cached.expires > Date.now()
          ? cached.promise
          : (async () => {
              const raw = await fetchWithRetry(url);
              return raw.map((entry) => ({
                itemId: entry.item_id,
                city: entry.city as City,
                quality: entry.quality as Quality,
                sellPriceMin: entry.sell_price_min,
                buyPriceMax: entry.buy_price_max,
                updatedAt: entry.sell_price_min_date || null,
              }));
            })();

      if (!cached || cached.expires <= Date.now()) {
        cache.set(url, { expires: Date.now() + CACHE_TTL_MS, promise });
      }

      try {
        all.push(...(await promise));
      } catch (err) {
        cache.delete(url);
        throw err;
      }
    }

    pruneCache();
    return all;
  }
}
