// Punto de re-export de las builds de Roads of Avalon.
//
// El BUILD SYSTEM vive en src/data/builds/* (y en src/components/builds/*).
// Este fichero existe para que las importaciones historicas de "@/data/avalon"
// sigan funcionando sin duplicar datos: la fuente unica es src/data/builds.

import type { AvalonActivity, AvalonBuildKind, Build } from "@/lib/builds/types";
import { AVALON_SOLO_BUILDS, AVALON_ALLROUNDER_BUILDS } from "@/data/builds/avalon-solo";
import { AVALON_HEALER_BUILDS, AVALON_TANK_BUILDS } from "@/data/builds/avalon-roles";
import { AVALON_DPS_BUILDS, AVALON_SUPPORT_BUILDS } from "@/data/builds/avalon-dps";
import { AVALON_ESCAPE_BUILDS } from "@/data/builds/avalon-escape";

export { AVALON_SOLO_BUILDS, AVALON_ALLROUNDER_BUILDS };
export { AVALON_HEALER_BUILDS, AVALON_TANK_BUILDS };
export { AVALON_DPS_BUILDS, AVALON_SUPPORT_BUILDS };
export { AVALON_ESCAPE_BUILDS };

export const AVALON_BUILDS: Build[] = [
  ...AVALON_SOLO_BUILDS,
  ...AVALON_ALLROUNDER_BUILDS,
  ...AVALON_HEALER_BUILDS,
  ...AVALON_TANK_BUILDS,
  ...AVALON_DPS_BUILDS,
  ...AVALON_SUPPORT_BUILDS,
  ...AVALON_ESCAPE_BUILDS,
];

const BY_ID = new Map(AVALON_BUILDS.map((b) => [b.id, b]));

export function avalonBuildById(id: string): Build | null {
  return BY_ID.get(id) ?? null;
}

export function avalonBuildsByKind(kind: AvalonBuildKind): Build[] {
  return AVALON_BUILDS.filter((b) => b.kind === kind);
}

export function avalonBuildsByActivity(activity: AvalonActivity): Build[] {
  return AVALON_BUILDS.filter((b) => b.activity === activity);
}

export function avalonBuildsByGroupSize(size: number): Build[] {
  return AVALON_BUILDS.filter((b) => (b.groupSize ?? 0) <= size);
}

/** Nombres canonicos de las familias de herramientas de gathering. */
export const GATHER_TOOLS: Record<string, string> = {
  wood: "T4_2H_TOOL_AXE",
  ore: "T4_2H_TOOL_PICK",
  hide: "T4_2H_TOOL_KNIFE",
  fiber: "T4_2H_TOOL_SICKLE",
  stone: "T4_2H_TOOL_HAMMER",
};

export const GATHER_TOOLS_AVALON: Record<string, string> = {
  wood: "T4_2H_TOOL_AXE_AVALON",
  ore: "T4_2H_TOOL_PICK_AVALON",
  hide: "T4_2H_TOOL_KNIFE_AVALON",
  fiber: "T4_2H_TOOL_SICKLE_AVALON",
  stone: "T4_2H_TOOL_HAMMER_AVALON",
};

export const GATHER_ARMOR: Record<string, { head: string; chest: string; shoes: string }> = {
  wood: { head: "T4_HEAD_GATHERER_WOOD", chest: "T4_ARMOR_GATHERER_WOOD", shoes: "T4_SHOES_GATHERER_WOOD" },
  ore: { head: "T4_HEAD_GATHERER_ORE", chest: "T4_ARMOR_GATHERER_ORE", shoes: "T4_SHOES_GATHERER_ORE" },
  hide: { head: "T4_HEAD_GATHERER_HIDE", chest: "T4_ARMOR_GATHERER_HIDE", shoes: "T4_SHOES_GATHERER_HIDE" },
  fiber: { head: "T4_HEAD_GATHERER_FIBER", chest: "T4_ARMOR_GATHERER_FIBER", shoes: "T4_SHOES_GATHERER_FIBER" },
};