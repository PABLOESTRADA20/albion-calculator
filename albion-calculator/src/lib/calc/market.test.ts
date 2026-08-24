import { describe, expect, it } from "vitest";
import {
  buyOrderCost,
  saleTax,
  sellOrderRevenue,
  setupFee,
} from "./market";

describe("taxes", () => {
  it("porcentajes oficiales con y sin premium", () => {
    expect(saleTax(false)).toBe(0.08);
    expect(saleTax(true)).toBe(0.04);
    expect(setupFee(false)).toBe(0.025);
    expect(setupFee(true)).toBe(0.015);
  });
});

describe("sellOrderRevenue", () => {
  it("descuenta setup fee + sale tax sobre el precio", () => {
    expect(sellOrderRevenue(1000, false)).toBeCloseTo(895, 10);
    expect(sellOrderRevenue(1000, true)).toBeCloseTo(945, 10);
  });

  it("es lineal en el precio", () => {
    expect(sellOrderRevenue(4000, false)).toBeCloseTo(
      4 * sellOrderRevenue(1000, false),
      6
    );
  });
});

describe("buyOrderCost", () => {
  it("suma el setup fee sobre la puja", () => {
    expect(buyOrderCost(1000, false)).toBeCloseTo(1025, 10);
    expect(buyOrderCost(1000, true)).toBeCloseTo(1015, 10);
  });
});
