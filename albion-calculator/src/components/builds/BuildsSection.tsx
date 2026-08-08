"use client";

import { useState } from "react";
import { BuildCostOptimizer } from "@/components/builds/BuildCostOptimizer";
import { BuildLibrary } from "@/components/builds/BuildLibrary";
import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import type { Build } from "@/lib/builds/types";
import type { PriceProvider } from "@/types/albion";

interface BuildsSectionProps {
  provider: PriceProvider;
}

export function BuildsSection({ provider }: BuildsSectionProps) {
  const [tab, setTab] = useState("library");
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);

  const handleOptimize = (build: Build) => {
    setSelectedBuild(build);
    setTab("optimizer");
  };

  const tabs = [
    {
      id: "library",
      label: "Biblioteca",
      content: <BuildLibrary onOptimize={handleOptimize} />,
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
  ];

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <DirectionAwareTabs tabs={tabs} activeId={tab} onActiveChange={setTab} />
    </div>
  );
}
