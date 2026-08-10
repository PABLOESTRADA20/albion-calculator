import type { AvalonActivity } from "@/lib/builds/types";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "EXTREME";

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  LOW: "Bajo",
  MEDIUM: "Medio",
  HIGH: "Alto",
  EXTREME: "Extremo",
};

export const RISK_LEVEL_STYLES: Record<RiskLevel, string> = {
  LOW: "bg-emerald-500/10 text-emerald-400",
  MEDIUM: "bg-amber-500/10 text-amber-400",
  HIGH: "bg-orange-500/10 text-orange-400",
  EXTREME: "bg-red-500/10 text-red-400",
};

export interface RiskInput {
  tier: number;
  players: number;
  activity: AvalonActivity;
  buildValue: number;
  mountValue: number;
  inventoryValue: number;
  pvpExposure: number; // 0..10
  distanceFromExit: number; // 0..10
}

export interface RiskResult {
  score: number; // 0..100
  level: RiskLevel;
  reasons: string[];
}

const ACTIVITY_BASE: Record<AvalonActivity, number> = {
  transport: 30,
  pvp: 26,
  gathering: 24,
  loot: 22,
  exploration: 18,
  pve: 15,
};

/**
 * AVALON RISK SCORE (heuristica documentada, no datos del juego):
 * - Cuanto mayor el tier de la road, mas PvP corazonado (gente con mas gear).
 * - Menos jugadores = menos cobertura en fuga.
 * - Mas valor en build/montura/inventario = mas perdida posible.
 * - Exposicion PvP y distancia a la salida amplifican.
 */
export function avalonRiskScore(input: RiskInput): RiskResult {
  const tierBonus = input.tier >= 8 ? 20 : input.tier >= 7 ? 15 : input.tier >= 6 ? 10 : input.tier >= 5 ? 5 : 0;
  const playersBonus = input.players >= 7 ? 5 : input.players >= 5 ? 8 : input.players >= 3 ? 14 : input.players >= 2 ? 18 : 24;
  const value = input.buildValue + input.mountValue + input.inventoryValue;
  const valueBonus = value >= 5_000_000 ? 22 : value >= 2_000_000 ? 16 : value >= 800_000 ? 10 : value >= 300_000 ? 5 : 0;
  const exposureBonus = input.pvpExposure * 1.8;
  const distanceBonus = input.distanceFromExit * 1.4;

  const score = Math.min(
    100,
    Math.round(
      ACTIVITY_BASE[input.activity] + tierBonus + playersBonus + valueBonus + exposureBonus + distanceBonus
    )
  );

  const level: RiskLevel =
    score < 35 ? "LOW" : score < 60 ? "MEDIUM" : score < 80 ? "HIGH" : "EXTREME";

  const reasons: string[] = [];
  if (input.tier >= 7) reasons.push(`Road T${input.tier}: zona con presencia PvP de alto nivel.`);
  if (input.tier >= 6 && input.tier < 7) reasons.push(`Road T${input.tier}: PvP frecuente.`);
  if (input.players === 1) reasons.push("Solo: sin cobertura para escapar.");
  if (input.players >= 3) reasons.push(`${input.players} jugadores: buena cobertura de equipo.`);
  if (value >= 2_000_000) reasons.push(`${(value / 1_000_000).toFixed(1)}M en gear + inventario: pérdida posible alta.`);
  if (value < 300_000) reasons.push("Equipamiento barato: pérdida limitada.");
  if (input.pvpExposure >= 7) reasons.push("Exposición PvP alta: la actividad atrae conflicto.");
  if (input.distanceFromExit >= 7) reasons.push("Lejos de la salida: fuga complicada.");
  if (input.distanceFromExit <= 3) reasons.push("Cerca de la salida: escape rápido.");
  if (input.activity === "transport") reasons.push("Transporte: objetivo prioritario de ganks.");
  if (reasons.length === 0) reasons.push("Perfil equilibrado para el contenido de Roads.");

  return { score, level, reasons };
}

/** Etiqueta de riesgo corta (para tablas y resumenes). */
export function riskLabel(input: Omit<RiskInput, "buildValue" | "mountValue" | "inventoryValue">): RiskLevel {
  return avalonRiskScore({ ...input, buildValue: 0, mountValue: 0, inventoryValue: 0 }).level;
}