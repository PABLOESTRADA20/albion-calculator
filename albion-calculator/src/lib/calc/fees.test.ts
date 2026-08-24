import { describe, expect, it } from "vitest";
import { craftFeePerUnit, refineFeePerUnit } from "./fees";

describe("refineFeePerUnit", () => {
  it("T1 y T2 no pagan tarifa", () => {
    expect(refineFeePerUnit(1000, 1)).toBe(0);
    expect(refineFeePerUnit(1000, 2)).toBe(0);
  });

  it("T4 sin enchant con usage fee 1000 cuesta 18", () => {
    expect(refineFeePerUnit(1000, 4)).toBeCloseTo(18, 10);
  });

  it("escala exponencialmente con tier y enchant", () => {
    expect(refineFeePerUnit(1000, 5)).toBeCloseTo(36, 10);
    expect(refineFeePerUnit(1000, 8)).toBeCloseTo(288, 10);
    expect(refineFeePerUnit(1000, 4, 1)).toBeCloseTo(36, 10);
    expect(refineFeePerUnit(1000, 4, 2)).toBeCloseTo(72, 10);
  });
});

describe("craftFeePerUnit", () => {
  it("T1 y T2 no pagan tarifa", () => {
    expect(craftFeePerUnit(1000, 1, 2)).toBe(0);
    expect(craftFeePerUnit(1000, 2, 3)).toBe(0);
  });

  it("multiplica por la cantidad de materiales", () => {
    expect(craftFeePerUnit(1000, 4, 2)).toBeCloseTo(36, 10);
    expect(craftFeePerUnit(1000, 4, 3)).toBeCloseTo(54, 10);
  });

  it("los artefactos encarecen la tarifa", () => {
    expect(craftFeePerUnit(1000, 4, 1, 1)).toBeCloseTo(22.5, 10);
    expect(craftFeePerUnit(1000, 4, 1, 2)).toBeCloseTo(31.5, 10);
  });

  it("con enchant el factor de artefacto se atenua", () => {
    // factor = 1 + (0.25*(4-1))/2 = 1.375; fee = 18 * 1.375 * 2(enchant)
    expect(craftFeePerUnit(1000, 4, 1, 2, 1)).toBeCloseTo(49.5, 10);
  });
});
