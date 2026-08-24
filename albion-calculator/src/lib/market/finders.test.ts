import { describe, expect, it } from "vitest";
import type { City, MarketPrice } from "@/types/albion";import {
  bestMoves,
  buildBuyFinderRows,
  buildCityPriceRows,
  buildSellFinderRows,
  DEFAULT_SCAN_FILTERS,
  itemCategory,
  itemTier,
  optimizeBuildPurchase,
  riskOf,
  scaleOpportunity,
  scanArbitrage,
  scanMarket,
} from "./finders";
import type { ArbitrageOpportunity, PriceMap } from "./types";

function price(
  itemId: string,
  city: City,
  sellPriceMin: number,
  buyPriceMax = 0
): MarketPrice {
  return {
    itemId,
    city,
    quality: 1,
    sellPriceMin,
    buyPriceMax,
    updatedAt: null,
  };
}

describe("itemTier / itemCategory", () => {
  it("extrae el tier del id", () => {
    expect(itemTier("T4_2H_BOW")).toBe(4);
    expect(itemTier("T8_MAIN_SWORD@2")).toBe(8);
    expect(itemTier("SIN_TIER")).toBe(0);
  });

  it("clasifica categorias de mercado", () => {
    expect(itemCategory("T4_OFF_SHIELD")).toBe("offhand");
    expect(itemCategory("T4_CAPEITEM_FW_FORTSTERLING")).toBe("cape");
    expect(itemCategory("T4_POTION_ENERGY")).toBe("potion");
    expect(itemCategory("T4_MOUNT_OX")).toBe("mount");
    expect(itemCategory("T4_2H_BOW")).toBe("weapon");
    expect(itemCategory("T4_HEAD_CLOTH_SET1")).toBe("armor");
    expect(itemCategory("T4_FISHFRESH_SHOAL")).toBe("other");
  });
});

describe("riskOf", () => {
  it("clasifica por spread y roi", () => {
    expect(riskOf(5, 0.05)).toBe("LOW");
    expect(riskOf(10, 0.2)).toBe("MEDIUM");
    expect(riskOf(40, 0.1)).toBe("HIGH");
    expect(riskOf(10, 0.4)).toBe("HIGH");
  });
});

describe("buildBuyFinderRows", () => {
  it("ordena por total y marca el mas barato, filtrando sin stock", () => {
    const rows = buildBuyFinderRows(
      [
        price("X", "Bridgewatch", 120),
        price("X", "Martlock", 0),
        price("X", "Thetford", 100),
      ],
      3
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      city: "Thetford",
      price: 100,
      total: 300,
      isCheapest: true,
    });
    expect(rows[1].isCheapest).toBe(false);
  });
});

describe("buildSellFinderRows", () => {
  it("calcula bruto, fees y neto; ordena por neto desc", () => {
    const rows = buildSellFinderRows(
      [
        price("X", "Bridgewatch", 0, 200),
        price("X", "Martlock", 0, 100),
      ],
      2,
      false
    );
    expect(rows[0]).toMatchObject({ city: "Bridgewatch", isBest: true });
    // gross 400, net = 400 * 0.895 = 358 -> fees 42
    expect(rows[0].gross).toBe(400);
    expect(rows[0].net).toBe(358);
    expect(rows[0].fees).toBe(42);
    expect(rows[1]).toMatchObject({ city: "Martlock", isBest: false });
  });
});

describe("scanArbitrage", () => {
  it("encuentra la mejor combinacion comprar/vender entre ciudades", () => {
    const priceMap: PriceMap = new Map([
      [
        "X",
        new Map<City, MarketPrice>([
          ["Bridgewatch", price("X", "Bridgewatch", 100)],
          ["Martlock", price("X", "Martlock", 150, 200)],
        ]),
      ],
    ]);
    const opps = scanArbitrage(priceMap, false);
    expect(opps).toHaveLength(1);
    const o = opps[0];
    expect(o.buyCity).toBe("Bridgewatch");
    expect(o.sellCity).toBe("Martlock");
    // netSell = 200*0.895 = 179 -> netProfit 79, roi 79%
    expect(o.netProfit).toBe(79);
    expect(o.roi).toBeCloseTo(79, 6);
  });

  it("descarta misma ciudad, spreads negativos y beneficio neto no positivo", () => {
    const priceMap: PriceMap = new Map([
      [
        "same-city",
        new Map<City, MarketPrice>([
          ["Bridgewatch", price("same-city", "Bridgewatch", 100, 300)],
        ]),
      ],
      [
        "loss",
        new Map<City, MarketPrice>([
          ["Bridgewatch", price("loss", "Bridgewatch", 500)],
          ["Thetford", price("loss", "Thetford", 0, 400)],
        ]),
      ],
    ]);
    expect(scanArbitrage(priceMap, false)).toHaveLength(0);
  });
});

describe("scaleOpportunity", () => {
  it("escala linealmente con la cantidad usando fees de premium", () => {
    const base: ArbitrageOpportunity = {
      itemId: "X",
      itemLabel: "X",
      buyCity: "Bridgewatch",
      buyPrice: 100,
      sellCity: "Martlock",
      sellPrice: 200,
      quantity: 1,
      grossProfit: 100,
      fees: 21,
      netProfit: 79,
      roi: 79,
    };
    const scaled = scaleOpportunity(base, 3);
    expect(scaled.quantity).toBe(3);
    expect(scaled.grossProfit).toBe(300);
    // netSell premium = 600 * 0.945 = 567 -> netProfit 267, fees 33
    expect(scaled.netProfit).toBe(267);
    expect(scaled.fees).toBe(33);
  });
});

describe("scanMarket / bestMoves", () => {
  const priceMap: PriceMap = new Map([
    [
      "T4_2H_BOW",
      new Map<City, MarketPrice>([
        ["Bridgewatch", price("T4_2H_BOW", "Bridgewatch", 1000)],
        ["Thetford", price("T4_2H_BOW", "Thetford", 0, 1600)],
      ]),
    ],
    [
      "T5_POTION_ENERGY",
      new Map<City, MarketPrice>([
        ["Bridgewatch", price("T5_POTION_ENERGY", "Bridgewatch", 100)],
        ["Thetford", price("T5_POTION_ENERGY", "Thetford", 0, 130)],
      ]),
    ],
  ]);

  it("filtra por tier y categoria y ordena por roi", () => {
    const all = scanMarket(priceMap);
    expect(all.map((o) => o.title).sort()).toEqual([
      "T4_2H_BOW",
      "T5_POTION_ENERGY",
    ]);

    const weaponsOnly = scanMarket(priceMap, {
      ...DEFAULT_SCAN_FILTERS,
      tier: 4,
      category: "weapon",
    });
    expect(weaponsOnly.map((o) => o.title)).toEqual(["T4_2H_BOW"]);
  });

  it("aplica filtros de roi minimo", () => {
    // T4 bow: netSell=1600*0.895=1432, profit 432, roi ~43.2%
    const filtered = scanMarket(priceMap, { ...DEFAULT_SCAN_FILTERS, minRoi: 60 });
    expect(filtered).toHaveLength(0);
    const kept = scanMarket(priceMap, { ...DEFAULT_SCAN_FILTERS, minRoi: 40 });
    expect(kept.map((o) => o.title)).toEqual(["T4_2H_BOW"]);
  });

  it("bestMoves devuelve el top N por roi", () => {
    const all = scanMarket(priceMap);
    expect(bestMoves(all)[0].title).toBe("T4_2H_BOW");
    expect(bestMoves(all, 5)).toHaveLength(all.length);
  });
});

describe("buildCityPriceRows", () => {
  it("una fila por ciudad ordenada por precio de compra", () => {
    const rows = buildCityPriceRows([
      price("X", "Martlock", 300, 350),
      price("X", "Bridgewatch", 100),
      price("X", "Thetford", 200),
    ]);
    expect(rows.map((r) => r.city)).toEqual([
      "Bridgewatch",
      "Thetford",
      "Martlock",
    ]);
    expect(rows[2].sellPrice).toBe(350);
  });
});

describe("optimizeBuildPurchase", () => {
  it("compara comprar todo en una ciudad vs cada item en su ciudad mas barata", () => {
    const priceMap: PriceMap = new Map([
      [
        "A",
        new Map<City, MarketPrice>([
          ["Bridgewatch", price("A", "Bridgewatch", 100)],
          ["Martlock", price("A", "Martlock", 90)],
        ]),
      ],
      [
        "B",
        new Map<City, MarketPrice>([
          ["Bridgewatch", price("B", "Bridgewatch", 200)],
          ["Martlock", price("B", "Martlock", 250)],
        ]),
      ],
    ]);
    const result = optimizeBuildPurchase(priceMap, ["A", "B"], { A: "Item A" });
    expect(result.totalOptimized).toBe(290);
    expect(result.totalNormal).toBe(300);
    expect(result.savings).toBe(10);
    // items ordenados por total descendente
    expect(result.items.map((i) => i.itemId)).toEqual(["B", "A"]);
    expect(result.items.find((i) => i.itemId === "A")!.itemLabel).toBe("Item A");
  });

  it("sin ciudad completa usa el optimizado como normal", () => {
    const priceMap: PriceMap = new Map([
      [
        "A",
        new Map<City, MarketPrice>([["Bridgewatch", price("A", "Bridgewatch", 100)]]),
      ],
      [
        "B",
        new Map<City, MarketPrice>([["Martlock", price("B", "Martlock", 50)]]),
      ],
    ]);
    const result = optimizeBuildPurchase(priceMap, ["A", "B"], {});
    expect(result.totalOptimized).toBe(150);
    expect(result.totalNormal).toBe(150);
    expect(result.savings).toBe(0);
  });
});
