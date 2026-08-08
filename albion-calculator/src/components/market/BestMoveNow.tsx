"use client";

import { AnimatedNumber } from "@/components/AnimatedNumber";
import type { MarketOpportunity } from "@/lib/market/types";

const RISK_STYLES: Record<string, string> = {
  LOW: "bg-emerald-500/10 text-emerald-400",
  MEDIUM: "bg-amber-500/10 text-amber-400",
  HIGH: "bg-red-500/10 text-red-400",
};

export function RiskBadge({ risk }: { risk: MarketOpportunity["risk"] }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${RISK_STYLES[risk]}`}>
      {risk === "LOW" ? "Bajo" : risk === "MEDIUM" ? "Medio" : "Alto"}
    </span>
  );
}

interface BestMoveNowProps {
  move: MarketOpportunity | null;
  loading: boolean;
  error: string | null;
}

/** Mejor movimiento ahora: la oportunidad con mayor ROI del escaneo. */
export function BestMoveNow({ move, loading, error }: BestMoveNowProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
        <p className="text-sm text-[var(--color-text-dim)]">
          Escaneando el mercado…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!move) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
        <p className="text-sm text-[var(--color-text-dim)]">
          Datos insuficientes: no hay ninguna oportunidad rentable con los
          filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/5 p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--color-gold)]">
        Mejor movimiento ahora
      </p>
      <p className="mt-1 text-base font-semibold text-[var(--color-text)]">
        {move.title}
      </p>
      <p className="text-sm text-[var(--color-text-dim)]">{move.detail}</p>
      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-[var(--color-text-dim)]">Capital</p>
          <p className="font-medium text-[var(--color-text)]">
            <AnimatedNumber
              value={move.capital}
              format={(v) => Math.round(v).toLocaleString("es-ES")}
            />
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-text-dim)]">
            Beneficio neto
          </p>
          <p className="font-medium text-emerald-400">
            <AnimatedNumber
              value={move.profit}
              format={(v) => Math.round(v).toLocaleString("es-ES")}
            />
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-text-dim)]">ROI</p>
          <p className="font-medium text-[var(--color-gold)]">
            {move.roi.toFixed(1)} %
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-text-dim)]">Riesgo</p>
          <RiskBadge risk={move.risk} />
        </div>
      </div>
    </div>
  );
}
