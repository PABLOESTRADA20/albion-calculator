import { describe, expect, it } from "vitest";
import { craftFamily, craftingRecipe } from "./crafting";

describe("craftFamily", () => {
  it("deduce la familia por tipo de item", () => {
    expect(craftFamily("T4_2H_BOW")).toBe("PLANKS");
    expect(craftFamily("T6_MAIN_FIRESTAFF")).toBe("PLANKS");
    expect(craftFamily("T4_HEAD_CLOTH_SET1")).toBe("CLOTH");
    expect(craftFamily("T4_ARMOR_LEATHER_SET2")).toBe("LEATHER");
    expect(craftFamily("T5_MAIN_SWORD")).toBe("METALBAR");
  });

  it("devuelve null para items no crafteables en el modelo", () => {
    expect(craftFamily("T4_POTION_ENERGY")).toBeNull();
    expect(craftFamily("T4_MOUNT_OX")).toBeNull();
    expect(craftFamily("T4_CAPEITEM_FW_FORTSTERLING")).toBeNull();
    expect(craftFamily("T4_2H_BOW_AVALON")).toBeNull();
  });
});

describe("craftingRecipe", () => {
  it("receta estandar: 2 refinados del tier + 1 del tier anterior sin enchant", () => {
    const r = craftingRecipe("T4_MAIN_SWORD");
    expect(r).not.toBeNull();
    expect(r!.tier).toBe(4);
    expect(r!.enchant).toBe(0);
    expect(r!.ingredients).toEqual([
      { itemId: "T4_METALBAR", quantity: 2 },
      { itemId: "T3_METALBAR", quantity: 1 },
    ]);
  });

  it("respeta el enchant en el recurso principal pero no en el secundario", () => {
    const r = craftingRecipe("T5_2H_BOW@1");
    expect(r!.ingredients).toEqual([
      { itemId: "T5_PLANKS_LEVEL1@1", quantity: 2 },
      { itemId: "T4_PLANKS", quantity: 1 },
    ]);
  });

  it("rechaza tiers 1-2 y items sin familia", () => {
    expect(craftingRecipe("T2_MAIN_SWORD")).toBeNull();
    expect(craftingRecipe("T4_POTION_ENERGY")).toBeNull();
    expect(craftingRecipe("SIN_TIER")).toBeNull();
  });
});
