// Servicio de mercado centralizado: punto unico de acceso a precios.
// Los proveedores (API/manual) ya manejan cache, dedupe y backoff; esta capa
// agrega consultas de dominio (un item, muchos items) y normaliza resultados.

import type { City, MarketPrice, PriceProvider, Quality } from "@/types/albion";
import { groupPricesByItem, type PriceMap } from "@/lib/market/types";

export class MarketService {
  constructor(private readonly provider: PriceProvider) {}

  get source(): PriceProvider["source"] {
    return this.provider.source;
  }

  /** Precios de un solo item en las ciudades indicadas. */
  async getItemPrices(
    itemId: string,
    cities: City[],
    quality: Quality
  ): Promise<MarketPrice[]> {
    if (!itemId) return [];
    return this.provider.getPrices([itemId], cities, quality);
  }

  /** Precios de varios items en un solo request (la API acepta IDs separados por coma). */
  async getManyPrices(
    itemIds: string[],
    cities: City[],
    quality: Quality
  ): Promise<MarketPrice[]> {
    if (itemIds.length === 0) return [];
    return this.provider.getPrices(itemIds, cities, quality);
  }

  /** Mapa itemId -> city -> precio para un lote de items. */
  async getPriceMap(
    itemIds: string[],
    cities: City[],
    quality: Quality
  ): Promise<PriceMap> {
    const prices = await this.getManyPrices(itemIds, cities, quality);
    return groupPricesByItem(prices);
  }
}
