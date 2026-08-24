"use client";

import { useMemo } from "react";
import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import type { DirectionTab } from "@/components/DirectionAwareTabs";
import { AVALON_BUILDS } from "@/data/avalon";
import { avalonBuildsByKind } from "@/data/avalon";
import { AVALON_BUILD_KINDS, AVALON_KIND_LABELS } from "@/lib/builds/types";
import type { PriceProvider } from "@/types/albion";
import { AvalonBuildCard } from "@/components/builds/AvalonBuildCard";

interface AvalonBuildsSectionProps {
  provider: PriceProvider;
}

export function AvalonBuildsSection({ provider }: AvalonBuildsSectionProps) {
  const tabs = useMemo<DirectionTab[]>(
    () =>
      AVALON_BUILD_KINDS.map((kind) => {
        const builds = avalonBuildsByKind(kind);
        return {
          id: kind,
          label: `${AVALON_KIND_LABELS[kind]} (${builds.length})`,
          content: (
            <div>
              <p className="mb-3 text-xs text-[var(--color-text-dim)]">
                Builds curadas para Roads of Avalon — categoría {AVALON_KIND_LABELS[kind]}.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {builds.map((b) => (
                  <AvalonBuildCard key={b.id} provider={provider} build={b} />
                ))}
              </div>
            </div>
          ),
        };
      }),
    [provider]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-dim)]">
          Total en catálogo
        </p>
        <span className="rounded-full bg-[var(--color-gold)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-gold)]">
          {AVALON_BUILDS.length} builds
        </span>
      </div>
      <DirectionAwareTabs tabs={tabs} />
    </div>
  );
}