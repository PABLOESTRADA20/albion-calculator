import type { Build, PvECategory } from "@/lib/builds/types";

const item = (slot: Build["items"][number]["slot"], baseId: string, tier = 4) => ({
  slot,
  baseId,
  tier,
  enchant: 0,
});

export const PVE_BUILDS: Build[] = [
  {
    id: "pve-blazing-solo",
    mode: "pve",
    category: "Solo",
    name: "Bastón flamígero",
    role: "DPS / AoE",
    difficulty: 1,
    description:
      "Blazing Staff con set de erudito para farmear mobs en solitario: la pasiva de Thetford y el meteorito limpian packs enteros.",
    pros: [
      "Limpia packs gigantes en segundos",
      "Barata y sencilla de jugar",
    ],
    cons: [
      "Muy frágil si te alcanzan",
      "Depende de la energía",
    ],
    items: [
      item("weapon", "T4_2H_INFERNOSTAFF_MORGANA"),
      item("head", "T4_HEAD_CLOTH_SET1"),
      item("chest", "T4_ARMOR_CLOTH_SET1"),
      item("shoes", "T4_SHOES_CLOTH_SET1"),
      item("cape", "T4_CAPEITEM_FW_THETFORD"),
      item("potion", "T4_POTION_HEAL"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pve-battleaxe-solo",
    mode: "pve",
    category: "Solo",
    name: "Hacha de guerra",
    role: "DPS / Bruiser",
    difficulty: 2,
    description:
      "Battleaxe con escudo y set de clérigo: supervivencia por la sangría y sustento constante.",
    pros: [
      "Supervivencia por el sangrado",
      "Aguanta peleas largas",
    ],
    cons: [
      "Limpieza media",
      "Poco burst",
    ],
    items: [
      item("weapon", "T4_MAIN_AXE"),
      item("offhand", "T4_OFF_SHIELD"),
      item("head", "T4_HEAD_CLOTH_SET2"),
      item("chest", "T4_ARMOR_CLOTH_SET2"),
      item("shoes", "T4_SHOES_CLOTH_SET2"),
      item("cape", "T4_CAPEITEM_FW_MARTLOCK"),
      item("potion", "T4_POTION_HEAL"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pve-greatnature-solo",
    mode: "pve",
    category: "Solo",
    name: "Gran bastón natural",
    role: "Healer / DPS",
    difficulty: 1,
    description:
      "Great Nature Staff con set de mago: el espíritu te mantiene vivo mientras farmeas sin parar.",
    pros: [
      "Autocuración pasiva muy fuerte",
      "Puede kitingear packs enormes",
    ],
    cons: [
      "Daño lento",
      "Requiere mantener el espíritu activo",
    ],
    items: [
      item("weapon", "T4_2H_NATURESTAFF"),
      item("head", "T4_HEAD_CLOTH_SET3"),
      item("chest", "T4_ARMOR_CLOTH_SET3"),
      item("shoes", "T4_SHOES_CLOTH_SET3"),
      item("cape", "T4_CAPEITEM_FW_MARTLOCK"),
      item("potion", "T4_POTION_HEAL"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pve-cursed-group",
    mode: "pve",
    category: "Group",
    name: "Bastón maldito de ruinas",
    role: "DPS / AoE",
    difficulty: 2,
    description:
      "Cursed Staff de 1 mano para ruinas y mazmorras de grupo: daño en área con el set de diablo.",
    pros: [
      "Buen daño en área",
      "Control con las maldiciones",
    ],
    cons: [
      "Necesita posicionarse bien",
      "Frágil en tanqueo",
    ],
    items: [
      item("weapon", "T4_MAIN_CURSEDSTAFF"),
      item("offhand", "T4_OFF_BOOK"),
      item("head", "T4_HEAD_CLOTH_HELL"),
      item("chest", "T4_ARMOR_CLOTH_HELL"),
      item("shoes", "T4_SHOES_CLOTH_HELL"),
      item("cape", "T4_CAPEITEM_UNDEAD"),
      item("potion", "T4_POTION_COOLDOWN"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pve-holy-group",
    mode: "pve",
    category: "Group",
    name: "Healer de grupo",
    role: "Healer",
    difficulty: 1,
    description:
      "Holy Staff de 1 mano con libro para mantener a todo el grupo en ruinas, cámaras y mazmorras.",
    pros: [
      "Curación de grupo fiable",
      "Siempre hay hueco en grupos",
    ],
    cons: [
      "Mucha presión",
      "Bajo daño personal",
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
  {
    id: "pve-daggerpair-fame",
    mode: "pve",
    category: "Fame Farming",
    name: "Daga doble famer",
    role: "DPS / AoE",
    difficulty: 2,
    description:
      "Dagger Pair con set de asesino para rotar las cuchillas y hacer trueno en cada pack: farm de fama rapidísimo.",
    pros: [
      "Fama por hora altísima",
      "Rotación simple de repetir",
    ],
    cons: [
      "Requiere fluidez con las cuchillas",
      "Muy frágil",
    ],
    items: [
      item("weapon", "T4_2H_DAGGERPAIR"),
      item("head", "T4_HEAD_LEATHER_SET3"),
      item("chest", "T4_ARMOR_LEATHER_SET3"),
      item("shoes", "T4_SHOES_LEATHER_SET3"),
      item("cape", "T4_CAPEITEM_FW_THETFORD"),
      item("potion", "T4_POTION_COOLDOWN"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pve-bracers-openworld",
    mode: "pve",
    category: "Open World",
    name: "Brazales de batalla",
    role: "DPS / Bruiser",
    difficulty: 2,
    description:
      "Battle Bracers con set de cazador para farmear mundo abierto aguantando peleas largas.",
    pros: [
      "Ritmo de daño constante",
      "Aguanta enganches inesperados",
    ],
    cons: [
      "Alcance corto",
      "Limpieza media",
    ],
    items: [
      item("weapon", "T4_2H_KNUCKLES_SET2"),
      item("head", "T4_HEAD_LEATHER_SET2"),
      item("chest", "T4_ARMOR_LEATHER_SET2"),
      item("shoes", "T4_SHOES_LEATHER_SET2"),
      item("cape", "T4_CAPEITEM_FW_LYMHURST"),
      item("potion", "T4_POTION_HEAL"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pve-dualswords-mists",
    mode: "pve",
    category: "Mists",
    name: "Dos espadas en la niebla",
    role: "DPS / Melee",
    difficulty: 2,
    description:
      "Dual Swords con set de mercenario: daño sostenido y sustento para sobrevivir a la niebla y sus amenazas.",
    pros: [
      "Daño sostenido sólido",
      "Sustento del set mercenario",
    ],
    cons: [
      "Requiere pelea cuerpo a cuerpo",
      "Medio en burst",
    ],
    items: [
      item("weapon", "T4_2H_DUALSWORD"),
      item("head", "T4_HEAD_LEATHER_SET1"),
      item("chest", "T4_ARMOR_LEATHER_SET1"),
      item("shoes", "T4_SHOES_LEATHER_SET1"),
      item("cape", "T4_CAPEITEM_FW_CAERLEON"),
      item("potion", "T4_POTION_HEAL"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pve-astral-avalon",
    mode: "pve",
    category: "Avalonian",
    name: "Bastón astral",
    role: "DPS / AoE",
    difficulty: 2,
    description:
      "Astral Staff con set de clérigo: daño en área constante para ruinas avalonianas y mazmorras grandes.",
    pros: [
      "Daño en área continuo",
      "Muy eficaz contra packs grandes",
    ],
    cons: [
      "Poco burst",
      "Requiere energía",
    ],
    items: [
      item("weapon", "T4_2H_ARCANESTAFF_CRYSTAL"),
      item("head", "T4_HEAD_CLOTH_SET2"),
      item("chest", "T4_ARMOR_CLOTH_SET2"),
      item("shoes", "T4_SHOES_CLOTH_SET2"),
      item("cape", "T4_CAPEITEM_FW_MARTLOCK"),
      item("potion", "T4_POTION_ENERGY"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pve-frost-static",
    mode: "pve",
    category: "Static",
    name: "Hielo en estáticas",
    role: "DPS / Control",
    difficulty: 2,
    description:
      "Great Frost Staff con set de clérigo para congelar y ralentizar mientras el grupo limpia la mazmorra estática.",
    pros: [
      "Control de masas para el grupo",
      "Seguro a distancia",
    ],
    cons: [
      "Daño medio",
      "Ritmo más lento en solitario",
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
    id: "pve-fire-tracking",
    mode: "pve",
    category: "Tracking",
    name: "Bastón ígneo de tracking",
    role: "DPS / Burst",
    difficulty: 3,
    description:
      "Fire Staff de 1 mano con antorcha para burstear a los jefes de tracking antes de que escapen.",
    pros: [
      "Burst rapidísimo con la antorcha",
      "Kites fácil al boss",
    ],
    cons: [
      "Requiere precisión",
      "Frágil ante los súbditos del boss",
    ],
    items: [
      item("weapon", "T4_MAIN_FIRESTAFF"),
      item("offhand", "T4_OFF_TORCH"),
      item("head", "T4_HEAD_CLOTH_SET2"),
      item("chest", "T4_ARMOR_CLOTH_SET2"),
      item("shoes", "T4_SHOES_CLOTH_SET2"),
      item("cape", "T4_CAPEITEM_FW_THETFORD"),
      item("potion", "T4_POTION_COOLDOWN"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
  {
    id: "pve-holy-hce",
    mode: "pve",
    category: "HCE",
    name: "Gran bastón sagrado HCE",
    role: "Healer",
    difficulty: 3,
    description:
      "Great Holy Staff para HCE: curaciones en área potentes para mantener al equipo en las oleadas más duras.",
    pros: [
      "Curación en área enorme",
      "Rol imprescindible en HCE",
    ],
    cons: [
      "Exige disciplina de posición",
      "Sin grupo no vale nada",
    ],
    items: [
      item("weapon", "T4_2H_HOLYSTAFF"),
      item("head", "T4_HEAD_CLOTH_SET3"),
      item("chest", "T4_ARMOR_CLOTH_SET3"),
      item("shoes", "T4_SHOES_CLOTH_SET3"),
      item("cape", "T4_CAPEITEM_FW_THETFORD"),
      item("potion", "T4_POTION_ENERGY"),
      item("mount", "T4_MOUNT_HORSE"),
    ],
  },
];

export const PVE_CATEGORIES_LIST: PvECategory[] = [
  "Solo",
  "Group",
  "Fame Farming",
  "Open World",
  "Mists",
  "Avalonian",
  "Static",
  "HCE",
  "Tracking",
];
