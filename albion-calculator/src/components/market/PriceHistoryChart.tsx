"use client";

import { useMemo } from "react";
import type { PriceHistoryPoint } from "@/lib/history/historyProvider";

interface PriceHistoryChartProps {
  points: PriceHistoryPoint[];
  height?: number;
}

/** Grafico de linea SVG sin dependencias: precio medio por hora. */
export function PriceHistoryChart({
  points,
  height = 160,
}: PriceHistoryChartProps) {
  const { path, min, max } = useMemo(() => {
    const values = points.map((p) => p.avgPrice);
    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 1;
    const range = max - min || 1;
    const width = 600;
    const stepX = values.length > 1 ? width / (values.length - 1) : width;
    const stepY = (height - 20) / range;
    const path = values
      .map((v, i) => {
        const x = i * stepX;
        const y = height - 10 - (v - min) * stepY;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
    return { path, min, max };
  }, [points, height]);

  if (points.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-dim)]">
        Sin datos de historial para este item y ciudad.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-text-dim)]">
        <span>
          Precio medio (venta) — {points.length} puntos
        </span>
        <span>
          <span className="text-[var(--color-gold)]">
            {min.toLocaleString("es-ES")}
          </span>{" "}
          a{" "}
          <span className="text-[var(--color-gold)]">
            {max.toLocaleString("es-ES")}
          </span>
        </span>
      </div>
      <svg
        viewBox={`0 0 600 ${height}`}
        preserveAspectRatio="none"
        className="h-40 w-full"
        role="img"
        aria-label="Historial de precios"
      >
        <path d={path} fill="none" stroke="var(--color-gold)" strokeWidth="2" />
        {points.map((p, i) => (
          <circle
            key={p.timestamp + i}
            cx={((i * 600) / Math.max(1, points.length - 1)).toFixed(1)}
            cy={(height - 10 - ((p.avgPrice - min) / (max - min || 1)) * (height - 20)).toFixed(1)}
            r="2"
            fill="var(--color-gold)"
          />
        ))}
      </svg>
      <p className="mt-1 text-[10px] text-[var(--color-text-dim)]">
        {points[0]?.timestamp} → {points[points.length - 1]?.timestamp}
      </p>
    </div>
  );
}
