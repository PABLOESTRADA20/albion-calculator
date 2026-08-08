// Universo de items del scanner: los que aparecen en las builds del planificador
// + liquidos comunes, expandidos a los tiers 4-6 (economia = mas volumen).

import type { BuildItemSpec } from "@/lib/builds/types";
import { buildItemId } from "@/lib/builds/types";
import { PVE_BUILDS } from "@/data/builds/pve";
import { PVP_BUILDS } from "@/data/builds/pvp";

const EXTRA_LIQUID_ITEMS: BuildItemSpec[] = [
  // Potions (todas las calidades comunes del tier 4)
  { slot: "potion", baseId: "T4_POTION_ENERGY", tier: 4, enchant: 0 },
  { slot: "potion", baseId: "T4_POTION_BERSERK", tier: 4, enchant: 0 },
  { slot: "potion", baseId: "T4_POTION_GATHER", tier: 4, enchant: 0 },
  { slot: "potion", baseId: "T4_POTION_LAVA", tier: 4, enchant: 0 },
  { slot: "potion", baseId: "T4_POTION_TORNADO", tier: 4, enchant: 0 },
  // Armas/armaduras comunes de cada arbol
  { slot: "weapon", baseId: "T4_MAIN_SWORD", tier: 4, enchant: 0 },
  { slot: "weapon", baseId: "T4_2H_BOW", tier: 4, enchant: 0 },
  { slot: "weapon", baseId: "T4_2H_SPEAR", tier: 4, enchant: 0 },
  { slot: "weapon", baseId: "T4_MAIN_SPEAR", tier: 4, enchant: 0 },
  { slot: "weapon", baseId: "T4_MAIN_DAGGER", tier: 4, enchant: 0 },
  { slot: "weapon", baseId: "T4_2H_CURSEDSTAFF", tier: 4, enchant: 0 },
  { slot: "weapon", baseId: "T4_MAIN_ARCANESTAFF", tier: 4, enchant: 0 },
  { slot: "weapon", baseId: "T4_2H_HOLYSTAFF", tier: 4, enchant: 0 },
  { slot: "offhand", baseId: "T4_OFF_SHIELD", tier: 4, enchant: 0 },
  { slot: "head", baseId: "T4_HEAD_CLOTH_SET1", tier: 4, enchant: 0 },
  { slot: "chest", baseId: "T4_ARMOR_CLOTH_SET1", tier: 4, enchant: 0 },
  { slot: "shoes", baseId: "T4_SHOES_CLOTH_SET1", tier: 4, enchant: 0 },
  { slot: "head", baseId: "T4_HEAD_LEATHER_SET2", tier: 4, enchant: 0 },
  { slot: "chest", baseId: "T4_ARMOR_LEATHER_SET2", tier: 4, enchant: 0 },
  { slot: "shoes", baseId: "T4_SHOES_LEATHER_SET2", tier: 4, enchant: 0 },
  { slot: "head", baseId: "T4_HEAD_PLATE_SET1", tier: 4, enchant: 0 },
  { slot: "chest", baseId: "T4_ARMOR_PLATE_SET1", tier: 4, enchant: 0 },
  { slot: "shoes", baseId: "T4_SHOES_PLATE_SET1", tier: 4, enchant: 0 },
  // Capas de faccion y capas artefacto
  { slot: "cape", baseId: "T4_CAPEITEM_FW_FORTSTERLING", tier: 4, enchant: 0 },
  { slot: "cape", baseId: "T4_CAPEITEM_FW_BRECILIEN", tier: 4, enchant: 0 },
  { slot: "cape", baseId: "T4_CAPEITEM_DEMON", tier: 4, enchant: 0 },
  { slot: "cape", baseId: "T4_CAPEITEM_HERETIC", tier: 4, enchant: 0 },
  { slot: "cape", baseId: "T4_CAPEITEM_KEEPER", tier: 4, enchant: 0 },
  { slot: "cape", baseId: "T4_CAPEITEM_MORGANA", tier: 4, enchant: 0 },
  { slot: "cape", baseId: "T4_CAPEITEM_AVALON", tier: 4, enchant: 0 },
  // Monturas
  { slot: "mount", baseId: "T4_MOUNT_OX", tier: 4, enchant: 0 },
  { slot: "mount", baseId: "T4_MOUNT_GIANTSTAG", tier: 4, enchant: 0 },
];

// Expandir cada item base a tiers 4-6 manteniendo el slot.
function expand(spec: BuildItemSpec): BuildItemSpec[] {
  const out: BuildItemSpec[] = [];
  for (const tier of [4, 5, 6]) {
    out.push({ ...spec, tier });
  }
  return out;
}

const allSpecs: BuildItemSpec[] = [
  ...PVP_BUILDS.flatMap((b) => b.items),
  ...PVE_BUILDS.flatMap((b) => b.items),
  ...EXTRA_LIQUID_ITEMS,
];

export const SCAN_UNIVERSE: BuildItemSpec[] = allSpecs.flatMap(expand);

/** IDs de mercado unicos del universo (sin repetir entre builds). */
export const SCAN_UNIVERSE_IDS: string[] = Array.from(
  new Set(SCAN_UNIVERSE.map((s) => buildItemId(s)))
);
