import { describe, expect, it } from "vitest";
import { RESOURCE_GROUPS, refineRecipe } from "./refining";
import type { ResourceGroup } from "./refining";

const ore = RESOURCE_GROUPS.find((g) => g.id === "ore")!;
const wood = RESOURCE_GROUPS.find((g) => g.id === "wood")!;

function group(partial: Partial<ResourceGroup>): ResourceGroup {
  return {
    id: "test",
    label: "Test",
    rawPrefix: "RAW",
    refinedPrefix: "REFINED",
    bonusCity: "Caerleon",
    ...partial,
  };
}

describe("refineRecipe", () => {
  it("T2 usa solo materia prima", () => {
    const r = refineRecipe(ore, 2);
    expect(r.outputItemId).toBe("T2_METALBAR");
    expect(r.ingredients).toHaveLength(1);
    expect(r.ingredients[0]).toMatchObject({ itemId: "T2_ORE", quantity: 1 });
  });

  it("T4 necesita 2 raw y 1 refinado T3", () => {
    const r = refineRecipe(wood, 4);
    expect(r.outputItemId).toBe("T4_PLANKS");
    expect(r.ingredients).toEqual([
      expect.objectContaining({ itemId: "T4_WOOD", quantity: 2 }),
      expect.objectContaining({ itemId: "T3_PLANKS", quantity: 1 }),
    ]);
  });

  it("las cantidades raw siguen la tabla oficial", () => {
    expect(refineRecipe(group({}), 5).ingredients[0].quantity).toBe(3);
    expect(refineRecipe(group({}), 6).ingredients[0].quantity).toBe(4);
    expect(refineRecipe(group({}), 7).ingredients[0].quantity).toBe(5);
    expect(refineRecipe(group({}), 8).ingredients[0].quantity).toBe(5);
  });

  it("encanta materia prima y salida, pero T4 usa refinado T3 normal", () => {
    const r = refineRecipe(ore, 4, 1);
    expect(r.outputItemId).toBe("T4_METALBAR_LEVEL1@1");
    expect(r.ingredients[0].itemId).toBe("T4_ORE_LEVEL1@1");
    expect(r.ingredients[1].itemId).toBe("T3_METALBAR");
  });

  it("a partir de T5 el refinado previo tambien va encantado", () => {
    const r = refineRecipe(ore, 5, 2);
    expect(r.outputItemId).toBe("T5_METALBAR_LEVEL2@2");
    expect(r.ingredients[0].itemId).toBe("T5_ORE_LEVEL2@2");
    expect(r.ingredients[1].itemId).toBe("T4_METALBAR_LEVEL2@2");
  });

  it("la piedra no cambia de comportamiento con enchant 0", () => {
    const stone = RESOURCE_GROUPS.find((g) => g.id === "stone")!;
    const r = refineRecipe(stone, 3);
    expect(r.outputItemId).toBe("T3_STONEBLOCK");
    expect(r.ingredients[1].itemId).toBe("T2_STONEBLOCK");
  });
});
