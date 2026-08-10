"use client";

import { useMemo } from "react";
import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import type { DirectionTab } from "@/components/DirectionAwareTabs";
import type { PriceProvider } from "@/types/albion";
import { AvalonOverview } from "@/components/avalon/AvalonOverview";
import { AvalonBuildsSection } from "@/components/avalon/AvalonBuildsSection";
import { CompositionSection } from "@/components/avalon/CompositionSection";
import { MapsExplorer } from "@/components/avalon/MapsExplorer";
import { RoutePlanner } from "@/components/avalon/RoutePlanner";
import { RiskCalculator } from "@/components/avalon/RiskCalculator";
import { ProfitCalculator } from "@/components/avalon/ProfitCalculator";
import { GatheringOptimizer } from "@/components/avalon/GatheringOptimizer";
import { LootOptimizer } from "@/components/avalon/LootOptimizer";
import { BuildCompare } from "@/components/avalon/BuildCompare";
import { BuildRecommender } from "@/components/avalon/BuildRecommender";

interface AvalonSectionProps {
  provider: PriceProvider;
}

export function AvalonSection({ provider }: AvalonSectionProps) {
  const tabs = useMemo<DirectionTab[]>(
    () => [
      {
        id: "resumen",
        label: "Resumen",
        content: <AvalonOverview provider={provider} />,
      },
      {
        id: "builds",
        label: "Builds",
        content: <AvalonBuildsSection provider={provider} />,
      },
      {
        id: "composiciones",
        label: "Composiciones",
        content: <CompositionSection provider={provider} />,
      },
      {
        id: "mapas",
        label: "Mapas",
        content: <MapsExplorer />,
      },
      {
        id: "rutas",
        label: "Route Planner",
        content: <RoutePlanner provider={provider} />,
      },
      {
        id: "calculadoras",
        label: "Calculadoras",
        content: (
          <CalculatorsTabs provider={provider} />
        ),
      },
      {
        id: "comparar",
        label: "Comparar",
        content: <BuildCompare provider={provider} />,
      },
      {
        id: "recomendador",
        label: "Recomendador",
        content: <BuildRecommender provider={provider} />,
      },
    ],
    [provider]
  );

  return <DirectionAwareTabs tabs={tabs} />;
}

function CalculatorsTabs({ provider }: { provider: PriceProvider }) {
  const tabs = useMemo<DirectionTab[]>(
    () => [
      { id: "riesgo", label: "Riesgo", content: <RiskCalculator /> },
      { id: "beneficio", label: "Beneficio", content: <ProfitCalculator /> },
      { id: "gathering", label: "Gathering", content: <GatheringOptimizer provider={provider} /> },
      { id: "loot", label: "Avalón → Mercado", content: <LootOptimizer /> },
    ],
    [provider]
  );
  return <DirectionAwareTabs tabs={tabs} />;
}