"use client";

import { useMemo, useState } from "react";
import { gatheringPlan, GATHER_PROFESSION_LABELS } from "@/lib/avalon/gathering";
import type { GatheringProfession } from "@/lib/avalon/gathering";
import { useMarketPrices } from "@/lib/useMarketPrices";
import { CITIES } from "@/types/albion";
import { itemName } from "@/lib/builds/items";
import type { PriceProvider } from "@/types/albion";
import { ItemIcon } from "@/components/ItemIcon";

const PROFESSIONS: GatheringProfession[] = ["wood", "ore", "hide", "fiber", "stone"];

export function GatheringOptimizer({ provider }: { provider: PriceProvider }) {
  const [profession, setProfession] = useState<GatheringProfession>("wood");
  const [tier, setTier] = useState(6);

  const plan = useMemo(() => gatheringPlan(profession, tier), [profession, tier]);

  const itemIds = useMemo(() => plan.suggestions.map((s) => s.itemId), [plan]);

  const cities = useMemo(() => [...CITIES], []);

  const { prices, loading, error } = useMarketPrices(provider, itemIds, cities, 1, `gather-${profession}-${tier}`);

  const priceFor = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of prices) {
      if (p.sellPriceMin <= 0) continue;
      const current = map.get(p.itemId);
      if (current === undefined || p.sellPriceMin < current) map.set(p.itemId, p.sellPriceMin);
    }
    return map;
  }, [prices]);

  const total = useMemo(
    () => Array.from(priceFor.values()).reduce((a, b) => a + b, 0),
    [priceFor]
  );

  const fmt = (v: number) => v.toLocaleString("es-ES", { maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Profesión</span>
          <select
            value={profession}
            onChange={(e) => setProfession(e.target.value as GatheringProfession)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-1.5 text-sm text-[var(--color-text)]"
          >
            {PROFESSIONS.map((p) => (
              <option key={p} value={p}>
                {GATHER_PROFESSION_LABELS[p]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Tier de herramienta</span>
          <div className="flex gap-1">
            {[4, 5, 6, 7, 8].map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  tier === t
                    ? "bg-[var(--color-gold)] text-black"
                    : "bg-[var(--color-panel-raised)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                }`}
              >
                T{t}
              </button>
            ))}
          </div>
        </label>
      </div>

      {loading && (
        <p className="text-sm text-[var(--color-text-dim)]">Consultando precios de herramienta y armadura…</p>
      )}
      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
                Herramienta {GATHER_PROFESSION_LABELS[profession]}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <ItemIcon itemId={plan.toolId} size={28} className="shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{itemName(plan.toolId)}</p>
                  <p className={`text-xs ${priceFor.has(plan.toolId) ? "text-emerald-400" : "text-[var(--color-text-dim)]"}`}>
                    {priceFor.has(plan.toolId)
                      ? `${fmt(priceFor.get(plan.toolId)!)} plata (precio más bajo)`
                      : "Datos de precio no disponibles"}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Inversión total set</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-gold)]">
                {priceFor.size > 0 ? fmt(total) : "—"}
              </p>
              <p className="text-xs text-[var(--color-text-dim)]">
                {priceFor.size}/{plan.suggestions.length} items con precio
              </p>
            </div>
          </div>

          {!plan.stoneArmorAvailable && (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
              La profesión de piedra no tiene armadura de gathering en Albion: usa defensas normales
              (guanteletes o capa defíensiva) mientras recolectas.
            </p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            {plan.suggestions.map((s) => (
              <div key={s.itemId} className="flex items-center gap-2 rounded-md bg-[var(--color-panel)] px-3 py-2">
                <ItemIcon itemId={s.itemId} size={24} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-[var(--color-text)]">{itemName(s.itemId)}</p>
                  <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
                    {s.slot === "main" ? "Herramienta" : "Armadura"} · T{tier}
                  </p>
                </div>
                <p className="text-xs font-medium text-emerald-400">
                  {priceFor.has(s.itemId) ? fmt(priceFor.get(s.itemId)!) : "—"}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}