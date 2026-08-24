import type { Build } from "@/lib/builds/types";
import { PVP_BUILDS } from "@/data/builds/pvp";
import { PVE_BUILDS } from "@/data/builds/pve";
import { AVALON_BUILDS } from "@/data/avalon";
import { buildWeaponFamily } from "@/lib/pvp/weapons";
import type { WeaponFamilyKey } from "@/lib/pvp/weapons";

/**
 * Mejor build del catalogo para una familia de arma (fuente: Build System).
 * Prefiere builds PvP y la primera del catalogo en orden estable.
 */
export function buildsForFamily(family: WeaponFamilyKey): Build[] {
  return [...PVP_BUILDS, ...PVE_BUILDS, ...AVALON_BUILDS]
    .filter((b) => buildWeaponFamily(b) === family)
    .sort((a, b) => (b.mode === "pvp" ? 1 : 0) - (a.mode === "pvp" ? 1 : 0));
}

export function bestBuildForFamily(family: WeaponFamilyKey): Build | null {
  return buildsForFamily(family)[0] ?? null;
}