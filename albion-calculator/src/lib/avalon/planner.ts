import type { AvalonActivity } from "@/lib/builds/types";
import { AVALON_ACTIVITIES } from "@/lib/builds/types";
import { bestAvalonMove } from "@/lib/avalon/bestMove";
import type { BestAvalonMove } from "@/lib/avalon/bestMove";

export interface RouteStep {
  id: string;
  label: string;
  activity: AvalonActivity;
  durationMin: number;
}

export interface RoutePlan {
  totalDurationMin: number;
  steps: RouteStep[];
  bestMove: BestAvalonMove | null;
}

export interface PlannerSection {
  activity: AvalonActivity;
  label: string;
  options: PlannerOption[];
}

export interface PlannerOption {
  id: string;
  label: string;
  durationMin: number;
}

/** Opciones de contenido por seccion (duraciones estimadas, sin inventar datos externos). */
export function plannerSections(players: number): PlannerSection[] {
  return AVALON_ACTIVITIES.map((activity) => {
    const move = bestAvalonMove(activity, players, 6);
    const base = move?.estimatedDurationMin ?? 45;
    const options: PlannerOption[] = [
      { id: `${activity}-short`, label: `Sesión corta (~${Math.max(20, Math.round(base / 2))} min)`, durationMin: Math.max(20, Math.round(base / 2)) },
      { id: `${activity}-standard`, label: `Sesión estándar (~${base} min)`, durationMin: base },
      { id: `${activity}-long`, label: `Sesión extendida (~${base + 30} min)`, durationMin: base + 30 },
    ];
    const label: Record<AvalonActivity, string> = {
      pve: "PvE",
      pvp: "PvP",
      loot: "Loot",
      gathering: "Gathering",
      exploration: "Exploración",
      transport: "Transporte",
    };
    return { activity, label: label[activity], options };
  });
}

/** Construye una ruta de sesion a partir de secciones elegidas (hasta 3). */
export function buildRoute(
  players: number,
  tier: number,
  selected: { section: PlannerSection; option: PlannerOption }[]
): RoutePlan {
  const steps: RouteStep[] = selected.map(({ section, option }, index) => ({
    id: `${section.activity}-${index}-${option.id}`,
    label: option.label,
    activity: section.activity,
    durationMin: option.durationMin,
  }));

  const totalDurationMin = steps.reduce((acc, s) => acc + s.durationMin, 0);

  // La recomendacion "mejor jugada" pesa la duracion para senalar la actividad principal.
  const dominant = steps.length > 0
    ? steps.reduce((a, b) => (b.durationMin > a.durationMin ? b : a))
    : null;

  const bestMove = dominant ? bestAvalonMove(dominant.activity, players, tier) : null;

  return { totalDurationMin, steps, bestMove };
}