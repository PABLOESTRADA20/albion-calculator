"use client";

import { useState } from "react";
import { FlippingCalculator } from "@/components/calculators/FlippingCalculator";
import { FlippingOptimizer } from "@/components/calculators/FlippingOptimizer";
import { DirectionAwareTabs } from "@/components/DirectionAwareTabs";
import type { PriceProvider } from "@/types/albion";

interface FlippingSectionProps {
  provider: PriceProvider;
}

export function FlippingSection({ provider }: FlippingSectionProps) {
  const [tab, setTab] = useState("calculator");

  const tabs = [
    { id: "calculator", label: "Calculadora", content: <FlippingCalculator provider={provider} /> },
    { id: "optimizer", label: "Optimizador", content: <FlippingOptimizer provider={provider} /> },
  ];

  return <DirectionAwareTabs tabs={tabs} activeId={tab} onActiveChange={setTab} />;
}
