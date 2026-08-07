// Recetas de refinado. Refinar T2 usa solo materia prima; a partir de T3
// requiere ademas 1 unidad del material refinado del tier anterior:
//   T2: 1 raw        -> 1 refined
//   T3: 2 raw + 1 T2 -> 1 refined
//   T4: 2 raw + 1 T3 -> 1 refined
//   T5: 3 raw + 1 T4 -> 1 refined
//   T6: 4 raw + 1 T5 -> 1 refined
//   T7: 5 raw + 1 T6 -> 1 refined
//   T8: 5 raw + 1 T7 -> 1 refined
// Variantes encantadas (ids reales del mercado: T4_METALBAR_LEVEL1@1):
// usan materia prima encantada del mismo nivel y el refinado del tier
// anterior encantado, con dos excepciones oficiales: T3 usa T2 normal
// (T2 no tiene encantamiento) y T4 usa T3 normal. La piedra (stone) no
// tiene variantes encantadas.

export interface ResourceGroup {
  id: string;
  label: string;
  rawPrefix: string;
  refinedPrefix: string;
  bonusCity: string;
}

export const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    id: "ore",
    label: "Mineral (lingotes)",
    rawPrefix: "ORE",
    refinedPrefix: "METALBAR",
    bonusCity: "Thetford",
  },
  {
    id: "fiber",
    label: "Fibra (tela)",
    rawPrefix: "FIBER",
    refinedPrefix: "CLOTH",
    bonusCity: "Lymhurst",
  },
  {
    id: "hide",
    label: "Piel (cuero)",
    rawPrefix: "HIDE",
    refinedPrefix: "LEATHER",
    bonusCity: "Martlock",
  },
  {
    id: "wood",
    label: "Madera (tablones)",
    rawPrefix: "WOOD",
    refinedPrefix: "PLANKS",
    bonusCity: "Fort Sterling",
  },
  {
    id: "stone",
    label: "Piedra (bloques)",
    rawPrefix: "ROCK",
    refinedPrefix: "STONEBLOCK",
    bonusCity: "Bridgewatch",
  },
];

const RAW_QUANTITY: Record<number, number> = {
  2: 1,
  3: 2,
  4: 2,
  5: 3,
  6: 4,
  7: 5,
  8: 5,
};

export interface RefineIngredient {
  itemId: string;
  quantity: number;
  label: string;
}

export interface RefineRecipe {
  outputItemId: string;
  ingredients: RefineIngredient[];
}

function itemId(tier: number, prefix: string, suffix = ""): string {
  return `T${tier}_${prefix}${suffix}`;
}

function enchantSuffix(enchant: number): string {
  if (enchant <= 0) return "";
  return `_LEVEL${enchant}@${enchant}`;
}

export function refineRecipe(
  group: ResourceGroup,
  tier: number,
  enchant = 0
): RefineRecipe {
  const suffix = enchantSuffix(enchant);
  const enchantLabel = enchant > 0 ? ` @${enchant}` : "";
  const ingredients: RefineIngredient[] = [
    {
      itemId: itemId(tier, group.rawPrefix, suffix),
      quantity: RAW_QUANTITY[tier] ?? 1,
      label: `${group.label} (raw T${tier}${enchantLabel})`,
    },
  ];
  if (tier > 2) {
    // T3 y T4 usan el refinado del tier anterior sin encantar
    // (T2 nunca tiene encantamiento; T4 es una excepcion oficial).
    const prevSuffix = enchant > 0 && tier >= 5 ? enchantSuffix(enchant) : "";
    ingredients.push({
      itemId: itemId(tier - 1, group.refinedPrefix, prevSuffix),
      quantity: 1,
      label: `${group.label} (refinado T${tier - 1}${prevSuffix ? ` @${enchant}` : ""})`,
    });
  }
  return {
    outputItemId: itemId(tier, group.refinedPrefix, suffix),
    ingredients,
  };
}

export const REFINE_TIERS = [2, 3, 4, 5, 6, 7, 8];

export const REFINE_ENCHANTS = [0, 1, 2, 3, 4] as const;

export const ENCHANT_LABELS: Record<number, string> = {
  0: "Sin encantar",
  1: ".1 (Raro poco común)",
  2: ".2 (Raro)",
  3: ".3 (Excepcional)",
  4: ".4 (Pristino)",
};
