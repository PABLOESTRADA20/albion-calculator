"use client";

import { useState } from "react";
import { CraftingCalculator } from "@/components/calculators/CraftingCalculator";
import { CraftingOptimizer } from "@/components/calculators/CraftingOptimizer";
import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import type { PriceProvider } from "@/types/albion";

interface CraftingSectionProps {
  provider: PriceProvider;
}

export function CraftingSection({ provider }: CraftingSectionProps) {
  const [tab, setTab] = useState("calculator");

  const tabs = [
    { id: "calculator", label: "Calculadora", content: <CraftingCalculator provider={provider} /> },
    { id: "optimizer", label: "Optimizador", content: <CraftingOptimizer provider={provider} /> },
  ];

  return <DirectionAwareTabs tabs={tabs} activeId={tab} onActiveChange={setTab} />;
}
