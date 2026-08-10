import type { BuildItemSpec } from "@/lib/builds/types";
import type { Build } from "@/lib/builds/types";
import { item } from "@/data/avalon/solo";

const escapeBuild = (
  id: string,
  name: string,
  difficulty: 1 | 2 | 3 | 4,
  description: string,
  pros: string[],
  cons: string[],
  items: BuildItemSpec[],
  scores: { pve: number; pvp: number; mobility: number; survivability: number }
): Build => ({
  id: `avalon-escape-${id}`,
  avalon: true,
  mode: "pvp",
  category: "Solo PvP",
  kind: "escape",
  activity: "exploration",
  groupSize: 1,
  name,
  role: "Scout / Escape",
  roleType: "dps",
  difficulty,
  description,
  pros,
  cons,
  items,
  scores,
  tierRecommendation: "T4-T7",
});

export const AVALON_ESCAPE_BUILDS: Build[] = [
  escapeBuild(
    "bloodletter",
    "Bloodletter Escape",
    2,
    "Dash + execute: el escape clásico de las Roads. Cuando no puedes ganar, desapareces.",
    ["Doble dash", "Capa de Bridgewatch para la fuga"],
    ["Pierde frente a rat de CC"],
    [
      item("weapon", "T4_MAIN_DAGGER", { label: "Bloodletter (1H dagas)" }),
      item("head", "T4_HEAD_LEATHER_SET1"),
      item("chest", "T4_ARMOR_LEATHER_SET3"),
      item("shoes", "T4_SHOES_LEATHER_SET3"),
      item("cape", "T4_CAPEITEM_FW_BRIDGEWATCH"),
      item("potion", "T4_POTION_COOLDOWN"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
    { pve: 5, pvp: 9, mobility: 10, survivability: 8 }
  ),
  escapeBuild(
    "doublebladed",
    "Doble hoja Escape",
    1,
    "El bastón de doble hoja es velocidad pura: spin + spin hasta salir de la zona roja.",
    ["Velocidad constante", "Barata"],
    ["No ejecuta"],
    [
      item("weapon", "T4_2H_DOUBLEBLADEDSTAFF"),
      item("head", "T4_HEAD_LEATHER_SET2"),
      item("chest", "T4_ARMOR_LEATHER_SET1"),
      item("shoes", "T4_SHOES_LEATHER_SET3"),
      item("cape", "T4_CAPEITEM_FW_BRIDGEWATCH"),
      item("potion", "T4_POTION_COOLDOWN"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
    { pve: 4, pvp: 6, mobility: 10, survivability: 9 }
  ),
  escapeBuild(
    "bloodmoon",
    "Luna sangrienta Mobility",
    2,
    "Morph + curaciones: aguantas el burst inicial y escapas con el sustain del shapeshifter.",
    ["Sustain + escape", "Pelea de vuelta"],
    ["Cara"],
    [
      item("weapon", "T4_2H_SHAPESHIFTER_MORGANA"),
      item("head", "T4_HEAD_LEATHER_SET1"),
      item("chest", "T4_ARMOR_LEATHER_SET2"),
      item("shoes", "T4_SHOES_LEATHER_SET3"),
      item("cape", "T4_CAPEITEM_FW_BRIDGEWATCH"),
      item("potion", "T4_POTION_COOLDOWN"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
    { pve: 5, pvp: 8, mobility: 9, survivability: 8 }
  ),
  escapeBuild(
    "rat",
    "Rata / Scout",
    1,
    "La build cero riesgo: esquivar, espiar y lootear rápido. Capa de no-muerto para la salida imposible.",
    ["Invisible cuando toca", "Cero inversión"],
    ["No aporta en peleas"],
    [
      item("weapon", "T4_MAIN_DAGGER", { label: "Bloodletter (1H dagas)" }),
      item("head", "T4_HEAD_LEATHER_SET1"),
      item("chest", "T4_ARMOR_LEATHER_SET3"),
      item("shoes", "T4_SHOES_LEATHER_SET3"),
      item("cape", "T4_CAPEITEM_UNDEAD"),
      item("potion", "T4_POTION_COOLDOWN"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
    { pve: 4, pvp: 7, mobility: 10, survivability: 7 }
  ),
  escapeBuild(
    "gathering",
    "Gathering Escape",
    2,
    "Set de recolector + doble hoja: la build para farmear recursos y salir corriendo con el botín.",
    ["Agilidad de doble hoja", "Ropa de recolector para el carry"],
    ["Sin daño"],
    [
      item("weapon", "T4_2H_DOUBLEBLADEDSTAFF"),
      item("head", "T4_HEAD_GATHERER_HIDE"),
      item("chest", "T4_ARMOR_GATHERER_HIDE"),
      item("shoes", "T4_SHOES_GATHERER_HIDE"),
      item("cape", "T4_CAPEITEM_FW_BRIDGEWATCH"),
      item("potion", "T4_POTION_COOLDOWN"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
    { pve: 4, pvp: 6, mobility: 9, survivability: 8 }
  ),
];