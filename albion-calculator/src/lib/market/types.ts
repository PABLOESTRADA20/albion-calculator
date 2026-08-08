// Tipos de dominio del modulo de mercado: finders, arbitraje, scanner y optimizacion.

import type { City, MarketPrice, Quality } from "@/types/albion";

/** Precio de un item en una ciudad, listo para comparar. */
export interface CityPriceRow {
  city: City;
  /** Lo que pagarias comprando de golpe (sellPriceMin). */
  buyPrice: number;
  /** Lo que recibirias vendiendo de golpe a una orden (buyPriceMax). */
  sellPrice: number;
  available: number;
  updatedAt: string | null;
}

/** Fila del Buy Finder: donde comprar mas barato. */
export interface BuyFinderRow {
  city: City;
  price: number;
  total: number;
  updatedAt: string | null;
  isCheapest: boolean;
}

/** Fila del Sell Finder: donde vender mas caro. */
export interface SellFinderRow {
  city: City;
  price: number;
  gross: number;
  fees: number;
  net: number;
  updatedAt: string | null;
  isBest: boolean;
}

/** Oportunidad de arbitraje: comprar en una ciudad y vender en otra. */
export interface ArbitrageOpportunity {
  itemId: string;
  itemLabel: string;
  buyCity: City;
  buyPrice: number;
  sellCity: City;
  sellPrice: number;
  quantity: number;
  grossProfit: number;
  fees: number;
  netProfit: number;
  roi: number;
}

/** Nivel de riesgo de una oportunidad. */
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

/** Actividad economica de una oportunidad. */
export type OpportunityActivity =
  | "Arbitraje"
  | "Flipping"
  | "Refinado"
  | "Crafteo";

/** Oportunidad normalizada para el scanner y Best Move Now. */
export interface MarketOpportunity {
  id: string;
  activity: OpportunityActivity;
  title: string;
  detail: string;
  city: City | null;
  capital: number;
  profit: number;
  roi: number;
  risk: RiskLevel;
}

/** Resultado del analisis de compra optimizada de una build. */
export interface OptimizationResult {
  itemId: string;
  itemLabel: string;
  city: City;
  price: number;
  quantity: number;
  total: number;
  isBestCity: boolean;
}

export interface BuildCostResult {
  items: OptimizationResult[];
  totalNormal: number;
  totalOptimized: number;
  savings: number;
  strategy: string;
  updatedAt: string | null;
}

/** Conjunto de precios por item y ciudad (mapa itemId -> city -> precio). */
export type PriceMap = Map<string, Map<City, MarketPrice>>;

export function groupPricesByItem(prices: MarketPrice[]): PriceMap {
  const map: PriceMap = new Map();
  for (const p of prices) {
    let byCity = map.get(p.itemId);
    if (!byCity) {
      byCity = new Map();
      map.set(p.itemId, byCity);
    }
    byCity.set(p.city, p);
  }
  return map;
}

export function itemQuality(p: MarketPrice): Quality {
  return p.quality;
}
