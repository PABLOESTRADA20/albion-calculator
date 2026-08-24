import type {
  CounterStat,
  EquipSlot,
  FamilyMetaStat,
  MatchupStat,
  PvpFight,
  SlotStat,
} from "@/lib/pvp/types";
import { UNKNOWN_WEAPON, WEAPON_FAMILIES } from "@/lib/pvp/weapons";
import type { WeaponFamilyKey } from "@/lib/pvp/weapons";
import { itemName } from "@/lib/builds/items";

/**
 * Motor de analitica PvP: agregaciones PURAS sobre combates reales.
 * Ninguna de estas funciones inventa datos; si la muestra es insuficiente
 * devuelven listas vacias o winRate 0 (la UI muestra "sin datos").
 */

export interface MatchupResult {
  myFamily: WeaponFamilyKey;
  matchups: MatchupStat[];
  favorable: MatchupStat[]; // WR >= 0.55 y >= MIN_FIGHTS
  neutral: MatchupStat[];
  unfavorable: MatchupStat[];
  totalFights: number;
}

export const MIN_FIGHTS = 10;

/** Tabla de matchups de una familia de arma frente al resto. */
export function matchupsFor(
  events: PvpFight[],
  myFamily: WeaponFamilyKey
): MatchupResult {
  const acc = new Map<string, { fights: number; wins: number }>();

  for (const f of events) {
    const mine = f.killer.weaponFamily === myFamily;
    const theirs = f.victim.weaponFamily;
    if (mine) {
      const entry = acc.get(theirs) ?? { fights: 0, wins: 0 };
      entry.fights += 1;
      entry.wins += 1;
      acc.set(theirs, entry);
      continue;
    }
    if (f.victim.weaponFamily === myFamily) {
      const opp = f.killer.weaponFamily;
      const entry = acc.get(opp) ?? { fights: 0, wins: 0 };
      entry.fights += 1;
      acc.set(opp, entry);
    }
  }

  const matchups: MatchupStat[] = [...acc.entries()]
    .filter(([, e]) => e.fights > 0)
    .map(([opponentFamily, e]) => ({
      opponentFamily: opponentFamily as WeaponFamilyKey,
      fights: e.fights,
      wins: e.wins,
      losses: e.fights - e.wins,
      winRate: e.wins / e.fights,
    }))
    .sort((a, b) => b.fights - a.fights);

  const favorable = matchups.filter((m) => m.winRate >= 0.55 && m.fights >= MIN_FIGHTS);
  const neutral = matchups.filter((m) => m.winRate > 0.45 && m.winRate < 0.55 && m.fights >= MIN_FIGHTS);
  const unfavorable = matchups.filter((m) => m.winRate <= 0.45 && m.fights >= MIN_FIGHTS);

  return {
    myFamily,
    matchups,
    favorable,
    neutral,
    unfavorable,
    totalFights: matchups.reduce((a, m) => a + m.fights, 0),
  };
}

/** Meta por familia (lado killer) a partir de combates reales. */
export function familyMeta(events: PvpFight[]): FamilyMetaStat[] {
  const kills = new Map<WeaponFamilyKey, number>();
  const deaths = new Map<WeaponFamilyKey, number>();
  for (const f of events) {
    kills.set(f.killer.weaponFamily, (kills.get(f.killer.weaponFamily) ?? 0) + 1);
    deaths.set(f.victim.weaponFamily, (deaths.get(f.victim.weaponFamily) ?? 0) + 1);
  }
  const all = new Set([...kills.keys(), ...deaths.keys()]);
  const totalKills = events.length || 1;
  return [...all]
    .map((family) => {
      const k = kills.get(family) ?? 0;
      const d = deaths.get(family) ?? 0;
      const denom = k + d;
      return {
        family,
        kills: k,
        deaths: d,
        winRate: denom > 0 ? k / denom : 0,
        usage: (k / totalKills) * 100,
      };
    })
    .sort((a, b) => b.kills - a.kills);
}

/** Counters de una familia enemiga: mejores WR contra ella (min 10 fights). */
export function countersFor(events: PvpFight[], enemyFamily: WeaponFamilyKey): CounterStat[] {
  const acc = new Map<string, { fights: number; wins: number }>();
  for (const f of events) {
    if (f.victim.weaponFamily !== enemyFamily) continue;
    const mine = f.killer.weaponFamily;
    if (mine === enemyFamily) continue;
    const entry = acc.get(mine) ?? { fights: 0, wins: 0 };
    entry.fights += 1;
    entry.wins += 1;
    acc.set(mine, entry);
  }
  return [...acc.entries()]
    .filter(([, e]) => e.fights >= MIN_FIGHTS)
    .map(([counterFamily, e]) => ({
      counterFamily: counterFamily as WeaponFamilyKey,
      fights: e.fights,
      wins: e.wins,
      losses: e.fights - e.wins,
      winRate: e.wins / e.fights,
    }))
    .sort((a, b) => b.winRate - a.winRate || b.fights - a.fights);
}

export interface FamilyTrend {
  family: WeaponFamilyKey;
  previousKills: number;
  currentKills: number;
  growth: number; // -1..inf, 0 si no hay datos previos
  trend: "rising" | "falling" | "stable" | "insufficient";
}

/** Evolucion de uso entre dos ventanas de combates. */
export function familyTrends(
  previousWindow: PvpFight[],
  currentWindow: PvpFight[]
): FamilyTrend[] {
  const count = (list: PvpFight[]) => {
    const m = new Map<WeaponFamilyKey, number>();
    for (const f of list) {
      m.set(f.killer.weaponFamily, (m.get(f.killer.weaponFamily) ?? 0) + 1);
    }
    return m;
  };
  const prev = count(previousWindow);
  const curr = count(currentWindow);
  const families = new Set([...prev.keys(), ...curr.keys()]);

  return [...families]
    .map((family) => {
      const currentKills = curr.get(family) ?? 0;
      const previousKills = prev.get(family) ?? 0;
      const growth = previousKills > 0 ? (currentKills - previousKills) / previousKills : 1;
      let trend: FamilyTrend["trend"] = "insufficient";
      if (currentKills >= MIN_FIGHTS && previousKills >= MIN_FIGHTS) {
        trend = growth >= 0.25 ? "rising" : growth <= -0.25 ? "falling" : "stable";
      }
      return { family, previousKills, currentKills, growth, trend };
    })
    .sort((a, b) => b.growth - a.growth);
}

/** Items usados por las victimas por slot (frecuencia en combates reales). */
export function slotUsage(events: PvpFight[], minDeaths = 5): Record<string, SlotStat[]> {
  const bySlot = new Map<string, Map<string, SlotStat>>();
  for (const f of events) {
    for (const item of f.victim.items) {
      if (!item.id) continue;
      let slotMap = bySlot.get(item.slot);
      if (!slotMap) {
        slotMap = new Map();
        bySlot.set(item.slot, slotMap);
      }
      const stat = slotMap.get(item.id) ?? {
        itemId: item.id,
        itemName: itemName(item.id),
        slot: item.slot,
        deaths: 0,
      };
      stat.deaths += 1;
      slotMap.set(item.id, stat);
    }
  }
  const out: Record<string, SlotStat[]> = {};
  for (const [slot, map] of bySlot) {
    out[slot] = [...map.values()].filter((s) => s.deaths >= minDeaths).sort((a, b) => b.deaths - a.deaths);
  }
  return out;
}

export { WEAPON_FAMILIES, UNKNOWN_WEAPON };

export function knownFamilies(): WeaponFamilyKey[] {
  return [...WEAPON_FAMILIES] as unknown as WeaponFamilyKey[];
}

export function slotLabel(slot: EquipSlot): string {
  return (
    {
      weapon: "Arma",
      offhand: "Offhand",
      head: "Casco",
      chest: "Armadura",
      shoes: "Botas",
      cape: "Capa",
      other: "Otro",
    } as Record<EquipSlot, string>
  )[slot];
}