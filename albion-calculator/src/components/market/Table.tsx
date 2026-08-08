"use client";

import type { ReactNode } from "react";
import { AnimatedNumber } from "@/components/AnimatedNumber";

export function Table({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel-raised)] text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
            {headers.map((h, i) => (
              <th
                key={h}
                className={`py-2.5 px-3 text-left font-medium ${
                  i === headers.length - 1 ? "text-right" : ""
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">{children}</tbody>
      </table>
    </div>
  );
}

export function BestBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-gold)]/15 px-2 py-0.5 text-xs font-medium text-[var(--color-gold)]">
      {children}
    </span>
  );
}

export function AnimatedPrice({ value }: { value: number }) {
  return <AnimatedNumber value={value} format={(v) => Math.round(v).toLocaleString("es-ES")} />;
}
