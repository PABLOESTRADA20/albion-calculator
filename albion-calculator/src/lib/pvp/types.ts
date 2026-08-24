import type { WeaponFamilyKey } from "@/lib/pvp/weapons";

/** Resumen de un jugador (perfil oficial de gameinfo). */
export interface PvpPlayerSummary {
  id: string;
  name: string;
  guildId: string | null;
  guildName: string | null;
  allianceId: string | null;
  allianceName: string | null;
  totalKills: number;
  kills: number;
  deaths: number;
  assists: number;
  killFame: number;
  deathFame: number;
  pveFame: number;
}

export type EquipSlot =
  | "weapon"
  | "offhand"
  | "head"
  | "chest"
  | "shoes"
  | "cape"
  | "other";

export interface FightItem {
  id: string;
  quality: number;
  slot: EquipSlot;
}

export interface FightActor {
  id: string;
  name: string;
  guildName: string | null;
  allianceName: string | null;
  fame: number;
  killFame: number;
  deathFame: number;
  weaponFamily: WeaponFamilyKey;
  items: FightItem[];
}

export interface PvpFight {
  id: string;
  timestamp: string;
  locationId: string | null;
  groupMemberCount: number;
  totalParticipants: number;
  killer: FightActor;
  victim: FightActor;
}

export interface MatchupStat {
  opponentFamily: WeaponFamilyKey;
  fights: number;
  wins: number;
  losses: number;
  winRate: number; // 0..1, 0 si no hay fights
}

export interface FamilyMetaStat {
  family: WeaponFamilyKey;
  kills: number;
  deaths: number;
  winRate: number; // kills/(kills+deaths)
  usage: number; // % de eventos como killer
}

export interface SlotStat {
  itemId: string;
  itemName: string;
  slot: EquipSlot;
  deaths: number; // veces visto en el victima
}

export interface CounterStat {
  counterFamily: WeaponFamilyKey;
  fights: number;
  wins: number;
  losses: number;
  winRate: number;
}

/** Contrato de datos PvP. La UI depende de esto, no de la API concreta. */
export interface PvPDataProvider {
  searchPlayers(query: string): Promise<PvpPlayerSummary[]>;
  getPlayer(playerId: string): Promise<PvpPlayerSummary | null>;
  getPlayerKills(playerId: string, limit?: number): Promise<PvpFight[]>;
  getPlayerDeaths(playerId: string, limit?: number): Promise<PvpFight[]>;
  getEvents(limit?: number, offset?: number): Promise<PvpFight[]>;
  getEventsSince(msSince: number, limit?: number): Promise<PvpFight[]>;
}