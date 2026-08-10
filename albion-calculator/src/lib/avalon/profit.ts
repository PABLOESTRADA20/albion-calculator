import { sellOrderRevenue } from "@/lib/calc/market";
import type { AvalonActivity } from "@/lib/builds/types";
import { avalonRiskScore } from "@/lib/avalon/risk";
import type { RiskLevel } from "@/lib/avalon/risk";

export interface RunEstimateInput {
  tier: number;
  players: number;
  durationMin: number;
  activity: AvalonActivity;
  buildCost: number;
  mountCost: number;
  expectedLoot: number;
  consumablesPerPlayer: number;
  repairPct: number; // % del gear gastado en reparacion
  premium: boolean;
  pvpExposure: number;
  distanceFromExit: number;
}

export interface RunEstimate {
  expectedLoot: number;
  buildCost: number;
  consumables: number;
  repairCost: number;
  marketFees: number;
  expenses: number;
  net: number;
  perPlayer: number;
  perHour: number;
  netAfterBuy: number;
  risk: RiskLevel;
  durationMin: number;
}

/**
 * Estimador de rentabilidad de una expedicion a Roads of Avalon.
 * Todos los valores son ESTIMACIONES basadas en datos disponibles y en las
 * cifras que introduce el jugador; nunca deben tratarse como garantizados.
 */
export function estimateAvalonRun(input: RunEstimateInput): RunEstimate {
  const buildCost = Math.max(0, input.buildCost);
  const consumables = input.consumablesPerPlayer * input.players;
  const repairCost = Math.round(buildCost * (input.repairPct / 100));
  const gross = input.expectedLoot;
  const marketFees = Math.round(gross - sellOrderRevenue(gross, input.premium));
  const expenses = consumables + repairCost + marketFees;
  const net = gross - expenses;
  const perPlayer = input.players > 0 ? Math.round(net / input.players) : 0;
  const perHour = input.durationMin > 0 ? Math.round((net * 60) / input.durationMin) : 0;
  const netAfterBuy = net - (input.players > 0 ? buildCost : 0) * (input.players > 1 ? 1 : 1) - (input.players > 1 ? 0 : input.mountCost);

  const score = avalonRiskScore({
    tier: input.tier,
    players: input.players,
    activity: input.activity,
    buildValue: buildCost,
    mountValue: input.mountCost,
    inventoryValue: input.expectedLoot,
    pvpExposure: input.pvpExposure,
    distanceFromExit: input.distanceFromExit,
  });

  return {
    expectedLoot: gross,
    buildCost,
    consumables,
    repairCost,
    marketFees,
    expenses,
    net,
    perPlayer,
    perHour,
    netAfterBuy,
    risk: score.level,
    durationMin: input.durationMin,
  };
}