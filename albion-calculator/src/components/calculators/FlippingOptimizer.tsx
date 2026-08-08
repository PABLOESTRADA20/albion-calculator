"use client";

import { useMemo, useState } from "react";
import { BestMoveNow } from "@/components/market/BestMoveNow";
import { RiskBadge } from "@/components/market/BestMoveNow";
import { Table } from "@/components/market/Table";
import { ItemIcon } from "@/components/ItemIcon";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { useMarketPrices } from "@/lib/useMarketPrices";
import { buyOrderCost } from "@/lib/calc/market";
import { formatPercent, formatSilver, profitClass } from "@/lib/calc/format";
import { itemCategory, riskOf } from "@/lib/market/finders";
import type { MarketOpportunity } from "@/lib/market/types";
import { itemName } from "@/lib/builds/items";
import { SCAN_UNIVERSE_IDS } from "@/lib/market/universe";
import type { City, PriceProvider } from "@/types/albion";
import { CITIES } from "@/types/albion";
import { Checkbox, NumberField, SelectField } from "@/components/UI";

interface FlippingOptimizerProps {
  provider: PriceProvider;
}

interface FlipRow {
  itemId: string;
  city: City;
  bid: number;
  cost: number;
  sellNow: number;
  profit: number;
  roi: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
}

export function FlippingOptimizer({ provider }: FlippingOptimizerProps) {
  const [tier, setTier] = useState(0);
  const [kind, setKind] = useState("all");
  const [bidPct, setBidPct] = useState(90);
  const [minProfit, setMinProfit] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [premium, setPremium] = useState(true);

  const cities: City[] = useMemo(() => [...CITIES], []);
  const universeIds = useMemo(() => SCAN_UNIVERSE_IDS, []);

  const { prices, loading, error, refresh } = useMarketPrices(
    provider,
    universeIds,
    cities,
    1,
    "flipping-optimizer"
  );

  const rows: FlipRow[] = useMemo(() => {
    const byItem = new Map<string, Map<City, { sell: number; buy: number }>>();
    for (const p of prices) {
      let byCity = byItem.get(p.itemId);
      if (!byCity) {
        byCity = new Map();
        byItem.set(p.itemId, byCity);
      }
      byCity.set(p.city, { sell: p.sellPriceMin, buy: p.buyPriceMax });
    }

    const out: FlipRow[] = [];
    for (const [itemId, byCity] of byItem) {
      let best: FlipRow | null = null;
      for (const [city, v] of byCity) {
        if (v.sell <= 0 || v.buy <= 0) continue;
        const bid = Math.round((v.buy * bidPct) / 100);
        const cost = buyOrderCost(bid, premium);
        const profit = Math.round((v.buy - cost) * quantity);
        if (profit < minProfit) continue;
        const roi = cost > 0 ? ((v.buy - cost) / cost) * 100 : 0;
        const spread = v.sell > 0 ? (v.buy - v.sell) / v.sell : 0;
        const row: FlipRow = {
          itemId,
          city,
          bid,
          cost: Math.round(cost * quantity),
          sellNow: Math.round(v.buy * quantity),
          profit,
          roi,
          risk: riskOf(roi, spread),
        };
        if (!best || profit > best.profit) best = row;
      }
      if (best) out.push(best);
    }

    return out.sort((a, b) => b.profit - a.profit);
  }, [prices, bidPct, premium, quantity, minProfit]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (tier > 0) {
          const m = /^T(\d)/.exec(r.itemId);
          if (!m || Number(m[1]) !== tier) return false;
        }
        if (kind !== "all" && itemCategory(r.itemId) !== kind) return false;
        return true;
      }),
    [rows, tier, kind]
  );

  const top = filtered[0] ?? null;

  const move: MarketOpportunity | null = useMemo(() => {
    if (!top) return null;
    return {
      id: `${top.itemId}|${top.city}|flip`,
      activity: "Flipping",
      title: itemName(top.itemId),
      detail: `Orden de compra al ${bidPct} % y venta al contado en ${top.city}`,
      city: top.city,
      capital: top.cost,
      profit: top.profit,
      roi: top.roi,
      risk: top.risk,
    };
  }, [top, bidPct]);

  return (
    <div className="space-y-4">
      <BestMoveNow move={move} loading={loading} error={error} />

      <div className="grid gap-x-4 gap-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4 sm:grid-cols-4">
        <SelectField
          label="Tipo de item"
          value={kind}
          onChange={setKind}
          options={[
            { value: "all", label: "Todos" },
            { value: "weapon", label: "Armas" },
            { value: "offhand", label: "Mano izquierda" },
            { value: "armor", label: "Armadura" },
            { value: "cape", label: "Capas" },
            { value: "potion", label: "Pociones" },
            { value: "mount", label: "Monturas" },
          ]}
        />
        <SelectField
          label="Tier"
          value={tier}
          onChange={setTier}
          options={[
            { value: 0, label: "Todos" },
            { value: 4, label: "T4" },
            { value: 5, label: "T5" },
            { value: 6, label: "T6" },
          ]}
        />
        <NumberField
          label="Tu oferta (% del precio de venta)"
          value={bidPct}
          onChange={setBidPct}
          min={1}
          max={99}
        />
        <NumberField
          label="Cantidad"
          value={quantity}
          onChange={setQuantity}
          min={1}
        />
        <NumberField
          label="Beneficio mínimo por flip"
          value={minProfit}
          onChange={setMinProfit}
          min={0}
          step={1000}
        />
        <div className="flex flex-wrap items-end gap-6">
          <Checkbox
            label="Premium"
            checked={premium}
            onChange={setPremium}
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
          Consultando {universeIds.length} items en {cities.length} ciudades…
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <Table
          headers={[
            "Item",
            "Ciudad",
            "Oferta",
            "Coste orden",
            "Venta contado",
            "Ganancia",
            "ROI",
            "Riesgo",
          ]}
        >
          {filtered.slice(0, 25).map((r) => (
            <tr key={`${r.itemId}|${r.city}`} className="bg-[var(--color-panel)]">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <ItemIcon itemId={r.itemId} size={22} className="shrink-0" />
                  <span className="text-sm text-[var(--color-text)]">
                    {itemName(r.itemId)}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 text-sm text-[var(--color-text)]">
                {r.city}
              </td>
              <td className="px-3 py-2 text-right text-sm text-[var(--color-text-dim)]">
                {r.bid.toLocaleString("es-ES")}
              </td>
              <td className="px-3 py-2 text-right text-sm text-[var(--color-text)]">
                {formatSilver(r.cost)}
              </td>
              <td className="px-3 py-2 text-right text-sm text-[var(--color-text)]">
                {formatSilver(r.sellNow)}
              </td>
              <td
                className={`px-3 py-2 text-right text-sm font-medium ${profitClass(r.profit)}`}
              >
                <AnimatedNumber value={r.profit} format={formatSilver} />
              </td>
              <td
                className={`px-3 py-2 text-right text-sm ${profitClass(r.profit)}`}
              >
                {formatPercent(r.roi)}
              </td>
              <td className="px-3 py-2 text-right">
                <RiskBadge risk={r.risk} />
              </td>
            </tr>
          ))}
        </Table>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-[var(--color-text-dim)]">
          Datos insuficientes: no hay flips que cumplan los filtros.
        </p>
      )}
    </div>
  );
}
