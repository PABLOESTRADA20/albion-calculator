export type BuildMode = "pvp" | "pve";

export const PVP_CATEGORIES = [
  "Solo PvP",
  "Open World",
  "Ganking",
  "Small Scale",
  "ZvZ",
  "Hellgates",
  "Corrupted",
  "Arena",
  "Crystal League",
] as const;

export const PVE_CATEGORIES = [
  "Solo",
  "Group",
  "Fame Farming",
  "Open World",
  "Mists",
  "Avalonian",
  "Static",
  "HCE",
  "Tracking",
] as const;

export type PvPCategory = (typeof PVP_CATEGORIES)[number];
export type PvECategory = (typeof PVE_CATEGORIES)[number];

export const BUILD_SLOTS = [
  "weapon",
  "offhand",
  "head",
  "chest",
  "shoes",
  "cape",
  "potion",
  "mount",
] as const;

export type BuildSlot = (typeof BUILD_SLOTS)[number];

export const SLOT_LABELS: Record<BuildSlot, string> = {
  weapon: "Arma",
  offhand: "Mano izquierda",
  head: "Casco",
  chest: "Armadura",
  shoes: "Botas",
  cape: "Capa",
  potion: "Poción",
  mount: "Montura",
};

/** Actividades de Roads of Avalon (modelo del dashboard). */
export const AVALON_ACTIVITIES = [
  "pve",
  "pvp",
  "loot",
  "gathering",
  "exploration",
  "transport",
] as const;

export type AvalonActivity = (typeof AVALON_ACTIVITIES)[number];

export const ACTIVITY_LABELS: Record<AvalonActivity, string> = {
  pve: "PvE",
  pvp: "PvP",
  loot: "Loot",
  gathering: "Gathering",
  exploration: "Exploración",
  transport: "Transporte",
};

/** Roles estructurales dentro de una composición de Roads. */
export const BUILD_ROLES = [
  "dps",
  "tank",
  "healer",
  "support",
  "bruiser",
] as const;

export type BuildRole = (typeof BUILD_ROLES)[number];

export const ROLE_LABELS: Record<BuildRole, string> = {
  dps: "DPS",
  tank: "Tank",
  healer: "Healer",
  support: "Support",
  bruiser: "Bruiser",
};

/** Categorías internas de la biblioteca de builds de Avalon. */
export const AVALON_BUILD_KINDS = [
  "solo",
  "allrounder",
  "healer",
  "tank",
  "dps",
  "support",
  "escape",
] as const;

export type AvalonBuildKind = (typeof AVALON_BUILD_KINDS)[number];

export const AVALON_KIND_LABELS: Record<AvalonBuildKind, string> = {
  solo: "Solo",
  allrounder: "All-Rounder",
  healer: "Healer",
  tank: "Tank",
  dps: "DPS",
  support: "Support",
  escape: "Escape",
};

export interface BuildItemSpec {
  slot: BuildSlot;
  /** ID de referencia con tier 4 (p. ej. "T4_2H_DAGGERPAIR"). */
  baseId: string;
  /** Tier real del item en la build (4..8). */
  tier: number;
  /** Overenchant (0..4). */
  enchant: number;
  /** Nombre del arma/objeto real cuando el id del dataset corresponde a la familia. */
  label?: string;
}

/** Puntuaciones subjetivas 1..10 usadas por Avalon (heurísticas orientativas). */
export interface BuildScores {
  pve: number;
  pvp: number;
  mobility: number;
  survivability: number;
}

export interface Build {
  id: string;
  mode: BuildMode;
  category: PvPCategory | PvECategory;
  name: string;
  role: string;
  difficulty: 1 | 2 | 3 | 4;
  description: string;
  pros: string[];
  cons: string[];
  items: BuildItemSpec[];
  /** Solo builds de Roads of Avalon. */
  avalon?: boolean;
  activity?: AvalonActivity;
  groupSize?: number;
  roleType?: BuildRole;
  tierRecommendation?: string;
  kind?: AvalonBuildKind;
  scores?: BuildScores;
}

export const DIFFICULTY_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Fácil",
  2: "Media",
  3: "Difícil",
  4: "Experto",
};

/** Resuelve el ID de mercado (con tier y overenchant) de un item de build. */
export function buildItemId(
  spec: Pick<BuildItemSpec, "baseId" | "tier" | "enchant">
): string {
  const base = spec.baseId.replace(/^T\d_/, `T${spec.tier}_`);
  return spec.enchant > 0 ? `${base}@${spec.enchant}` : base;
}