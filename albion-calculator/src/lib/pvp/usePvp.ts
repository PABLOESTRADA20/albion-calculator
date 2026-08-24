"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameInfoPvpProvider } from "@/lib/pvp/gameinfo";
import type { PvpFight, PvpPlayerSummary } from "@/lib/pvp/types";
import type { ServerId } from "@/types/albion";

function usePvpProvider(serverId: ServerId) {
  return useMemo(() => new GameInfoPvpProvider(serverId), [serverId]);
}

/**
 * Busqueda de jugadores con debounce (400ms) y minimo 3 caracteres.
 * Sin setState sincronico en efectos: el loading se deriva comparando la
 * firma completada con la peticion actual (patron de useMarketPrices).
 */
export function usePlayerSearch(serverId: ServerId, query: string) {
  const provider = usePvpProvider(serverId);
  const [results, setResults] = useState<PvpPlayerSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completedSignature, setCompletedSignature] = useState("");
  const requested = useRef("");

  const q = query.trim().toLowerCase();
  const signature = `${provider.serverId}|${q}`;
  const submitting = q.length >= 3;
  const loading = submitting && completedSignature !== signature;
  const fresh = completedSignature === signature;

  useEffect(() => {
    if (q.length < 3) return;
    if (requested.current === q) return;
    requested.current = q;
    const timer = setTimeout(() => {
      provider
        .searchPlayers(q)
        .then((found) => {
          setResults(found);
          setError(null);
          setCompletedSignature(signature);
        })
        .catch((err: unknown) => {
          setResults([]);
          setError(err instanceof Error ? err.message : "No se pudieron buscar jugadores.");
          setCompletedSignature(signature);
        });
    }, 400);
    return () => clearTimeout(timer);
    // La firma codifica la busqueda; provider es estable por serverId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, provider]);

  return { results, loading, error, submitting, fresh };
}

export interface PlayerFightData {
  profile: PvpPlayerSummary | null;
  kills: PvpFight[];
  deaths: PvpFight[];
  loading: boolean;
  error: string | null;
  loadedFor: string;
}

/** Perfil + historial de asesinatos/muertes de un jugador. */
export function usePlayerData(serverId: ServerId, playerId: string | null): PlayerFightData {
  const provider = usePvpProvider(serverId);
  const [profile, setProfile] = useState<PvpPlayerSummary | null>(null);
  const [kills, setKills] = useState<PvpFight[]>([]);
  const [deaths, setDeaths] = useState<PvpFight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completedFor, setCompletedFor] = useState<string | null>(null);

  const loading = playerId !== null && completedFor !== playerId;

  useEffect(() => {
    if (!playerId || completedFor === playerId) return;
    Promise.all([
      provider.getPlayer(playerId),
      provider.getPlayerKills(playerId, 50),
      provider.getPlayerDeaths(playerId, 50),
    ])
      .then(([prof, killList, deathList]) => {
        setProfile(prof);
        setKills(killList);
        setDeaths(deathList);
        setError(null);
        setCompletedFor(playerId);
      })
      .catch((err: unknown) => {
        setProfile(null);
        setKills([]);
        setDeaths([]);
        setError(err instanceof Error ? err.message : "No se pudieron cargar los datos del jugador.");
        setCompletedFor(playerId);
      });
  }, [provider, playerId, completedFor]);

  return { profile, kills, deaths, loading, error, loadedFor: completedFor ?? "" };
}

export interface PvpEventsState {
  events: PvpFight[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  isFresh: boolean;
  signature: string;
}

/**
 * Eventos globales de PvP por servidor (vendados a la UI): pide varias
 * paginas para tener muestra suficiente. refresh fuerza re-carga y el
 * provider deduplica/cachea URLs, asi no hay requests duplicados.
 */
export function usePvpEvents(
  serverId: ServerId,
  pageCount = 4,
  pageSize = 100
): PvpEventsState {
  const provider = usePvpProvider(serverId);
  const [tick, setTick] = useState(0);
  const [events, setEvents] = useState<PvpFight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completedSignature, setCompletedSignature] = useState<string | null>(null);

  const signature = `${provider.serverId}|${pageCount}|${pageSize}|${tick}`;
  const loading = completedSignature !== signature;
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const pages = Array.from({ length: pageCount }, (_, i) =>
      provider.getEvents(pageSize, i * pageSize)
    );
    Promise.all(pages)
      .then((results) => {
        const merged: PvpFight[] = [];
        const seen = new Set<string>();
        for (const list of results) {
          for (const f of list) {
            if (seen.has(f.id)) continue;
            seen.add(f.id);
            merged.push(f);
          }
        }
        setEvents(merged);
        setError(null);
        setCompletedSignature(signature);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los eventos PvP.");
        setCompletedSignature(signature);
      });
    // pageCount/pageSize fijos por el caller; la firma incluye tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, signature]);

  return {
    events,
    loading,
    error,
    refresh,
    isFresh: completedSignature === signature,
    signature,
  };
}

/** Polling ligero: solo mientas la pestaña es visible y hay montaje. */
export function useVisibleInterval(callback: () => void, intervalMs: number, active: boolean) {
  const cbRef = useRef(callback);

  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) return;
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        cbRef.current();
      }
    };
    const id = window.setInterval(() => cbRef.current(), intervalMs);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, intervalMs]);
}