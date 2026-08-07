// Tipos base compartidos por las 3 calculadoras (crafteo, refinado, flipping)

export const CITIES = [
  "Bridgewatch",
  "Fort Sterling",
  "Lymhurst",
  "Martlock",
  "Thetford",
  "Caerleon",
  "Brecilien",
] as const;

export type City = (typeof CITIES)[number];

export const SERVERS = [
  {
    id: "europe",
    label: "Europa",
    apiBase: "https://europe.albion-online-data.com",
  },
  {
    id: "america",
    label: "América",
    apiBase: "https://west.albion-online-data.com",
  },
] as const;

export type ServerId = (typeof SERVERS)[number]["id"];

// 1 = Normal ... 5 = Masterpiece
export const QUALITIES = [1, 2, 3, 4, 5] as const;
export type Quality = (typeof QUALITIES)[number];

export const QUALITY_LABELS: Record<Quality, string> = {
  1: "Normal",
  2: "Bueno",
  3: "Sobresaliente",
  4: "Excelente",
  5: "Obra maestra",
};

/**
 * Precio de mercado de un item en una ciudad/calidad concreta.
 * sellPriceMin: lo más barato que alguien está vendiendo ahora mismo (lo que pagarías comprando de golpe)
 * buyPriceMax: lo más alto que alguien está ofreciendo comprar (lo que te pagarían vendiendo de golpe a una orden)
 */
export interface MarketPrice {
  itemId: string;
  city: City;
  quality: Quality;
  sellPriceMin: number;
  buyPriceMax: number;
  updatedAt: string | null;
}

/**
 * Contrato único que deben cumplir tanto el proveedor de API real
 * como el proveedor manual. Así las calculadoras no saben (ni les importa)
 * de dónde vienen los precios.
 */
export interface PriceProvider {
  readonly source: "api" | "manual";
  getPrices(
    itemIds: string[],
    cities: City[],
    quality: Quality
  ): Promise<MarketPrice[]>;
}

// Impuestos del mercado de Albion (aprox. sin premium / con premium)
export const MARKET_TAX = {
  setupFeeNonPremium: 0.025, // al publicar una orden de venta
  setupFeePremium: 0.015,
  saleTaxNonPremium: 0.08, // al vender vía orden
  saleTaxPremium: 0.04,
} as const;
