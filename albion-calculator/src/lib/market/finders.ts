// Logica pura de mercado: finders de compra/venta, arbitraje y optimizacion de compra.
// Sin acceso a red ni a React: funciona sobre MarketPrice[] y devuelve filas ordenadas.

import type { City, MarketPrice } from "@/types/albion";
import { buyOrderCost, sellOrderRevenue } from "@/lib/calc/market";
import type {
  ArbitrageOpportunity,
  BuyFinderRow,
  CityPriceRow,
  MarketOpportunity,
  OptimizationResult,
  PriceMap,
  RiskLevel,
  SellFinderRow,
} from "@/lib/market/types";

function isAvailable(p: MarketPrice, field: "sellPriceMin" | "buyPriceMax") {
  return p[field] > 0;
}

/** Crea filas de comparacion de ciudades para un item. */
export function buildCityPriceRows(prices: MarketPrice[]): CityPriceRow[] {
  const byCity = new Map<City, MarketPrice>();
  for (const p of prices) {
    if (!byCity.has(p.city)) byCity.set(p.city, p);
  }
  return Array.from(byCity.values())
    .map((p) => ({
      city: p.city,
      buyPrice: isAvailable(p, "sellPriceMin") ? p.sellPriceMin : 0,
      sellPrice: isAvailable(p, "buyPriceMax") ? p.buyPriceMax : 0,
      available: 0,
      updatedAt: p.updatedAt,
    }))
    .sort((a, b) => a.buyPrice - b.buyPrice);
}

/** Buy Finder: donde comprar un item mas barato, ordenado por total. */
export function buildBuyFinderRows(
  prices: MarketPrice[],
  quantity: number
): BuyFinderRow[] {
  const rows: BuyFinderRow[] = prices
    .filter((p) => isAvailable(p, "sellPriceMin"))
    .map((p) => {
      const price = p.sellPriceMin;
      const total = Math.round(price * quantity);
      return {
        city: p.city,
        price,
        total,
        updatedAt: p.updatedAt,
        isCheapest: false,
      };
    })
    .sort((a, b) => a.total - b.total);

  if (rows.length > 0) rows[0].isCheapest = true;
  return rows;
}

/** Sell Finder: donde vender un item mas caro (via orden de venta), ordenado por neto. */
export function buildSellFinderRows(
  prices: MarketPrice[],
  quantity: number,
  premium: boolean
): SellFinderRow[] {
  const rows: SellFinderRow[] = prices
    .filter((p) => isAvailable(p, "buyPriceMax"))
    .map((p) => {
      const price = p.buyPriceMax;
      const gross = price * quantity;
      const net = sellOrderRevenue(gross, premium);
      return {
        city: p.city,
        price,
        gross,
        fees: Math.round(gross - net),
        net: Math.round(net),
        updatedAt: p.updatedAt,
        isBest: false,
      };
    })
    .sort((a, b) => b.net - a.net);

  if (rows.length > 0) rows[0].isBest = true;
  return rows;
}

/**
 * Arbitraje: compra de golpe en la ciudad mas barata (sellPriceMin)
 * y venta via orden en la ciudad mas cara (sellPriceMin de alli),
 * descontando tarifas de estacion/mercado de la venta.
 */
export function scanArbitrage(
  priceMap: PriceMap,
  premium: boolean
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  for (const [itemId, byCity] of priceMap) {
    let buyCity: City | null = null;
    let buyPrice = 0;
    let sellCity: City | null = null;
    let sellPrice = 0;

    for (const p of byCity.values()) {
      if (p.sellPriceMin > 0 && (buyCity === null || p.sellPriceMin < buyPrice)) {
        buyCity = p.city;
        buyPrice = p.sellPriceMin;
      }
      if (p.buyPriceMax > 0 && (sellCity === null || p.buyPriceMax > sellPrice)) {
        sellCity = p.city;
        sellPrice = p.buyPriceMax;
      }
    }

    if (buyCity === null || sellCity === null || buyCity === sellCity) continue;
    if (buyPrice <= 0 || sellPrice <= 0 || sellPrice <= buyPrice) continue;

    const netSell = sellOrderRevenue(sellPrice, premium);
    const netProfit = Math.round(netSell - buyPrice);
    if (netProfit <= 0) continue;

    const roi = buyPrice > 0 ? (netProfit / buyPrice) * 100 : 0;
    opportunities.push({
      itemId,
      itemLabel: "",
      buyCity,
      buyPrice,
      sellCity,
      sellPrice,
      quantity: 1,
      grossProfit: Math.round(sellPrice - buyPrice),
      fees: Math.round(sellPrice - netSell),
      netProfit,
      roi,
    });
  }

  return opportunities.sort((a, b) => b.netProfit - a.netProfit);
}

/**
 * Optimizacion de compra de una build: comparar comprar todo en una sola
 * ciudad vs. comprar cada item en la ciudad mas barata.
 */
export function optimizeBuildPurchase(
  priceMap: PriceMap,
  itemIds: string[],
  itemLabels: Record<string, string>
): {
  items: OptimizationResult[];
  totalNormal: number;
  totalOptimized: number;
  savings: number;
} {
  const items: OptimizationResult[] = [];
  let totalOptimized = 0;

  for (const itemId of itemIds) {
    const byCity = priceMap.get(itemId);
    if (!byCity || byCity.size === 0) continue;

    let best: { city: City; price: number } | null = null;
    for (const p of byCity.values()) {
      if (p.sellPriceMin <= 0) continue;
      if (best === null || p.sellPriceMin < best.price) {
        best = { city: p.city, price: p.sellPriceMin };
      }
    }
    if (!best) continue;

    items.push({
      itemId,
      itemLabel: itemLabels[itemId] ?? itemId,
      city: best.city,
      price: best.price,
      quantity: 1,
      total: best.price,
      isBestCity: true,
    });
    totalOptimized += best.price;
  }

  // Coste normal: todo comprado en la ciudad donde la SUMA es menor.
  const cities = new Set<City>();
  for (const it of items) cities.add(it.city);
  let totalNormal = Infinity;
  for (const city of cities) {
    let sum = 0;
    let complete = true;
    for (const itemId of itemIds) {
      const byCity = priceMap.get(itemId);
      const p = byCity?.get(city);
      if (!p || p.sellPriceMin <= 0) {
        complete = false;
        break;
      }
      sum += p.sellPriceMin;
    }
    if (complete && sum < totalNormal) totalNormal = sum;
  }
  if (!Number.isFinite(totalNormal)) totalNormal = totalOptimized;

  const savings = Math.max(0, totalNormal - totalOptimized);

  return {
    items: items.sort((a, b) => b.total - a.total),
    totalNormal,
    totalOptimized,
    savings,
  };
}

/** Coste total de una orden de compra sobre un monto (con setup fee). */
export function costWithSetupFee(bid: number, premium: boolean): number {
  return buyOrderCost(Math.max(0, bid), premium);
}

/** Tier de un id de item (T4_2H_... -> 4; sin tier -> 0). */
export function itemTier(id: string): number {
  const m = /^T(\d)/.exec(id);
  return m ? Number(m[1]) : 0;
}

/** Categoria de mercado de un id de item. */
export function itemCategory(id: string): string {
  if (id.includes("_OFF_")) return "offhand";
  if (id.includes("CAPEITEM")) return "cape";
  if (id.includes("POTION")) return "potion";
  if (id.includes("MOUNT")) return "mount";
  if (id.includes("_2H_") || id.includes("_MAIN_")) return "weapon";
  if (
    id.includes("_HEAD_") ||
    id.includes("_ARMOR_") ||
    id.includes("_SHOES_")
  ) {
    return "armor";
  }
  return "other";
}

/**
 * Nivel de riesgo de una oportunidad:
 * spreads desorbitados (orden vieja o mercado iliquido) suben el riesgo.
 */
export function riskOf(roiPct: number, spreadPct: number): RiskLevel {
  if (spreadPct > 0.3 || roiPct > 35) return "HIGH";
  if (spreadPct > 0.15 || roiPct > 15) return "MEDIUM";
  return "LOW";
}

/** Aplica una cantidad a una oportunidad (fees y venta son lineales). */
export function scaleOpportunity(
  opp: ArbitrageOpportunity,
  quantity: number
): ArbitrageOpportunity {
  const q = Math.max(1, quantity);
  const netSell = sellOrderRevenue(opp.sellPrice * q, true);
  return {
    ...opp,
    quantity: q,
    grossProfit: Math.round(opp.grossProfit * q),
    fees: Math.round((opp.sellPrice - netSell)),
    netProfit: Math.round(netSell - opp.buyPrice * q),
  };
}

/** Convierte una oportunidad de arbitraje en oportunidad normalizada de mercado. */
export function toMarketOpportunity(
  opp: ArbitrageOpportunity
): MarketOpportunity {
  const spreadPct =
    opp.buyPrice > 0 ? (opp.sellPrice - opp.buyPrice) / opp.buyPrice : 0;
  return {
    id: `${opp.itemId}|${opp.buyCity}|${opp.sellCity}|${opp.quantity}`,
    activity: "Arbitraje",
    title: opp.itemLabel,
    detail: `Comprar en ${opp.buyCity} · vender en ${opp.sellCity}`,
    city: opp.sellCity,
    capital: Math.round(opp.buyPrice * opp.quantity),
    profit: opp.netProfit,
    roi: opp.roi,
    risk: riskOf(opp.roi, spreadPct),
  };
}

export interface ScanFilters {
  tier: number;
  category: string;
  minRoi: number;
  minProfit: number;
  maxCapital: number;
  quantity: number;
  risk: RiskLevel | "all";
}

export const DEFAULT_SCAN_FILTERS: ScanFilters = {
  tier: 0,
  category: "all",
  minRoi: 0,
  minProfit: 0,
  maxCapital: 0,
  quantity: 1,
  risk: "all",
};

/**
 * Scanner de mercado: arbitraje por item sobre un conjunto de precios,
 * filtrado y normalizado como oportunidades de mercado.
 */
export function scanMarket(
  priceMap: PriceMap,
  filters: ScanFilters = DEFAULT_SCAN_FILTERS
): MarketOpportunity[] {
  const tier = filters.tier;
  const category = filters.category;
  const minRoi = filters.minRoi;
  const minProfit = filters.minProfit;
  const maxCapital = filters.maxCapital;
  const quantity = Math.max(1, filters.quantity);
  const risk = filters.risk;

  const out: MarketOpportunity[] = [];
  for (const [itemId, byCity] of priceMap) {
    if (tier > 0 && itemTier(itemId) !== tier) continue;
    if (category !== "all" && itemCategory(itemId) !== category) continue;

    let buyCity: City | null = null;
    let buyPrice = 0;
    let sellCity: City | null = null;
    let sellPrice = 0;

    for (const p of byCity.values()) {
      if (p.sellPriceMin > 0 && (buyCity === null || p.sellPriceMin < buyPrice)) {
        buyCity = p.city;
        buyPrice = p.sellPriceMin;
      }
      if (p.buyPriceMax > 0 && (sellCity === null || p.buyPriceMax > sellPrice)) {
        sellCity = p.city;
        sellPrice = p.buyPriceMax;
      }
    }

    if (buyCity === null || sellCity === null || buyCity === sellCity) continue;
    if (buyPrice <= 0 || sellPrice <= 0 || sellPrice <= buyPrice) continue;

    const netSell = sellOrderRevenue(sellPrice * quantity, true);
    const netProfit = Math.round(netSell - buyPrice * quantity);
    if (netProfit <= 0) continue;
    const roi = buyPrice > 0 ? (netProfit / (buyPrice * quantity)) * 100 : 0;
    if (roi < minRoi) continue;
    if (netProfit < minProfit) continue;

    const capital = Math.round(buyPrice * quantity);
    if (maxCapital > 0 && capital > maxCapital) continue;

    const spreadPct = (sellPrice - buyPrice) / buyPrice;
    const riskLevel = riskOf(roi, spreadPct);
    if (risk !== "all" && riskLevel !== risk) continue;

    out.push({
      id: `${itemId}|${buyCity}|${sellCity}|${quantity}`,
      activity: "Arbitraje",
      title: itemId,
      detail: `Comprar en ${buyCity} · vender en ${sellCity}`,
      city: sellCity,
      capital,
      profit: netProfit,
      roi,
      risk: riskLevel,
    });
  }

  return out.sort((a, b) => b.roi - a.roi);
}

/** Las mejores N oportunidades, por ROI y beneficio. */
export function bestMoves(
  opportunities: MarketOpportunity[],
  count = 1
): MarketOpportunity[] {
  return [...opportunities]
    .sort((a, b) => b.roi - a.roi || b.profit - a.profit)
    .slice(0, count);
}
