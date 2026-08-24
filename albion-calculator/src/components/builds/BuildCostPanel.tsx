"use client";

import { useState } from "react";
import { SLOT_LABELS } from "@/lib/builds/types";
import type { BuildItemSpec } from "@/lib/builds/types";
import { itemName } from "@/lib/builds/items";
import { useBuildCost } from "@/lib/avalon/cost";
import type { PriceProvider } from "@/types/albion";
import { ItemIcon } from "@/components/ItemIcon";
import { Table, BestBadge } from "@/components/market/Table";

interface BuildCostPanelProps {
  provider: PriceProvider;
  items: BuildItemSpec[];
  refreshKey: string;
  title?: string;
}

export function BuildCostPanel({ provider, items, refreshKey, title = "Coste de compra" }: BuildCostPanelProps) {
  const [showTable, setShowTable] = useState(false);
  const { tier, setTier, enchant, setEnchant, quality, setQuality, loading, error, refresh, summary } =
    useBuildCost(provider, items, refreshKey);

  const fmt = (v: number) => v.toLocaleString("es-ES", { maximumFractionDigits: 0 });

  return (
    <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">
          {title}
        </p>
        <div className="flex items-center gap-1">
          {[4, 5, 6, 7, 8].map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                tier === t
                  ? "bg-[var(--color-gold)] text-black"
                  : "bg-[var(--color-panel-raised)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
              }`}
            >
              T{t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((e) => (
            <button
              key={e}
              onClick={() => setEnchant(e)}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                enchant === e
                  ? "bg-[var(--color-gold)] text-black"
                  : "bg-[var(--color-panel-raised)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
              }`}
            >
              .{e}
            </button>
          ))}
        </div>
        <select
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
          className="rounded border border-[var(--color-border)] bg-[var(--color-panel-raised)] px-2 py-0.5 text-xs text-[var(--color-text)]"
        >
          {[1, 2, 3, 4, 5].map((q) => (
            <option key={q} value={q}>
              Q{q}
            </option>
          ))}
        </select>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
        >
          Actualizar
        </button>
      </div>

      {loading && (
        <p className="mt-2 text-xs text-[var(--color-text-dim)]">Consultando precios en las ciudades…</p>
      )}

      {error && (
        <p className="mt-2 rounded border border-red-500/30 bg-red-500/10 px-2 py-1.5 text-xs text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && summary && (
        <div className="mt-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-2.5">
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
                Coste normal (una ciudad)
              </p>
              <p className="mt-0.5 text-lg font-semibold text-[var(--color-text)]">
                {summary.normal === Infinity ? "—" : fmt(summary.normal)}
              </p>
              {summary.normalCity && (
                <p className="text-[10px] text-[var(--color-gold)]">Mejor ciudad: {summary.normalCity}</p>
              )}
            </div>
            <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-2.5">
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
                Coste optimizado
              </p>
              <p className="mt-0.5 text-lg font-semibold text-emerald-400">
                {summary.optimized === 0 && summary.dataItems === 0 ? "—" : fmt(summary.optimized)}
              </p>
              <p className="text-[10px] text-[var(--color-text-dim)]">
                {summary.dataItems}/{summary.totalItems} items con datos
              </p>
            </div>
            <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-2.5">
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">Ahorro</p>
              <p className="mt-0.5 text-lg font-semibold text-[var(--color-gold)]">
                {summary.savings > 0 ? `${fmt(summary.savings)} (${summary.savingsPct.toFixed(1)} %)` : "—"}
              </p>
              <p className="text-[10px] text-[var(--color-text-dim)]">
                {summary.savings > 0 ? `Comprando en ${summary.strategy.length} ciudades` : "Sin ahorro posible"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 px-3 py-2">
            <p className="text-sm font-medium text-[var(--color-text)]">BUY BUILD</p>
            <button
              onClick={() => setShowTable((s) => !s)}
              className="rounded-md bg-[var(--color-gold)] px-3 py-1.5 text-xs font-bold text-black transition-opacity hover:opacity-90"
            >
              {showTable ? "Ocultar estrategia" : "Ver estrategia de compra"}
            </button>
          </div>

          {showTable && (
            <div className="space-y-2">
              {summary.strategy.length > 0 ? (
                <ul className="space-y-1">
                  {summary.strategy.map((g) => (
                    <li key={g.city} className="text-xs text-[var(--color-text-dim)]">
                      <span className="font-medium text-[var(--color-gold)]">
                        {g.city} · {g.count} items · {fmt(g.subtotal)}
                      </span>
                      <span className="block text-[10px]">{g.names.join(", ")}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[var(--color-text-dim)]">
                  Sin precios para esta combinación de tier/calidad.
                </p>
              )}

              {summary.missing.length > 0 && (
                <p className="text-xs text-amber-400">
                  Sin datos: {summary.missing.join(", ")}
                </p>
              )}

              <div className="max-h-64 overflow-auto">
                <Table headers={["Slot", "Item", "Mejor ciudad", "Precio"]}>
                  {summary.rows.map((r) => (
                    <tr key={r.spec.slot} className="bg-[var(--color-panel)]">
                      <td className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
                        {SLOT_LABELS[r.spec.slot]}
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <ItemIcon itemId={r.resolvedId} size={20} className="shrink-0" />
                          <span className="text-xs text-[var(--color-text)]">
                            {r.spec.label ?? itemName(r.resolvedId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-xs text-[var(--color-text)]">
                        {r.city ? (
                          <>
                            {r.city} <BestBadge>mejor</BestBadge>
                          </>
                        ) : (
                          <span className="text-[var(--color-text-dim)]">sin datos</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-right text-xs font-medium">
                        {r.price > 0 ? fmt(r.price) : "—"}
                      </td>
                    </tr>
                  ))}
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}