"use client";

import { useMemo, useState } from "react";
import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import type { DirectionTab } from "@/components/DirectionAwareTabs";
import { AVALON_COMPOSITIONS } from "@/data/avalon/compositions";
import { COMPOSITION_KIND_LABELS } from "@/lib/avalon/compositions";
import type { AvalonComposition, CompositionKind } from "@/lib/avalon/compositions";
import { compositionMemberBuild, compositionItems } from "@/lib/avalon/compositions";
import { DIFFICULTY_LABELS } from "@/lib/builds/types";
import type { PriceProvider } from "@/types/albion";
import { ItemIcon } from "@/components/ItemIcon";
import { BuildCostPanel } from "@/components/avalon/BuildCostPanel";
import { buildItemId } from "@/lib/builds/types";
import { itemName } from "@/lib/builds/items";

const COMPOSITION_KINDS: CompositionKind[] = ["duo", "trio", "fiveman", "roaming"];

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-[var(--color-text-dim)]">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-panel)]">
        <div
          className="h-full rounded-full bg-[var(--color-gold)]"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

function CompositionCard({
  provider,
  comp,
}: {
  provider: PriceProvider;
  comp: AvalonComposition;
}) {
  const [showCost, setShowCost] = useState(false);
  const allItems = useMemo(() => compositionItems(comp.members), [comp.members]);
  const fullCost = useMemo(() => comp.members.filter((m) => compositionMemberBuild(m)), [comp.members]);

  return (
    <article className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">{comp.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-[var(--color-gold)]/10 px-2 py-0.5 text-xs text-[var(--color-gold)]">
              {COMPOSITION_KIND_LABELS[comp.kind]}
            </span>
            <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-xs text-[var(--color-text-dim)]">
              {comp.style}
            </span>
            <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-xs text-[var(--color-text-dim)]">
              {comp.groupSize} jugadores · {comp.recommendedTier}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                comp.difficulty === 4
                  ? "bg-red-500/10 text-red-400"
                  : comp.difficulty === 3
                    ? "bg-orange-500/10 text-orange-400"
                    : comp.difficulty === 2
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {DIFFICULTY_LABELS[comp.difficulty]}
            </span>
          </div>
        </div>
        <div className="w-36 space-y-1.5">
          <ScoreBar label="PvE" value={comp.scores.pve} />
          <ScoreBar label="PvP" value={comp.scores.pvp} />
          <ScoreBar label="Velocidad" value={comp.scores.clearSpeed} />
          <ScoreBar label="Sobrevida" value={comp.scores.survivability} />
        </div>
      </div>

      <p className="mt-2 text-xs text-[var(--color-text-dim)]">
        <span className="font-medium text-[var(--color-gold)]">Sinergia: </span>
        {comp.synergy}
      </p>

      <ul className="mt-3 space-y-1.5">
        {comp.members.map((m) => {
          const build = compositionMemberBuild(m);
          if (!build) return null;
          return (
            <li key={m.roleLabel} className="rounded-md bg-[var(--color-panel)] px-2.5 py-2">
              <p className="text-xs font-medium text-[var(--color-text)]">
                <span className="text-[var(--color-gold)]">{m.roleLabel}</span> · {build.name}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--color-text-dim)]">{m.why}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {build.items.slice(0, 4).map((spec) => (
                  <span
                    key={spec.slot}
                    title={spec.label ?? itemName(buildItemId(spec))}
                    className="flex items-center gap-1 rounded bg-[var(--color-panel-raised)] px-1.5 py-0.5"
                  >
                    <ItemIcon itemId={buildItemId(spec)} size={16} className="shrink-0" />
                    <span className="text-[10px] text-[var(--color-text-dim)]">
                      {spec.label ?? itemName(buildItemId(spec))}
                    </span>
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => setShowCost((s) => !s)}
        className="mt-3 rounded-md border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 px-3 py-2 text-sm font-medium text-[var(--color-gold)] transition-colors hover:bg-[var(--color-gold)]/20"
      >
        {showCost ? "Ocultar coste" : `Calcular coste de la compra (${fullCost.length} jugadores)`}
      </button>

      {showCost && <BuildCostPanel provider={provider} items={allItems} refreshKey={`comp-${comp.id}`} />}
    </article>
  );
}

export function CompositionSection({ provider }: { provider: PriceProvider }) {
  const tabs = useMemo<DirectionTab[]>(
    () =>
      COMPOSITION_KINDS.map((kind) => {
        const comps = AVALON_COMPOSITIONS.filter((c) => c.kind === kind);
        return {
          id: kind,
          label: `${COMPOSITION_KIND_LABELS[kind]} (${comps.length})`,
          content: (
            <div className="grid gap-3 md:grid-cols-2">
              {comps.map((c) => (
                <CompositionCard key={c.id} provider={provider} comp={c} />
              ))}
            </div>
          ),
        };
      }),
    [provider]
  );

  return <DirectionAwareTabs tabs={tabs} />;
}