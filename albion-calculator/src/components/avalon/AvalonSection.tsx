"use client";

import { useMemo } from "react";
import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import type { DirectionTab } from "@/components/DirectionAwareTabs";
import type { PriceProvider } from "@/types/albion";
import { AvalonOverview } from "@/components/avalon/AvalonOverview";
import { MapsExplorer } from "@/components/avalon/MapsExplorer";
import { RoutePlanner } from "@/components/avalon/RoutePlanner";
import { RiskCalculator } from "@/components/avalon/RiskCalculator";
import { ProfitCalculator } from "@/components/avalon/ProfitCalculator";
import { GatheringOptimizer } from "@/components/avalon/GatheringOptimizer";
import { LootOptimizer } from "@/components/avalon/LootOptimizer";

interface AvalonSectionProps {
  provider: PriceProvider;
  /** Navega a la seccion global de Builds (opcionalmente filtrada por familia de arma). */
  onOpenBuilds: (weaponFamily?: string) => void;
}

export function AvalonSection({ provider, onOpenBuilds }: AvalonSectionProps) {
  const tabs = useMemo<DirectionTab[]>(
    () => [
      {
        id: "resumen",
        label: "Resumen",
        content: <AvalonOverview onOpenBuilds={onOpenBuilds} />,
      },
      {
        id: "mapas",
        label: "Mapas",
        content: <MapsExplorer />,
      },
      {
        id: "rutas",
        label: "Route Planner",
        content: <RoutePlanner onOpenBuilds={onOpenBuilds} />,
      },
      {
        id: "calculadoras",
        label: "Calculadoras",
        content: <CalculatorsTabs provider={provider} />,
      },
    ],
    [provider, onOpenBuilds]
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