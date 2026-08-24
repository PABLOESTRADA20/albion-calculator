import type { EquipSlot, FightActor, FightItem, PvpFight, PvpPlayerSummary, PvPDataProvider } from "@/lib/pvp/types";
import { weaponFamilyOfItemId } from "@/lib/pvp/weapons";
import type { ServerId } from "@/types/albion";

/**
 * Proveedor oficial de Albion (gameinfo.albiononline.com).
 *
 * Resiliencia: timeout por peticion, reintentos limitados con backoff,
 * cache en memoria por URL (TTL) y deduplicacion de peticiones en vuelo.
 * Ningun fallo de esta API debe romper el resto de la aplicacion.
 */

const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const CACHE_TTL_MS = 60_000;
const PLAYER_CACHE_TTL_MS = 5 * 60_000;

const BASE_BY_SERVER: Record<ServerId, string> = {
  europe: "https://gameinfo-ams.albiononline.com/api/gameinfo",
  america: "https://gameinfo-ash.albiononline.com/api/gameinfo",
};

const cache = new Map<string, { expires: number; promise: Promise<unknown> }>();

function prune() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expires < now) cache.delete(key);
  }
}

async function fetchJson<T>(url: string, ttlMs: number): Promise<T> {
  const cached = cache.get(url);
  if (cached && cached.expires > Date.now()) {
    return cached.promise as Promise<T>;
  }

  const promise = (async () => {
    let delay = 600;
    let lastError: unknown = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) return (await res.json()) as T;
        if (res.status === 404) return null as T;
        if (res.status === 429 && attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 3;
          continue;
        }
        if (res.status >= 500 && attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        throw new Error(`Albion gameinfo respondió ${res.status}.`);
      } catch (err) {
        clearTimeout(timer);
        if (attempt < MAX_RETRIES && !(err instanceof DOMException && err.name === "AbortError")) {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        lastError = err;
        break;
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error("No se pudo contactar con la API de Albion (gameinfo).");
  })();

  cache.set(url, { expires: Date.now() + ttlMs, promise });
  try {
    return (await promise) as T;
  } catch (err) {
    cache.delete(url);
    throw err;
  }
}

function parsePlayer(raw: unknown): PvpPlayerSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const lts = (r.LifetimeStatistics ?? r.lifetimeStats ?? {}) as Record<string, unknown>;
  const pvp = (lts.PvP ?? lts.pvp ?? {}) as Record<string, unknown>;
  return {
    id: String(r.Id ?? r.id ?? ""),
    name: String(r.Name ?? r.name ?? ""),
    guildId: r.GuildId ? String(r.GuildId) : null,
    guildName: r.GuildName ? String(r.GuildName) : null,
    allianceId: r.AllianceId ? String(r.AllianceId) : null,
    allianceName: r.AllianceName ? String(r.AllianceName) : null,
    totalKills: Number(r.TotalKills ?? 0),
    kills: Number(pvp.Kills ?? pvp.kills ?? 0),
    deaths: Number(pvp.Deaths ?? pvp.deaths ?? 0),
    assists: Number(pvp.AssistKills ?? pvp.assists ?? 0),
    killFame: Number(pvp.KillFame ?? pvp.killFame ?? 0),
    deathFame: Number(pvp.DeathFame ?? pvp.deathFame ?? 0),
    pveFame: Number((lts.PvE as Record<string, unknown> | undefined)?.Fame ?? (lts.pve as Record<string, unknown> | undefined)?.fame ?? 0),
  };
}

const EQUIP_SLOT_KEYS: Record<string, EquipSlot> = {
  MainHand: "weapon",
  OffHand: "offhand",
  Head: "head",
  Armor: "chest",
  Shoes: "shoes",
  Cape: "cape",
};

function parseItems(raw: unknown): { items: FightItem[]; mainHandId: string | null } {
  const items: FightItem[] = [];
  let mainHandId: string | null = null;
  if (!raw || typeof raw !== "object") return { items, mainHandId };
  const r = raw as Record<string, unknown>;

  const equipment = (r.Equipment ?? r.equipment) as Record<string, unknown> | undefined;
  if (equipment) {
    for (const [key, value] of Object.entries(equipment)) {
      const slot = EQUIP_SLOT_KEYS[key];
      if (!slot || !value) continue;
      const itemRaw = value as Record<string, unknown>;
      const id = String(itemRaw.Type ?? itemRaw.type ?? itemRaw.id ?? "");
      if (!id) continue;
      items.push({ id, quality: Number(itemRaw.Quality ?? itemRaw.quality ?? 0), slot });
      if (slot === "weapon") mainHandId = id;
    }
  }

  const itemsRaw = Array.isArray(r.items) ? (r.items as unknown[]) : [];
  for (const entry of itemsRaw) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const id = String(e.id ?? e.type ?? e.itemId ?? "");
    if (!id) continue;
    const isWeapon = id.includes("_MAIN_") || id.includes("_2H_") || id.includes("_NATURE_") || id.includes("_HOLY_") || id.includes("_ARCANE_") || id.includes("_CURSED_") || id.includes("_FROST_") || id.includes("_FIRE_");
    if (!isWeapon) continue;
    items.push({ id, quality: Number(e.quality ?? 0), slot: "weapon" });
    if (!mainHandId) mainHandId = id;
  }

  return { items, mainHandId };
}

function parseActor(raw: unknown): FightActor | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const { items, mainHandId } = parseItems(r);
  return {
    id: String(r.Id ?? r.id ?? ""),
    name: String(r.Name ?? r.name ?? ""),
    guildName: r.GuildName ? String(r.GuildName) : null,
    allianceName: r.AllianceName ? String(r.AllianceName) : null,
    fame: Number(r.Fame ?? r.fame ?? 0),
    killFame: Number(r.KillFame ?? r.killFame ?? 0),
    deathFame: Number(r.DeathFame ?? r.deathFame ?? 0),
    weaponFamily: weaponFamilyOfItemId(mainHandId ?? ""),
    items,
  };
}

function parseFight(raw: unknown): PvpFight | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const killer = parseActor(r.killer ?? r.Killer);
  const victim = parseActor(r.victim ?? r.Victim);
  if (!killer || !victim) return null;
  return {
    id: String(r.id ?? r.Id ?? ""),
    timestamp: String(r.timeStamp ?? r.TimeStamp ?? ""),
    locationId: r.locationId ? String(r.locationId) : r.LocationId ? String(r.LocationId) : null,
    groupMemberCount: Number(r.groupMemberCount ?? r.GroupMemberCount ?? 0),
    totalParticipants: Number(r.totalParticipantCount ?? r.TotalParticipantCount ?? 0),
    killer,
    victim,
  };
}

/** Busca jugadores por nombre (p.ej. "Yamilil"). */
export function searchPlayers(base: ServerId, query: string): Promise<PvpPlayerSummary[]> {
  const url = `${BASE_BY_SERVER[base]}/players?q=${encodeURIComponent(query)}&limit=8`;
  return fetchJson<unknown[]>(url, PLAYER_CACHE_TTL_MS).then((raw) =>
    (Array.isArray(raw) ? raw : [])
      .map(parsePlayer)
      .filter((p): p is PvpPlayerSummary => p !== null)
  );
}

export function getPlayer(base: ServerId, playerId: string): Promise<PvpPlayerSummary | null> {
  const url = `${BASE_BY_SERVER[base]}/players/${encodeURIComponent(playerId)}`;
  return fetchJson<unknown>(url, PLAYER_CACHE_TTL_MS).then(parsePlayer);
}

function getFights(
  base: ServerId,
  path: string,
  limit: number,
  offset = 0
): Promise<PvpFight[]> {
  const url = `${BASE_BY_SERVER[base]}${path}?limit=${limit}&offset=${offset}`;
  return fetchJson<unknown[]>(url, CACHE_TTL_MS).then((raw) =>
    (Array.isArray(raw) ? raw : [])
      .map(parseFight)
      .filter((f): f is PvpFight => f !== null)
  );
}

export function getPlayerKills(base: ServerId, playerId: string, limit = 100): Promise<PvpFight[]> {
  return getFights(base, `/players/${encodeURIComponent(playerId)}/kills`, limit);
}

export function getPlayerDeaths(base: ServerId, playerId: string, limit = 100): Promise<PvpFight[]> {
  return getFights(base, `/players/${encodeURIComponent(playerId)}/deaths`, limit);
}

export function getGlobalEvents(base: ServerId, limit = 100, offset = 0): Promise<PvpFight[]> {
  return getFights(base, "/events", limit, offset);
}

export function getEventsSince(base: ServerId, msSince: number, limit = 100): Promise<PvpFight[]> {
  const url = `${BASE_BY_SERVER[base]}/events?limit=${limit}&timestamp=${msSince}`;
  return fetchJson<unknown[]>(url, CACHE_TTL_MS).then((raw) =>
    (Array.isArray(raw) ? raw : [])
      .map(parseFight)
      .filter((f): f is PvpFight => f !== null)
  );
}

/** Implementacion del contrato para la UI. */
export class GameInfoPvpProvider implements PvPDataProvider {
  constructor(readonly serverId: ServerId = "europe") {}

  searchPlayers(query: string) {
    return searchPlayers(this.serverId, query);
  }

  getPlayer(playerId: string) {
    return getPlayer(this.serverId, playerId);
  }

  getPlayerKills(playerId: string, limit = 100) {
    return getPlayerKills(this.serverId, playerId, limit);
  }

  getPlayerDeaths(playerId: string, limit = 100) {
    return getPlayerDeaths(this.serverId, playerId, limit);
  }

  getEvents(limit = 100, offset = 0) {
    return getGlobalEvents(this.serverId, limit, offset);
  }

  getEventsSince(msSince: number, limit = 100) {
    return getEventsSince(this.serverId, msSince, limit);
  }
}

export { prune as prunePvpCache };