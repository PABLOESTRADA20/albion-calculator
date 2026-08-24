"use client";

import { useMemo, useState } from "react";
import { usePlayerSearch } from "@/lib/pvp/usePvp";
import type { ServerId } from "@/types/albion";
import type { PvpPlayerSummary } from "@/lib/pvp/types";

interface PlayerSearchProps {
  serverId: ServerId;
  onSelect: (player: PvpPlayerSummary) => void;
  label?: string;
}

export function PlayerSearch({ serverId, onSelect, label = "Buscar jugador" }: PlayerSearchProps) {
  const [query, setQuery] = useState("");
  const { results, loading, error, submitting, fresh } = usePlayerSearch(serverId, query);

  const visibleResults = useMemo(
    () => (submitting && fresh ? results : []),
    [submitting, fresh, results]
  );

  return (
    <div>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
          {label}
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej: Yamilil (mínimo 3 letras)"
          className="w-full max-w-md rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:border-[var(--color-gold)] focus:outline-none"
        />
      </label>

      {loading && (
        <p className="mt-2 text-xs text-[var(--color-text-dim)]">Buscando…</p>
      )}
      {error && (
        <p className="mt-2 rounded border border-red-500/30 bg-red-500/10 px-2 py-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
      {!loading && submitting && fresh && visibleResults.length === 0 && (
        <p className="mt-2 text-xs text-[var(--color-text-dim)]">
          No se encontraron jugadores con ese nombre.
        </p>
      )}
      {visibleResults.length > 0 && (
        <ul className="mt-2 w-full max-w-md space-y-1">
          {visibleResults.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => onSelect(p)}
                className="flex w-full items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-2 text-left text-sm transition-colors hover:border-[var(--color-gold)]"
              >
                <span className="font-medium text-[var(--color-text)]">{p.name}</span>
                <span className="text-xs text-[var(--color-text-dim)]">
                  {p.kills} kills · {p.deaths} deaths
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}