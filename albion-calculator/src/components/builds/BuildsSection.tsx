"use client";

import { useMemo, useState } from "react";
import { BuildCostOptimizer } from "@/components/builds/BuildCostOptimizer";
import { BuildLibrary } from "@/components/builds/BuildLibrary";
import { CompositionSection } from "@/components/builds/CompositionSection";
import { BuildCompare } from "@/components/builds/BuildCompare";
import { BuildRecommender } from "@/components/builds/BuildRecommender";
import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import type { DirectionTab } from "@/components/DirectionAwareTabs";
import type { Build } from "@/lib/builds/types";
import type { PriceProvider } from "@/types/albion";

interface BuildsSectionProps {
  provider: PriceProvider;
  /** Familia de arma para filtrar la biblioteca (desde PvP Analytics / Avalon). */
  weaponFamily?: string;
  onClearWeaponFilter?: () => void;
}

/**
 * Build System centralizado: biblioteca (PvP/PvE/Avalon), composiciones,
 * comparador, recomendador y optimizador de coste. Nada de esto vive en Avalon.
 */
export function BuildsSection({
  provider,
  weaponFamily,
  onClearWeaponFilter,
}: BuildsSectionProps) {
  const [tab, setTab] = useState("library");
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);

  const handleOptimize = (build: Build) => {
    setSelectedBuild(build);
    setTab("optimizer");
  };

  const tabs = useMemo<DirectionTab[]>(
    () => [
      {
        id: "library",
        label: "Biblioteca",
        content: (
          <BuildLibrary
            onOptimize={handleOptimize}
            weaponFamily={weaponFamily}
            onClearWeaponFilter={onClearWeaponFilter}
          />
        ),
      },
      {
        id: "compositions",
        label: "Composiciones",
        content: <CompositionSection provider={provider} />,
      },
      {
        id: "compare",
        label: "Comparar",
        content: <BuildCompare provider={provider} />,
      },
      {
        id: "recommender",
        label: "Recomendador",
        content: <BuildRecommender provider={provider} />,
      },
      {
        id: "optimizer",
        label: "Coste de build",
        content: selectedBuild ? (
          <BuildCostOptimizer provider={provider} build={selectedBuild} />
        ) : (
          <p className="text-sm text-[var(--color-text-dim)]">
            Elige una build en la Biblioteca y pulsa «Calcular coste de compra».
          </p>
        ),
      },
    ],
    [provider, selectedBuild, weaponFamily, onClearWeaponFilter]
  );

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <DirectionAwareTabs tabs={tabs} activeId={tab} onActiveChange={setTab} />
    </div>
  );
}