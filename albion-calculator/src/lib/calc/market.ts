// Impuestos y comisiones del mercado al comprar/vender.
// - Compra inmediata (market order): pagas sellPriceMin sin comisiones.
// - Venta inmediata (market order a una orden de compra): recibes buyPriceMax sin comisiones.
// - Orden de venta: pagas setupFee al publicar y saleTax al cobrar.
// - Orden de compra: pagas setupFee al publicar (porcentaje del monto ofertado).

import { MARKET_TAX } from "@/types/albion";

export function saleTax(premium: boolean): number {
  return premium ? MARKET_TAX.saleTaxPremium : MARKET_TAX.saleTaxNonPremium;
}

export function setupFee(premium: boolean): number {
  return premium ? MARKET_TAX.setupFeePremium : MARKET_TAX.setupFeeNonPremium;
}

// Ingresos netos de publicar una orden de venta a "price" (setup + sale tax).
export function sellOrderRevenue(price: number, premium: boolean): number {
  return price * (1 - setupFee(premium) - saleTax(premium));
}

// Coste total de publicar una orden de compra por "bid" (setup fee sobre el monto).
export function buyOrderCost(bid: number, premium: boolean): number {
  return bid * (1 + setupFee(premium));
}
