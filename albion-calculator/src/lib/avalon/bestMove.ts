import type { AvalonActivity } from "@/lib/builds/types";
import type { Build } from "@/lib/builds/types";
import { avalonBuildById } from "@/data/avalon";
import type { RiskLevel } from "@/lib/avalon/risk";

export interface BestAvalonMove {
  activity: AvalonActivity;
  activityLabel: string;
  players: number;
  recommendedTier: string;
  recommendedBuildIds: string[];
  estimatedDurationMin: number;
  estimatedProfit: number;
  risk: RiskLevel;
  summary: string;
}

const DURATION_BY_ACTIVITY: Record<AvalonActivity, number> = {
  pve: 60,
  pvp: 45,
  loot: 40,
  gathering: 60,
  exploration: 30,
  transport: 30,
};

/** Hoja de actividades de Roads: eleccion curada de contenido por actividad+jugadores. */
export function bestAvalonMove(
  activity: AvalonActivity,
  players: number,
  tier: number
): BestAvalonMove | null {
  const activityLabel: Record<AvalonActivity, string> = {
    pve: "PvE",
    pvp: "PvP",
    loot: "Loot",
    gathering: "Gathering",
    exploration: "Exploración",
    transport: "Transporte",
  };

  let recommendedBuildIds: string[] = [];
  let summary = "";

  if (activity === "pve") {
    if (players === 1) {
      recommendedBuildIds = ["avalon-battleaxe", "avalon-druidic"];
      summary = "Green Chests y dungs de nivel bajo con sustain: Battleaxe o Druidic en T4-T6.";
    } else if (players === 2) {
      recommendedBuildIds = ["avalon-battleaxe", "avalon-druidic-healer"];
      summary = "Duo Bruiser+Healer: cofres verdes sin morir y PvP defensivo.";
    } else if (players === 3) {
      recommendedBuildIds = ["avalon-tank-mace", "avalon-dps-curse", "avalon-holy"];
      summary = "Trio Standard: dungeons de grupo medios con la comp más redonda.";
    } else if (players === 5) {
      recommendedBuildIds = ["avalon-tank-incubus", "avalon-fallen", "avalon-dps-frost", "avalon-dps-curse", "avalon-dps-pike"];
      summary = "5-Man Speed Clear: dungeons de nivel alto y fame farm eficiente.";
    } else {
      recommendedBuildIds = ["avalon-tank-greathammer", "avalon-fallen", "avalon-support-enigmatic", "avalon-dps-frost", "avalon-dps-curse", "avalon-dps-longbow", "avalon-dps-pike"];
      summary = "7-Man PvE Heavy: agrupes gigantes y limpieza total de Roads T6+.";
    }
  } else if (activity === "pvp") {
    if (players === 1) {
      recommendedBuildIds = ["avalon-bloodletter", "avalon-battlebracers"];
      summary = "Solo: evita el 1v1 doloso y entra solo a ejecutar o a robar cofres.";
    } else if (players === 2) {
      recommendedBuildIds = ["avalon-ar-carving", "avalon-support-enigmatic"];
      summary = "Duo DPS+Support: presión constante y persecución de ratas.";
    } else if (players === 3) {
      recommendedBuildIds = ["avalon-battleaxe", "avalon-dps-warbow", "avalon-hallowfall"];
      summary = "Trio híbrido: farmea y defiende el cofre con presencia PvP.";
    } else if (players === 5) {
      recommendedBuildIds = ["avalon-tank-incubus", "avalon-hallowfall", "avalon-dps-bearpaws", "avalon-dps-warbow", "avalon-bloodletter"];
      summary = "5-Man PvP Roaming: caza de ratas y control de la zona.";
    } else {
      recommendedBuildIds = ["avalon-tank-incubus", "avalon-hallowfall", "avalon-support-malevolent", "avalon-dps-bearpaws", "avalon-dps-earthrune", "avalon-dps-hellspawn", "avalon-bloodletter"];
      summary = "7-Man PvP Heavy: burst coordinado y purga para noquear rápido.";
    }
  } else if (activity === "loot") {
    recommendedBuildIds =
      players === 1
        ? ["avalon-escape-bloodletter", "avalon-escape-rat"]
        : players === 2
          ? ["avalon-holy", "avalon-escape-bloodletter"]
          : ["avalon-tank-spear", "avalon-wild", "avalon-dps-curse", "avalon-dps-crossbow", "avalon-dps-earthrune"];
    summary =
      players <= 2
        ? "Cofres verdes y azules con montura rápida: entra, saca el loot, sal de la road."
        : "5-Man High Loot: contenido de nivel medio orientado a maximizar drops y sacarlos vivos.";
  } else if (activity === "gathering") {
    recommendedBuildIds = ["avalon-escape-gathering", "avalon-escape-doublebladed"];
    summary = "Roads T6-T7 con recursos de tu profesión: bucle de recolección y retirada rápida.";
  } else if (activity === "exploration") {
    recommendedBuildIds = ["avalon-doublebladed", "avalon-escape-rat"];
    summary = "Reconoce la road, marca salidas y decide si el contenido compensa antes de comprometerte.";
  } else {
    recommendedBuildIds = ["avalon-escape-rat"];
    summary = "Transporte corto puerta a puerta: montura de carga y ruta directa.";
  }

  const recommendedTier =
    activity === "gathering"
      ? `T${Math.max(6, tier)}`
      : players === 1
        ? "T4-T6"
        : players === 2
          ? "T5-T7"
          : players >= 7
            ? "T6-T8"
            : "T6-T8";

  const risk: RiskLevel =
    players === 1 ? "HIGH" : players === 2 ? "MEDIUM" : tier >= 7 ? "HIGH" : "MEDIUM";

  return {
    activity,
    activityLabel: activityLabel[activity],
    players,
    recommendedTier,
    recommendedBuildIds,
    estimatedDurationMin: DURATION_BY_ACTIVITY[activity],
    estimatedProfit: 0,
    risk,
    summary,
  };
}

/** Builds recomendadas por una decision (resuelve ids a objetos). */
export function resolveRecommendedBuilds(ids: string[]): Build[] {
  return ids
    .map((id) => avalonBuildById(id))
    .filter((b): b is Build => Boolean(b));
}