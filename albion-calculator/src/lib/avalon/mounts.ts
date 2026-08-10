import type { AvalonActivity } from "@/lib/builds/types";

export type MountActivity = AvalonActivity | "escape";

export interface MountRecommendation {
  name: string;
  datasetId: string | null;
  activities: MountActivity[];
  bestFor: MountActivity;
  notes: string;
  /** Precio no disponible cuando el id no existe en el dataset local. */
  priceAvailable: boolean;
}

/**
 * Recomendaciones de montura por actividad. Solo HORSE/OX/GIANTSTAG existen en
 * el dataset local (el resto muestra "Datos de precio no disponibles").
 */
export const MOUNT_RECOMMENDATIONS: MountRecommendation[] = [
  {
    name: "Caballo de montar",
    datasetId: "T4_MOUNT_HORSE",
    activities: ["pve", "loot", "exploration"],
    bestFor: "pve",
    notes: "La montura generalista: barata y suficiente para PvE y cofres.",
    priceAvailable: true,
  },
  {
    name: "Buey de transporte",
    datasetId: "T4_MOUNT_OX",
    activities: ["transport", "gathering"],
    bestFor: "transport",
    notes: "El doble de carga para mover loot y recursos (lento: evita PvP).",
    priceAvailable: true,
  },
  {
    name: "Ciervo gigante",
    datasetId: "T4_MOUNT_GIANTSTAG",
    activities: ["transport", "gathering"],
    bestFor: "transport",
    notes: "Carga alta y algo más rápida que el buey: transporte de nivel medio.",
    priceAvailable: true,
  },
  {
    name: "Jabalí",
    datasetId: null,
    activities: ["gathering", "exploration"],
    bestFor: "gathering",
    notes: "Recurso 3:100 de carga, ideal para recolección. Precio fuera del dataset.",
    priceAvailable: false,
  },
  {
    name: "Garra veloz (Swiftclaw)",
    datasetId: null,
    activities: ["pvp", "escape", "exploration"],
    bestFor: "escape",
    notes: "Velocidad máxima: la montura de escape por excelencia. Precio fuera del dataset.",
    priceAvailable: false,
  },
  {
    name: "Lobo tenebroso (Direwolf)",
    datasetId: null,
    activities: ["pvp", "loot"],
    bestFor: "pvp",
    notes: "Velocidad + combate: buena para cazar o huir del gank. Precio fuera del dataset.",
    priceAvailable: false,
  },
  {
    name: "Jabalí espectral (Spectral Direboar)",
    datasetId: null,
    activities: ["gathering", "pvp"],
    bestFor: "gathering",
    notes: "Carga de jabalí con velocidad de lobo: la montura premium de Roads. Precio fuera del dataset.",
    priceAvailable: false,
  },
  {
    name: "Caballo acorazado",
    datasetId: null,
    activities: ["loot", "transport"],
    bestFor: "loot",
    notes: "Más vida y carga que el caballo: para sacar loot con margen. Precio fuera del dataset.",
    priceAvailable: false,
  },
  {
    name: "Dragón de pantano",
    datasetId: null,
    activities: ["pve", "loot"],
    bestFor: "loot",
    notes: "Puede cruzar agua: atajos por ríos en las Roads. Precio fuera del dataset.",
    priceAvailable: false,
  },
];

export function mountsForActivity(activity: AvalonActivity): MountRecommendation[] {
  return MOUNT_RECOMMENDATIONS.filter((m) => m.activities.includes(activity));
}

export function bestMountFor(activity: AvalonActivity): MountRecommendation | null {
  return MOUNT_RECOMMENDATIONS.find((m) => m.bestFor === activity) ?? null;
}