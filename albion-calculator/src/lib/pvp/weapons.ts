import type { Build } from "@/lib/builds/types";

/** Familias de armas reconocidas por PvP Analytics (curadas del juego). */
export const WEAPON_FAMILIES = [
  "Bloodletter",
  "Dagger",
  "Dagger Pair",
  "Claws",
  "Sword",
  "Dual Swords",
  "Mace",
  "Heavy Mace",
  "Hammer",
  "Great Hammer",
  "Quarterstaff",
  "Double Bladed",
  "Spear",
  "Pike",
  "Glaive",
  "Battleaxe",
  "Greataxe",
  "Halberd",
  "Bow",
  "Warbow",
  "Longbow",
  "Crossbow",
  "Fire",
  "Frost",
  "Curse",
  "Arcane",
  "Nature",
  "Holy",
  "Shapeshifter",
  "War Gloves",
] as const;

export type WeaponFamily = (typeof WEAPON_FAMILIES)[number];

export const UNKNOWN_WEAPON = "Otra arma";
export type WeaponFamilyKey = WeaponFamily | typeof UNKNOWN_WEAPON;

/** Sufijos de artefactos/ediciones que se ignoran al identificar la familia. */
const ARTIFACT_SUFFIXES = [
  "CRYSTAL",
  "HELL",
  "MORGANA",
  "KEEPER",
  "AVALON",
  "UNDEAD",
  "ROYAL",
  "HELLGATE",
  "MISTS",
] as const;

/** Núcleo del id (sin tier ni @enchant ni sufijo de artefacto) → familia. */
const CORE_TO_FAMILY: Record<string, WeaponFamily> = {
  MAIN_KNIFE: "Bloodletter",
  MAIN_DAGGER: "Dagger",
  "2H_DAGGERPAIR": "Dagger Pair",
  "2H_CLAWS": "Claws",
  "2H_DUALDAGGER": "Dagger Pair",
  MAIN_SWORD: "Sword",
  "2H_SWORD": "Sword",
  "2H_DUALSWORD": "Dual Swords",
  "2H_DUALSCIMITAR": "Dual Swords",
  "2H_SCIMITAR": "Sword",
  MAIN_SCIMITAR: "Sword",
  MAIN_MACE: "Mace",
  "2H_MACE": "Heavy Mace",
  "2H_HEAVYMACE": "Heavy Mace",
  MAIN_HAMMER: "Hammer",
  "2H_HAMMER": "Great Hammer",
  "2H_QUARTERSTAFF": "Quarterstaff",
  MAIN_QUARTERSTAFF: "Quarterstaff",
  "2H_DOUBLEBLADEDSTAFF": "Double Bladed",
  MAIN_SPEAR: "Spear",
  "2H_SPEAR": "Pike",
  "2H_GLAIVE": "Glaive",
  "2H_HARPOON": "Spear",
  MAIN_AXE: "Battleaxe",
  "2H_AXE": "Battleaxe",
  "2H_GREATAXE": "Greataxe",
  "2H_DUALAXE": "Battleaxe",
  "2H_HALBERD": "Halberd",
  MAIN_BOW: "Bow",
  "2H_BOW": "Bow",
  "2H_WARBOW": "Warbow",
  "2H_LONGBOW": "Longbow",
  "2H_CROSSBOW": "Crossbow",
  "2H_BOLTCASTER": "Crossbow",
  MAIN_FIRESTAFF: "Fire",
  "2H_FIRESTAFF": "Fire",
  "2H_INFERNALSTAFF": "Fire",
  MAIN_FROSTSTAFF: "Frost",
  "2H_FROSTSTAFF": "Frost",
  "2H_ICECRYSTAL": "Frost",
  "2H_ICEGAUNTLETS": "Frost",
  "2H_GLACIALSTAFF": "Frost",
  MAIN_CURSEDSTAFF: "Curse",
  "2H_CURSEDSTAFF": "Curse",
  MAIN_UNHOLYSTAFF: "Curse",
  "2H_SHADOWCALLER": "Curse",
  MAIN_ARCANESTAFF: "Arcane",
  "2H_ARCANESTAFF": "Arcane",
  "2H_ENIGMATICSTAFF": "Arcane",
  "2H_ENIGMATICORB": "Arcane",
  "2H_CRYSTALARCANE": "Arcane",
  NATURE_STAFF: "Nature",
  "2H_NATURESTAFF": "Nature",
  MAIN_HOLYSTAFF: "Holy",
  "2H_HOLYSTAFF": "Holy",
  "2H_DIVINESTAFF": "Holy",
  "2H_WILDSTAFF": "Nature",
  "2H_BLISTERSTAFF": "Nature",
  "2H_BLIGHTSTAFF": "Nature",
  "2H_SHAPESHIFTER": "Shapeshifter",
  "2H_IRONGAUNTLETS": "War Gloves",
  "2H_BATTLEBRACERS": "War Gloves",
};

/**
 * Familia de un id de arma real (ej: "T6_MAIN_KNIFE@2" o "T8_2H_MACE_HELL").
 * Devuelve UNKNOWN_WEAPON si el id no se reconoce: nunca inventa familias.
 */
export function weaponFamilyOfItemId(itemId: string): WeaponFamilyKey {
  if (!itemId) return UNKNOWN_WEAPON;
  const core = itemId.replace(/@\d+$/, "").replace(/^T\d+_/, "");
  if (CORE_TO_FAMILY[core]) return CORE_TO_FAMILY[core];
  for (const suffix of ARTIFACT_SUFFIXES) {
    const stripped = core.endsWith(`_${suffix}`) ? core.slice(0, -(suffix.length + 1)) : "";
    if (stripped && CORE_TO_FAMILY[stripped]) return CORE_TO_FAMILY[stripped];
  }
  return UNKNOWN_WEAPON;
}

/** Familia del arma principal de una build del catalogo (slot weapon). */
export function buildWeaponFamily(build: Build): WeaponFamilyKey {
  const weapon = build.items.find((s) => s.slot === "weapon");
  if (!weapon) return UNKNOWN_WEAPON;
  return weaponFamilyOfItemId(weapon.baseId);
}