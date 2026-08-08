"use client";

import { useState } from "react";
import { RefiningCalculator } from "@/components/calculators/RefiningCalculator";
import { RefiningOptimizer } from "@/components/calculators/RefiningOptimizer";
import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import type { PriceProvider } from "@/types/albion";

interface RefiningSectionProps {
  provider: PriceProvider;
}

export function RefiningSection({ provider }: RefiningSectionProps) {
  const [tab, setTab] = useState("calculator");

  const tabs = [
    { id: "calculator", label: "Calculadora", content: <RefiningCalculator provider={provider} /> },
    { id: "optimizer", label: "Optimizador", content: <RefiningOptimizer provider={provider} /> },
  ];

  return <DirectionAwareTabs tabs={tabs} activeId={tab} onActiveChange={setTab} />;
}
