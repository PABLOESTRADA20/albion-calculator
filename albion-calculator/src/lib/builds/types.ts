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

export interface BuildItemSpec {
  slot: BuildSlot;
  /** ID de referencia con tier 4 (p. ej. "T4_2H_DAGGERPAIR"). */
  baseId: string;
  /** Tier real del item en la build (4..8). */
  tier: number;
  /** Overenchant (0..4). */
  enchant: number;
}

export interface Build {
  id: string;
  mode: BuildMode;
  category: PvPCategory | PvECategory;
  name: string;
  role: string;
  difficulty: 1 | 2 | 3;
  description: string;
  pros: string[];
  cons: string[];
  items: BuildItemSpec[];
}

export const DIFFICULTY_LABELS: Record<1 | 2 | 3, string> = {
  1: "Fácil",
  2: "Media",
  3: "Difícil",
};

/** Resuelve el ID de mercado (con tier y overenchant) de un item de build. */
export function buildItemId(
  spec: Pick<BuildItemSpec, "baseId" | "tier" | "enchant">
): string {
  const base = spec.baseId.replace(/^T\d_/, `T${spec.tier}_`);
  return spec.enchant > 0 ? `${base}@${spec.enchant}` : base;
}
