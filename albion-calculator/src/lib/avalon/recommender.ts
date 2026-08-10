import { AVALON_BUILDS } from "@/data/avalon";
import type { Build } from "@/lib/builds/types";
import type { AvalonActivity } from "@/lib/builds/types";
import { BUILD_ROLES } from "@/lib/builds/types";

export interface RecommenderAnswer {
  activity: AvalonActivity;
  groupSize: "solo" | "duo" | "group";
  role: (typeof BUILD_ROLES)[number] | "flex";
  tier: number;
  budgetMax: number | null;
  escapeFocus: boolean;
}

/** Mapa de roles permitidos por actividad (heuristica de contenido, no datos). */
const ROLE_BY_ACTIVITY: Record<AvalonActivity, (typeof BUILD_ROLES)[number][] | "any"> = {
  pve: ["dps", "support", "tank", "healer"],
  pvp: ["dps", "support", "healer"],
  loot: "any",
  exploration: "any",
  gathering: "any",
  transport: "any",
};

/**
 * Recomendador de builds para Roads of Avalon. Filtra el catalogo curado y
 * puntua por encaje de rol, tamaño de grupo, foco en escape y coste estimado.
 * Nunca inventa datos: solo ordena builds reales del catalogo.
 */
export function recommendAvalonBuilds(answer: RecommenderAnswer): Build[] {
  const groupNumber = answer.groupSize === "solo" ? 1 : answer.groupSize === "duo" ? 2 : 5;

  const activityMatches = AVALON_BUILDS.filter((b) =>
    b.activity === answer.activity || (answer.activity === "exploration" && b.kind === "escape")
  );

  const allowedRoles = ROLE_BY_ACTIVITY[answer.activity];
  const pool = allowedRoles === "any" ? activityMatches : activityMatches.filter((b) => {
    if (b.roleType) return allowedRoles.includes(b.roleType);
    return allowedRoles.includes("dps");
  });

  const scored = pool
    .map((b) => {
      let score = 0;

      if (b.roleType && answer.role !== "flex" && b.roleType === answer.role) score += 4;
      if (b.groupSize === groupNumber) score += 3;
      else if (b.groupSize === 1 && groupNumber === 2) score += 1;
      else if ((b.groupSize ?? 0) >= 5 && groupNumber >= 5) score += 3;

      if (answer.escapeFocus && b.kind === "escape") score += 5;
      if (b.kind === "solo") score += 1;

      if (answer.budgetMax !== null) {
        // Coste aproximado por tier recomendado: precio desconocido no penaliza.
        const rough = b.tierRecommendation === "T4-T6" ? 150_000 : 450_000;
        if (rough <= answer.budgetMax) score += 2;
        else score -= 2;
      }

      return { build: b, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ build }) => build);

  return scored;
}