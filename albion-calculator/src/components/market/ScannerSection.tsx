"use client";

import { useMemo, useState } from "react";
import { BestMoveNow, RiskBadge } from "@/components/market/BestMoveNow";
import { Table } from "@/components/market/Table";
import { ItemIcon } from "@/components/ItemIcon";
import { useMarketPrices } from "@/lib/useMarketPrices";
import { DEFAULT_SCAN_FILTERS, scanMarket } from "@/lib/market/finders";
import { bestMoves } from "@/lib/market/finders";
import { groupPricesByItem } from "@/lib/market/types";
import type { RiskLevel } from "@/lib/market/types";
import { SCAN_UNIVERSE_IDS } from "@/lib/market/universe";
import { itemName } from "@/lib/builds/items";
import type { PriceProvider } from "@/types/albion";
import { CITIES } from "@/types/albion";

interface ScannerSectionProps {
  provider: PriceProvider;
}

const CATEGORIES = [
  { id: "all", label: "Todas" },
  { id: "weapon", label: "Armas" },
  { id: "offhand", label: "Mano izquierda" },
  { id: "armor", label: "Armadura" },
  { id: "cape", label: "Capas" },
  { id: "potion", label: "Pociones" },
  { id: "mount", label: "Monturas" },
];

const RISKS: { id: RiskLevel | "all"; label: string }[] = [
  { id: "all", label: "Cualquier riesgo" },
  { id: "LOW", label: "Bajo" },
  { id: "MEDIUM", label: "Medio" },
  { id: "HIGH", label: "Alto" },
];

const num = (v: string) => (v.trim() === "" ? 0 : Number(v));

export function ScannerSection({ provider }: ScannerSectionProps) {
  const [tier, setTier] = useState(0);
  const [category, setCategory] = useState("all");
  const [quantity, setQuantity] = useState(1);
  const [minRoi, setMinRoi] = useState("");
  const [minProfit, setMinProfit] = useState("");
  const [maxCapital, setMaxCapital] = useState("");
  const [risk, setRisk] = useState<RiskLevel | "all">("all");

  const cities = useMemo(() => [...CITIES], []);
  const universeIds = useMemo(() => SCAN_UNIVERSE_IDS, []);

  const { prices, loading, error, refresh } = useMarketPrices(
    provider,
    universeIds,
    cities,
    1,
    "scanner"
  );

  const opportunities = useMemo(() => {
    if (prices.length === 0) return [];
    return scanMarket(groupPricesByItem(prices), {
      ...DEFAULT_SCAN_FILTERS,
      tier,
      category,
      quantity,
      minRoi: num(minRoi),
      minProfit: num(minProfit),
      maxCapital: num(maxCapital),
      risk,
    }).map((o) => ({ ...o, title: itemName(o.title) }));
  }, [prices, tier, category, quantity, minRoi, minProfit, maxCapital, risk]);

  const topMove = opportunities.length > 0 ? opportunities[0] : null;
  const ranking = useMemo(() => bestMoves(opportunities, 25), [opportunities]);

  return (
    <div className="space-y-4">
      <BestMoveNow move={topMove} loading={loading} error={error} />

      <div className="grid gap-x-4 gap-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4 sm:grid-cols-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            Tier
          </p>
          <select
            value={tier}
            onChange={(e) => setTier(Number(e.target.value))}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-sm text-[var(--color-text)]"
          >
            <option value={0}>Todos</option>
            {[4, 5, 6].map((t) => (
              <option key={t} value={t}>
                T{t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            Categoría
          </p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-sm text-[var(--color-text)]"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            Cantidad
          </p>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, num(e.target.value)))}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-sm text-[var(--color-text)]"
          />
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            Riesgo
          </p>
          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value as RiskLevel | "all")}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-sm text-[var(--color-text)]"
          >
            {RISKS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            ROI mín. (%)
          </p>
          <input
            type="number"
            min={0}
            value={minRoi}
            onChange={(e) => setMinRoi(e.target.value)}
            placeholder="0"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-sm text-[var(--color-text)]"
          />
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            Beneficio mín.
          </p>
          <input
            type="number"
            min={0}
            value={minProfit}
            onChange={(e) => setMinProfit(e.target.value)}
            placeholder="0"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-sm text-[var(--color-text)]"
          />
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            Capital máx.
          </p>
          <input
            type="number"
            min={0}
            value={maxCapital}
            onChange={(e) => setMaxCapital(e.target.value)}
            placeholder="Sin límite"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-sm text-[var(--color-text)]"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={refresh}
            disabled={loading}
            className="w-full rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
          >
            Actualizar
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-[var(--color-text-dim)]">
          Escaneando {universeIds.length} items en {cities.length} ciudades…
        </p>
      )}

      {!loading && !error && ranking.length > 0 && (
        <Table headers={["Item", "Ruta", "Capital", "Neto", "ROI", "Riesgo"]}>
          {ranking.map((o) => (
            <tr key={o.id} className="bg-[var(--color-panel)]">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <ItemIcon
                    itemId={o.title}
                    size={22}
                    className="shrink-0"
                  />
                  <span className="text-sm text-[var(--color-text)]">
                    {o.title}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 text-sm text-[var(--color-text-dim)]">
                {o.detail}
              </td>
              <td className="px-3 py-2 text-right text-sm text-[var(--color-text)]">
                {o.capital.toLocaleString("es-ES")}
              </td>
              <td className="px-3 py-2 text-right text-sm font-medium text-emerald-400">
                {o.profit.toLocaleString("es-ES")}
              </td>
              <td className="px-3 py-2 text-right text-sm font-medium text-[var(--color-gold)]">
                {o.roi.toFixed(1)} %
              </td>
              <td className="px-3 py-2 text-right">
                <RiskBadge risk={o.risk} />
              </td>
            </tr>
          ))}
        </Table>
      )}

      {!loading && !error && ranking.length === 0 && (
        <p className="text-sm text-[var(--color-text-dim)]">
          Datos insuficientes: no hay oportunidades que cumplan los filtros.
        </p>
      )}
    </div>
  );
}
