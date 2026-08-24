import { describe, expect, it } from "vitest";
import {
  productionBonus,
  resourceReturnRate,
  rrrFromBonus,
} from "./returnRate";

describe("productionBonus", () => {
  it("parte de la base de ciudad 18", () => {
    expect(
      productionBonus({
        kind: "crafting",
        hasCitySpecialty: false,
        useFocus: false,
        dailyBonus: 0,
      })
    ).toBe(18);
  });

  it("suma especialidad segun actividad", () => {
    expect(
      productionBonus({
        kind: "refining",
        hasCitySpecialty: true,
        useFocus: false,
        dailyBonus: 0,
      })
    ).toBe(58);
    expect(
      productionBonus({
        kind: "crafting",
        hasCitySpecialty: true,
        useFocus: false,
        dailyBonus: 0,
      })
    ).toBe(33);
  });

  it("suma focus y bonus diario", () => {
    expect(
      productionBonus({
        kind: "crafting",
        hasCitySpecialty: true,
        useFocus: true,
        dailyBonus: 20,
      })
    ).toBe(112);
  });
});

describe("rrrFromBonus", () => {
  it("bonus 0 o negativo devuelve 0", () => {
    expect(rrrFromBonus(0)).toBe(0);
    expect(rrrFromBonus(-10)).toBe(0);
  });

  it("aplica la formula 1 - 1/(1 + bonus/100)", () => {
    expect(rrrFromBonus(18)).toBeCloseTo(0.1525, 4);
    expect(rrrFromBonus(118)).toBeCloseTo(0.5413, 4);
    expect(rrrFromBonus(43.9)).toBeCloseTo(0.3051, 4);
  });
});

describe("resourceReturnRate", () => {
  it("es consistente con productionBonus + rrrFromBonus", () => {
    const input = {
      kind: "refining",
      hasCitySpecialty: true,
      useFocus: false,
      dailyBonus: 10,
    } as const;
    expect(resourceReturnRate(input)).toBeCloseTo(
      rrrFromBonus(productionBonus(input)),
      12
    );
  });
});
