import type { City, MarketPrice, PriceProvider, Quality } from "@/types/albion";

function key(itemId: string, city: City, quality: Quality) {
  return `${itemId}__${city}__${quality}`;
}

/**
 * Proveedor "manual": no llama a ninguna API, simplemente devuelve lo que
 * el usuario haya escrito en el formulario. Vive en memoria (useState en la UI)
 * y se le inyectan los precios vía setPrice().
 */
export class ManualPriceProvider implements PriceProvider {
  readonly source = "manual" as const;
  private prices = new Map<string, { sellPriceMin: number; buyPriceMax: number }>();

  setPrice(
    itemId: string,
    city: City,
    quality: Quality,
    values: { sellPriceMin?: number; buyPriceMax?: number }
  ) {
    const k = key(itemId, city, quality);
    const prev = this.prices.get(k) ?? { sellPriceMin: 0, buyPriceMax: 0 };
    this.prices.set(k, { ...prev, ...values });
  }

  async getPrices(
    itemIds: string[],
    cities: City[],
    quality: Quality
  ): Promise<MarketPrice[]> {
    const result: MarketPrice[] = [];
    for (const itemId of itemIds) {
      for (const city of cities) {
        const stored = this.prices.get(key(itemId, city, quality));
        result.push({
          itemId,
          city,
          quality,
          sellPriceMin: stored?.sellPriceMin ?? 0,
          buyPriceMax: stored?.buyPriceMax ?? 0,
          updatedAt: null,
        });
      }
    }
    return result;
  }
}
