export type ResourceKind = "wood" | "ore" | "hide" | "fiber" | "stone";

export const RESOURCE_LABELS: Record<ResourceKind, string> = {
  wood: "Wood",
  ore: "Ore",
  hide: "Hide",
  fiber: "Fiber",
  stone: "Stone",
};

export type ChestKind = "green" | "blue" | "avalonian";

export const CHEST_LABELS: Record<ChestKind, string> = {
  green: "Green Chest",
  blue: "Blue Chest",
  avalonian: "Avalonian Chest",
};

export interface AvalonMapStats {
  resourceDensity: number | null;
  chestDensity: number | null;
  dungeonDensity: number | null;
  estimatedDanger: number | null;
  estimatedProfit: number | null;
}

export interface AvalonMap {
  id: string;
  name: string;
  tier: 4 | 6 | 8;
  resources: ResourceKind[];
  chests: ChestKind[];
  soloDungeon: boolean;
  groupDungeon: boolean;
  portals: boolean;
  specialLocations: string[];
  /** Stats desconocidas: null = "Datos no disponibles" (nunca inventar). */
  stats: AvalonMapStats;
}

export const AVALON_MAP_TIERS = [4, 6, 8] as const;

export const MAP_FILTERS = {
  resources: Object.keys(RESOURCE_LABELS) as ResourceKind[],
  chests: Object.keys(CHEST_LABELS) as ChestKind[],
  dungeons: ["solo", "group"] as const,
};

/**
 * Directorio de mapas. No existen datos publicos estructurados de densidad
 * por mapa: la infraestructura esta lista (stats) pero los valores reales se
 * marcaran como null hasta que haya una fuente. Los mapas listados son los
 * perfiles genericos de contenido por tier que describe la guia oficial.
 */
export const AVALON_MAP_CATALOG: AvalonMap[] = [
  {
    id: "road-t4",
    name: "Road T4 (perfil genérico)",
    tier: 4,
    resources: ["wood", "ore", "hide", "fiber", "stone"],
    chests: ["green"],
    soloDungeon: true,
    groupDungeon: false,
    portals: true,
    specialLocations: [],
    stats: { resourceDensity: null, chestDensity: null, dungeonDensity: null, estimatedDanger: null, estimatedProfit: null },
  },
  {
    id: "road-t6",
    name: "Road T6 (perfil genérico)",
    tier: 6,
    resources: ["wood", "ore", "hide", "fiber", "stone"],
    chests: ["green", "blue"],
    soloDungeon: true,
    groupDungeon: true,
    portals: true,
    specialLocations: ["Zonas de recurso enchanted"],
    stats: { resourceDensity: null, chestDensity: null, dungeonDensity: null, estimatedDanger: null, estimatedProfit: null },
  },
  {
    id: "road-t8",
    name: "Road T8 (perfil genérico)",
    tier: 8,
    resources: ["wood", "ore", "hide", "fiber", "stone"],
    chests: ["green", "blue", "avalonian"],
    soloDungeon: true,
    groupDungeon: true,
    portals: true,
    specialLocations: ["Zonas de recurso enchanted", "Hideouts"],
    stats: { resourceDensity: null, chestDensity: null, dungeonDensity: null, estimatedDanger: null, estimatedProfit: null },
  },
];