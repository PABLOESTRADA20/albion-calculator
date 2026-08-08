import type { Build, PvPCategory } from "@/lib/builds/types";

const item = (slot: Build["items"][number]["slot"], baseId: string, tier = 4) => ({
  slot,
  baseId,
  tier,
  enchant: 0,
});

export const PVP_BUILDS: Build[] = [
  {
    id: "pvp-bloodletter-solo",
    mode: "pvp",
    category: "Solo PvP",
    name: "Bloodletter de asalto",
    role: "DPS / Assassin",
    difficulty: 3,
    description:
      "Burst de Bloodletter con antorcha para acelerar la rotación. Ideal en mazmorras corruptas y peleas rápidas 1v1.",
    pros: [
      "Rotación muy rápida con la antorcha",
      "Huida limpia con Bloodletter + capa de Bridgewatch",
    ],
    cons: [
      "Requiere precisión en la rotación",
      "Frágil si falla el burst",
    ],
    items: [
      item("weapon", "T4_MAIN_RAPIER_MORGANA"),
      item("offhand", "T4_OFF_TORCH"),
      item("head", "T4_HEAD_LEATHER_SET3"),
      item("chest", "T4_ARMOR_LEATHER_HELL"),
      item("shoes", "T4_SHOES_LEATHER_SET3"),
      item("cape", "T4_CAPEITEM_FW_BRIDGEWATCH"),
      item("potion", "T4_POTION_HEAL"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pvp-cursed-solo",
    mode: "pvp",
    category: "Solo PvP",
    name: "Bastón maldito kiter",
    role: "DPS / Kiter",
    difficulty: 3,
    description:
      "Cursed Staff de 1 mano con libro para castigar a quien se acerque. Control a distancia y sangrado acumulativo.",
    pros: [
      "Gran daño de control a distancia",
      "Capa de muerto viviente para segundo aire",
    ],
    cons: [
      "Vulnerable si te alcanzan",
      "Poco daño directo a corta distancia",
    ],
    items: [
      item("weapon", "T4_MAIN_CURSEDSTAFF"),
      item("offhand", "T4_OFF_BOOK"),
      item("head", "T4_HEAD_CLOTH_SET2"),
      item("chest", "T4_ARMOR_CLOTH_SET2"),
      item("shoes", "T4_SHOES_CLOTH_SET2"),
      item("cape", "T4_CAPEITEM_UNDEAD"),
      item("potion", "T4_POTION_HEAL"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pvp-halberd-openworld",
    mode: "pvp",
    category: "Open World",
    name: "Alabarda bruiser",
    role: "DPS / Bruiser",
    difficulty: 2,
    description:
      "Alabarda con armadura de caballero para aguantar el castigo mientras limpias grupos. Sencilla y efectiva.",
    pros: [
      "Daño en área sólido",
      "Bastante supervivencia en 1vX",
    ],
    cons: [
      "Movilidad limitada",
      "Lenta contra kitters",
    ],
    items: [
      item("weapon", "T4_2H_HALBERD"),
      item("head", "T4_HEAD_PLATE_SET2"),
      item("chest", "T4_ARMOR_PLATE_SET2"),
      item("shoes", "T4_SHOES_PLATE_SET2"),
      item("cape", "T4_CAPEITEM_FW_LYMHURST"),
      item("potion", "T4_POTION_HEAL"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pvp-bearpaws-openworld",
    mode: "pvp",
    category: "Open World",
    name: "Patas de oso",
    role: "DPS / Melee",
    difficulty: 3,
    description:
      "Bear Paws con set de cazador para rotaciones de gancho y burst. Excelente para peleas en niebla o grupos de caza.",
    pros: [
      "Gancho + burst devastador",
      "Buenas peleas en niebla",
    ],
    cons: [
      "Requiere buen timing del gancho",
      "Debil contra targets con huida infinita",
    ],
    items: [
      item("weapon", "T4_2H_DUALAXE_KEEPER"),
      item("head", "T4_HEAD_LEATHER_SET2"),
      item("chest", "T4_ARMOR_LEATHER_SET2"),
      item("shoes", "T4_SHOES_LEATHER_SET2"),
      item("cape", "T4_CAPEITEM_FW_THETFORD"),
      item("potion", "T4_POTION_HEAL"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pvp-warbow-gank",
    mode: "pvp",
    category: "Ganking",
    name: "Arco de guerra de caza",
    role: "DPS / Disabler",
    difficulty: 3,
    description:
      "Warbow con escarcha del arco y veneno para cazar monturas y pickear en zonas negras.",
    pros: [
      "Lentitud y veneno para derribar monturas",
      "Alcance para pelear desde lejos",
    ],
    cons: [
      "Muy frágil si te pegan",
      "Daño sostenido bajo",
    ],
    items: [
      item("weapon", "T4_2H_WARBOW"),
      item("head", "T4_HEAD_CLOTH_SET1"),
      item("chest", "T4_ARMOR_LEATHER_SET1"),
      item("shoes", "T4_SHOES_LEATHER_SET1"),
      item("cape", "T4_CAPEITEM_FW_CAERLEON"),
      item("potion", "T4_POTION_COOLDOWN"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pvp-fire-smallscale",
    mode: "pvp",
    category: "Small Scale",
    name: "Gran bastón ígneo",
    role: "DPS / AoE",
    difficulty: 2,
    description:
      "Great Fire Staff con set de diablo para castigar agrupaciones en peleas pequeñas y grupales.",
    pros: [
      "Burst en área con la pasiva de Thetford",
      "Control con la armadura de diablo",
    ],
    cons: [
      "Meteorito fácil de esquivar",
      "Necesita pelea agrupada",
    ],
    items: [
      item("weapon", "T4_2H_FIRESTAFF"),
      item("head", "T4_HEAD_CLOTH_HELL"),
      item("chest", "T4_ARMOR_CLOTH_HELL"),
      item("shoes", "T4_SHOES_CLOTH_HELL"),
      item("cape", "T4_CAPEITEM_FW_THETFORD"),
      item("potion", "T4_POTION_HEAL"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pvp-arcane-zvz",
    mode: "pvp",
    category: "ZvZ",
    name: "Gran bastón arcano",
    role: "Support / Zerg",
    difficulty: 1,
    description:
      "Great Arcane Staff para amplificar y controlar en peleas de masas. Rol de apoyo imprescindible en ZvZ.",
    pros: [
      "Amplificador y control de masas",
      "Fácil de jugar en cola",
    ],
    cons: [
      "Daño personal bajo",
      "Depende del grupo",
    ],
    items: [
      item("weapon", "T4_2H_ARCANESTAFF"),
      item("head", "T4_HEAD_CLOTH_SET2"),
      item("chest", "T4_ARMOR_CLOTH_SET2"),
      item("shoes", "T4_SHOES_CLOTH_SET2"),
      item("cape", "T4_CAPEITEM_FW_MARTLOCK"),
      item("potion", "T4_POTION_HEAL"),
      item("mount", "T4_MOUNT_GIANTSTAG"),
    ],
  },
  {
    id: "pvp-daggerpair-hellgates",
    mode: "pvp",
    category: "Hellgates",
    name: "Daga doble 2v2",
    role: "DPS / Assassin",
    difficulty: 3,
    description:
      "Dagger Pair con capa de muerto viviente para huir tras el burst. Clásico de Hellgates 2v2.",
    pros: [
      "Burst de mayor pico del juego",
      "La capa undead permite resets agresivos",
    ],
    cons: [
      "Total dependencia del primer contacto",
      "Muy complicado contra tanks",
    ],
    items: [
      item("weapon", "T4_2H_DAGGERPAIR"),
      item("head", "T4_HEAD_LEATHER_SET3"),
      item("chest", "T4_ARMOR_LEATHER_SET3"),
      item("shoes", "T4_SHOES_LEATHER_SET3"),
      item("cape", "T4_CAPEITEM_UNDEAD"),
      item("potion", "T4_POTION_COOLDOWN"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pvp-blight-corrupted",
    mode: "pvp",
    category: "Corrupted",
    name: "Bastón de infortunio",
    role: "DPS / Drain",
    difficulty: 3,
    description:
      "Blight Staff con drenaje constante y capa de Bridgewatch para cerrar distancias en mazmorras corruptas.",
    pros: [
      "Sostenibilidad enorme por el drenaje",
      "Burst de la pasiva del blight",
    ],
    cons: [
      "Daño lento de acumular",
      "Frágil ante burst inmediato",
    ],
    items: [
      item("weapon", "T4_2H_NATURESTAFF_HELL"),
      item("head", "T4_HEAD_CLOTH_SET2"),
      item("chest", "T4_ARMOR_CLOTH_SET2"),
      item("shoes", "T4_SHOES_CLOTH_SET2"),
      item("cape", "T4_CAPEITEM_FW_BRIDGEWATCH"),
      item("potion", "T4_POTION_HEAL"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pvp-frost-arena",
    mode: "pvp",
    category: "Arena",
    name: "Gran bastón de hielo",
    role: "DPS / Control",
    difficulty: 2,
    description:
      "Great Frost Staff con set de clérigo para ralentizar, congelar y castigar en Arenas.",
    pros: [
      "Control de masas constante",
      "Fácil de mantener la distancia",
    ],
    cons: [
      "Daño medio",
      "Requiere buen posicionamiento",
    ],
    items: [
      item("weapon", "T4_2H_FROSTSTAFF"),
      item("head", "T4_HEAD_CLOTH_SET2"),
      item("chest", "T4_ARMOR_CLOTH_SET2"),
      item("shoes", "T4_SHOES_CLOTH_SET2"),
      item("cape", "T4_CAPEITEM_FW_FORTSTERLING"),
      item("potion", "T4_POTION_HEAL"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pvp-mace-crystal",
    mode: "pvp",
    category: "Crystal League",
    name: "Maza pesada tank",
    role: "Tank",
    difficulty: 2,
    description:
      "Heavy Mace con set de guardián para tankear, acorralar y peels en Crystal League.",
    pros: [
      "Supervivencia extrema",
      "Control de objetivos clave",
    ],
    cons: [
      "Daño muy bajo",
      "Depende del equipo para matar",
    ],
    items: [
      item("weapon", "T4_2H_MACE"),
      item("head", "T4_HEAD_PLATE_SET3"),
      item("chest", "T4_ARMOR_PLATE_SET3"),
      item("shoes", "T4_SHOES_PLATE_SET3"),
      item("cape", "T4_CAPEITEM_FW_BRIDGEWATCH"),
      item("potion", "T4_POTION_HEAL"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pvp-holy-healer",
    mode: "pvp",
    category: "Crystal League",
    name: "Bastón sagrado healer",
    role: "Healer",
    difficulty: 1,
    description:
      "Holy Staff de 1 mano con libro para curar de forma constante a tu equipo en Crystal League y Arenas.",
    pros: [
      "Curación continua muy fiable",
      "Rol siempre demandado",
    ],
    cons: [
      "Presión constante de los enemigos",
      "Depende del equipo para protegerte",
    ],
    items: [
      item("weapon", "T4_MAIN_HOLYSTAFF"),
      item("offhand", "T4_OFF_BOOK"),
      item("head", "T4_HEAD_CLOTH_SET3"),
      item("chest", "T4_ARMOR_CLOTH_SET3"),
      item("shoes", "T4_SHOES_CLOTH_SET3"),
      item("cape", "T4_CAPEITEM_FW_THETFORD"),
      item("potion", "T4_POTION_ENERGY"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
];

export const PVP_CATEGORIES_LIST: PvPCategory[] = [
  "Solo PvP",
  "Open World",
  "Ganking",
  "Small Scale",
  "ZvZ",
  "Hellgates",
  "Corrupted",
  "Arena",
  "Crystal League",
];
