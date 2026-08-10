"use client";

import { useMemo, useState } from "react";
import { sellOrderRevenue } from "@/lib/calc/market";
import { AVALON_ACTIVITIES, ACTIVITY_LABELS } from "@/lib/builds/types";
import type { AvalonActivity } from "@/lib/builds/types";

interface LootItem {
  name: string;
  value: number;
}

/**
 * Avalon -> Mercado: estima lo que queda del loot de una road tras venderlo.
 * Los valores del loot los introduce el jugador (no hay datos publicos de
 * drop rates); el calculo de impuestos usa las tarifas reales del mercado.
 */
export function LootOptimizer() {
  const [loot, setLoot] = useState<LootItem[]>([
    { name: "Recursos", value: 500_000 },
    { name: "Artefactos", value: 300_000 },
    { name: "Equipamiento T5-T6", value: 200_000 },
  ]);
  const [premium, setPremium] = useState(true);
  const [activity, setActivity] = useState<AvalonActivity>("loot");

  const totalValue = useMemo(() => loot.reduce((a, l) => a + l.value, 0), [loot]);
  const netAfterFees = useMemo(
    () => totalValue - (totalValue - sellOrderRevenue(totalValue, premium)),
    [totalValue, premium]
  );
  const fees = useMemo(() => totalValue - netAfterFees, [totalValue, netAfterFees]);

  const update = (index: number, patch: Partial<LootItem>) =>
    setLoot((l) => l.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const fmt = (v: number) => v.toLocaleString("es-ES", { maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-[var(--color-text-dim)]">
        Optimiza la conversión de loot de Roads a plata. No existen tasas de drop
        públicas: introduce lo que esperas sacar por categoría y el módulo calcula
        el ingreso neto tras impuestos de venta con las tarifas reales del mercado.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Origen</span>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as AvalonActivity)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-3 py-1.5 text-sm text-[var(--color-text)]"
          >
            {AVALON_ACTIVITIES.map((a) => (
              <option key={a} value={a}>
                {ACTIVITY_LABELS[a]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
          <input
            type="checkbox"
            checked={premium}
            onChange={(e) => setPremium(e.target.checked)}
            className="accent-[var(--color-gold)]"
          />
          Premium (3% en vez de 6% de impuesto de venta)
        </label>
      </div>

      <div className="space-y-2">
        {loot.map((item, i) => (
          <div key={i} className="flex items-center gap-2 rounded-md bg-[var(--color-panel)] px-3 py-2">
            <input
              value={item.name}
              onChange={(e) => update(i, { name: e.target.value })}
              className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-sm text-[var(--color-text)] focus:border-[var(--color-border)]"
            />
            <input
              type="number"
              min={0}
              value={item.value}
              onChange={(e) => update(i, { value: Math.max(0, Number(e.target.value)) })}
              className="w-32 rounded border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-2 py-1 text-right text-sm text-[var(--color-text)]"
            />
            <button
              onClick={() => setLoot((l) => l.filter((_, idx) => idx !== i))}
              className="rounded px-2 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => setLoot((l) => [...l, { name: "Categoría extra", value: 0 }])}
          className="rounded-md border border-dashed border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)]"
        >
          + Añadir categoría
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Loot bruto</p>
          <p className="mt-1 text-xl font-semibold text-[var(--color-text)]">{fmt(totalValue)}</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Impuestos de venta</p>
          <p className="mt-1 text-xl font-semibold text-amber-400">-{fmt(fees)}</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-dim)]">Plata final en caja</p>
          <p className="mt-1 text-xl font-semibold text-emerald-400">{fmt(netAfterFees)}</p>
        </div>
      </div>

      <p className="text-xs text-[var(--color-text-dim)]">
        Consejo: vende artefactos y equipamiento en la ciudad con mejor precio usando
        la pestaña Mercado; los recursos se transportan mejor con montura de carga.
      </p>
    </div>
  );
}