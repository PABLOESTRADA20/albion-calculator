"use client";

import { ItemIcon } from "@/components/ItemIcon";
import { DIFFICULTY_LABELS } from "@/lib/builds/types";
import type { Build } from "@/lib/builds/types";
import { buildItemId } from "@/lib/builds/types";
import { itemName } from "@/lib/builds/items";

interface BuildCardProps {
  build: Build;
  onOptimize: (build: Build) => void;
}

export function BuildCard({ build, onOptimize }: BuildCardProps) {
  return (
    <article className="flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            {build.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-[var(--color-gold)]/10 px-2 py-0.5 text-xs text-[var(--color-gold)]">
              {build.category}
            </span>
            <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-xs text-[var(--color-text-dim)]">
              {build.role}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                build.difficulty === 3
                  ? "bg-red-500/10 text-red-400"
                  : build.difficulty === 2
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {DIFFICULTY_LABELS[build.difficulty]}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-dim)]">
        {build.description}
      </p>

      <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {build.items.map((spec) => {
          const id = buildItemId(spec);
          return (
            <li
              key={spec.slot}
              className="flex items-center gap-2 rounded-md bg-[var(--color-panel)] px-2 py-1.5"
            >
              <ItemIcon itemId={id} size={24} className="shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-xs text-[var(--color-text)]">
                  {itemName(id)}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-dim)]">
                  T{spec.tier}.{spec.enchant}
                  {spec.enchant > 0 ? "" : ""}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 grid gap-1 text-xs text-[var(--color-text-dim)] sm:grid-cols-2">
        <div>
          <p className="mb-1 font-medium text-emerald-400">Pros</p>
          <ul className="list-disc space-y-0.5 pl-4">
            {build.pros.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 font-medium text-red-400">Contras</p>
          <ul className="list-disc space-y-0.5 pl-4">
            {build.cons.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={() => onOptimize(build)}
        className="mt-4 rounded-md border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 px-3 py-2 text-sm font-medium text-[var(--color-gold)] transition-colors hover:bg-[var(--color-gold)]/20"
      >
        Calcular coste de compra
      </button>
    </article>
  );
}
