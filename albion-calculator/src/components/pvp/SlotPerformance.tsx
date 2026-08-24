"use client";

import { useMemo } from "react";
import { slotLabel, slotUsage } from "@/lib/pvp/analytics";
import { usePvpEvents } from "@/lib/pvp/usePvp";
import type { EquipSlot } from "@/lib/pvp/types";
import type { ServerId } from "@/types/albion";

interface SlotPerformanceProps {
  serverId: ServerId;
}

const SLOT_ORDER: EquipSlot[] = ["weapon", "offhand", "head", "chest", "shoes", "cape"];

/**
 * Items mas usados por slot segun las muertes reales de la muestra.
 * Datos reales de la fuente (gameinfo), sin inventar precios ni stats.
 */
export function SlotPerformance({ serverId }: SlotPerformanceProps) {
  const { events, loading, error, refresh } = usePvpEvents(serverId);
  const slots = useMemo(() => slotUsage(events), [events]);

  const totalDeaths = events.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
          Items más usados por slot (de las víctimas de la muestra)
        </p>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
        >
          Refrescar
        </button>
      </div>

      {loading && <p className="text-sm text-[var(--color-text-dim)]">Cargando muestra…</p>}
      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      {!loading && !error && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SLOT_ORDER.map((slot) => {
            const items = slots[slot] ?? [];
            return (
              <div key={slot} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-3">
                <p className="mb-2 text-xs font-semibold text-[var(--color-text)]">{slotLabel(slot)}</p>
                {items.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-dim)]">Sin datos suficientes.</p>
                ) : (
                  <ol className="space-y-1">
                    {items.slice(0, 5).map((s, i) => (
                      <li key={s.itemId} className="flex items-center gap-2 text-xs">
                        <span className="w-4 text-[var(--color-gold)]">{i + 1}</span>
                        <span className="flex-1 truncate text-[var(--color-text)]" title={s.itemName}>
                          {s.itemName}
                        </span>
                        <span className="text-[var(--color-text-dim)]">
                          {((s.deaths / totalDeaths) * 100).toFixed(1)} %
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
        Basado en {totalDeaths} muertes reales de la muestra ({Math.min(5, totalDeaths)}+ apariciones por ítem).
      </p>
    </div>
  );
}