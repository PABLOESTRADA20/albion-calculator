import type { AvalonActivity, Build } from "@/lib/builds/types";
import type { BuildItemSpec } from "@/lib/builds/types";
import { avalonBuildById } from "@/data/avalon";

export type CompositionKind = "duo" | "trio" | "fiveman" | "roaming";

export const COMPOSITION_KIND_LABELS: Record<CompositionKind, string> = {
  duo: "Duo",
  trio: "Trio",
  fiveman: "5-Man",
  roaming: "7-Man Roaming",
};

export interface CompositionMember {
  roleLabel: string;
  buildId: string;
  /** Por que se elige esta build para el rol. */
  why: string;
}

export interface CompositionScores {
  pve: number;
  pvp: number;
  clearSpeed: number;
  survivability: number;
}

export interface AvalonComposition {
  id: string;
  kind: CompositionKind;
  name: string;
  style: string;
  groupSize: number;
  difficulty: 1 | 2 | 3 | 4;
  recommendedTier: string;
  synergy: string;
  members: CompositionMember[];
  scores: CompositionScores;
}

export function compositionMemberBuild(
  member: CompositionMember
): Build | null {
  return avalonBuildById(member.buildId);
}

export function compositionItems(members: CompositionMember[]): BuildItemSpec[] {
  const items: BuildItemSpec[] = [];
  for (const m of members) {
    const build = avalonBuildById(m.buildId);
    if (build) items.push(...build.items);
  }
  return items;
}

/** Actividad principal de la composicion (heuristica por kind). */
export function compositionActivity(kind: CompositionKind): AvalonActivity {
  if (kind === "fiveman" || kind === "trio") {
    return "pve";
  }
  if (kind === "roaming") return "pvp";
  return "pve";
}