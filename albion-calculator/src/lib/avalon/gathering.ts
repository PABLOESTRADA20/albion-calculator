import { GATHER_ARMOR } from "@/data/avalon";
import { itemName } from "@/lib/builds/items";

export type GatheringProfession = "wood" | "ore" | "hide" | "fiber" | "stone";

export const GATHER_PROFESSION_LABELS: Record<GatheringProfession, string> = {
  wood: "Wood",
  ore: "Ore",
  hide: "Hide",
  fiber: "Fiber",
  stone: "Stone",
};

const TOOL_FAMILY: Record<GatheringProfession, string> = {
  wood: "TOOL_AXE",
  ore: "TOOL_PICK",
  hide: "TOOL_KNIFE",
  fiber: "TOOL_SICKLE",
  stone: "TOOL_HAMMER",
};

const ARMOR_PROFESSION: Record<GatheringProfession, "WOOD" | "ORE" | "HIDE" | "FIBER" | null> = {
  wood: "WOOD",
  ore: "ORE",
  hide: "HIDE",
  fiber: "FIBER",
  stone: null,
};

/** Herramienta avalonia T4-T8 (verificada contra el dataset). */
export function gatheringToolId(profession: GatheringProfession, tier: number): string {
  const t = Math.min(Math.max(tier, 4), 8);
  return `T${t}_2H_${TOOL_FAMILY[profession]}_AVALON`;
}

/**
 * Armadura de gathering por profesion y tier (T4-T8, verificada contra el
 * dataset). La piedra no tiene armadura propia en el juego: devuelve [].
 */
export function gatheringArmorIds(profession: GatheringProfession, tier: number): Omit<GatheringSuggestion, "exists">[] {
  const prof = ARMOR_PROFESSION[profession];
  if (!prof) return [];
  const t = Math.min(Math.max(tier, 4), 8);
  const body = GATHER_ARMOR[profession.toLowerCase() as "wood" | "ore" | "hide" | "fiber"];
  if (!body) return [];
  return [
    { itemId: `T${t}_${body.head}`, label: itemName(`T${t}_${body.head}`), slot: "armor" as const },
    { itemId: `T${t}_${body.chest}`, label: itemName(`T${t}_${body.chest}`), slot: "armor" as const },
    { itemId: `T${t}_${body.shoes}`, label: itemName(`T${t}_${body.shoes}`), slot: "armor" as const },
  ];
}

export interface GatheringSuggestion {
  itemId: string;
  label: string;
  slot: "main" | "armor";
  exists: boolean;
}

export interface GatheringPlan {
  profession: GatheringProfession;
  toolTier: number;
  toolId: string;
  toolLabel: string;
  armorItems: GatheringSuggestion[];
  stoneArmorAvailable: boolean;
  suggestions: GatheringSuggestion[];
}

/**
 * Plan de gathering para Roads of Avalon: herramienta avalonia + armadura de
 * la profesion. Los IDs siempre existen en el dataset (verificados); la
 * piedra queda sin armadura especial (no existe en el juego).
 */
export function gatheringPlan(profession: GatheringProfession, toolTier: number): GatheringPlan {
  const t = Math.min(Math.max(toolTier, 4), 8);
  const toolId = gatheringToolId(profession, t);
  const toolLabel = itemName(toolId);

  const armorBase = gatheringArmorIds(profession, t);
  const armorItems: GatheringSuggestion[] = armorBase.map((a) => ({ ...a, exists: true }));

  return {
    profession,
    toolTier: t,
    toolId,
    toolLabel,
    armorItems,
    stoneArmorAvailable: ARMOR_PROFESSION[profession] !== null,
    suggestions: [
      { itemId: toolId, label: toolLabel, slot: "main", exists: true },
      ...armorItems,
    ],
  };
}