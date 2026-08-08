// Recetas estandar de crafteo de equipamiento (economia, sin artefactos):
//   T{tier}.{enchant}: 2x recurso refinado T{tier}.{enchant} + 1x recurso
//   refinado T{tier-1} SIN encantar (misma regla de excepciones que el
//   refinado: el tier inferior nunca lleva enchant).
// No se modelan artefactos, capas de faccion, pociones ni monturas.
// La familia de recurso se deduce del tipo de item (lanas/armaduras).

export interface CraftIngredient {
  itemId: string;
  quantity: number;
}

export interface CraftRecipe {
  outputItemId: string;
  ingredients: CraftIngredient[];
  tier: number;
  enchant: number;
}

export type CraftFamily = "METALBAR" | "PLANKS" | "CLOTH" | "LEATHER";

const ARTIFACT_MARKERS = ["_HELL", "_MORGANA", "_KEEPER", "_CRYSTAL", "_AVALON"];

/** Familia de recurso refinado usada para fabricar un item. */
export function craftFamily(itemId: string): CraftFamily | null {
  const id = itemId.toUpperCase();
  if (id.includes("CAPEITEM") || id.includes("_FW_")) return null;
  if (id.includes("_POTION") || id.includes("_MOUNT")) return null;
  if (ARTIFACT_MARKERS.some((m) => id.includes(m))) return null;
  if (id.includes("_2H_BOW") || id.includes("_MAIN_BOW")) return "PLANKS";
  if (id.includes("STAFF")) return "PLANKS";
  if (id.includes("_OFF_TORCH")) return "PLANKS";
  if (id.includes("_OFF_BOOK") || id.includes("_OFF_TOME")) return "CLOTH";
  if (id.includes("_CLOTH_")) return "CLOTH";
  if (id.includes("_LEATHER_")) return "LEATHER";
  return "METALBAR";
}

function refineId(family: CraftFamily, tier: number, enchant: number): string {
  const base = `T${tier}_${family}`;
  return enchant > 0 ? `${base}_LEVEL${enchant}@${enchant}` : base;
}

/** Receta de crafteo de un item (null si no es crafteable con el modelo). */
export function craftingRecipe(itemId: string): CraftRecipe | null {
  const family = craftFamily(itemId);
  if (!family) return null;
  const tierMatch = /^T(\d)/.exec(itemId);
  if (!tierMatch) return null;
  const tier = Number(tierMatch[1]);
  if (tier < 3) return null;
  const enchantMatch = /@(\d)$/.exec(itemId);
  const enchant = enchantMatch ? Number(enchantMatch[1]) : 0;

  return {
    outputItemId: itemId,
    ingredients: [
      { itemId: refineId(family, tier, enchant), quantity: 2 },
      { itemId: refineId(family, tier - 1, 0), quantity: 1 },
    ],
    tier,
    enchant,
  };
}
