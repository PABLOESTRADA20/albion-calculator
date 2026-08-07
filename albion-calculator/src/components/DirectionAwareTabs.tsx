"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useMeasure } from "@/lib/useMeasure";

export interface DirectionTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface DirectionAwareTabsProps {
  tabs: DirectionTab[];
  className?: string;
}

export function DirectionAwareTabs({
  tabs,
  className = "",
}: DirectionAwareTabsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [ref, bounds] = useMeasure<HTMLDivElement>();

  const active = tabs.find((t) => t.id === activeId) ?? null;

  const handleClick = (id: string) => {
    if (id === activeId || isAnimating) return;
    const from = tabs.findIndex((t) => t.id === activeId);
    const to = tabs.findIndex((t) => t.id === id);
    setDirection(to > from ? 1 : -1);
    setActiveId(id);
  };

  const variants = {
    initial: (dir: number) => ({
      x: 60 * dir,
      opacity: 0,
      filter: "blur(4px)",
    }),
    active: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (dir: number) => ({
      x: -60 * dir,
      opacity: 0,
      filter: "blur(4px)",
    }),
  };

  const tabButtons = useMemo(
    () =>
      tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => handleClick(tab.id)}
            className={[
              "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "text-[var(--color-bg)]"
                : "text-[var(--color-text-dim)] hover:text-[var(--color-text)]",
            ].join(" ")}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {isActive && (
              <motion.span
                layoutId="tab-bubble"
                className="absolute inset-0 z-10 rounded-full bg-[var(--color-gold)]"
                transition={{ type: "spring", bounce: 0.19, duration: 0.4 }}
              />
            )}
            <span className="relative z-20">{tab.label}</span>
          </button>
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tabs, activeId]
  );

  return (
    <div className={className}>
      <div className="flex w-fit space-x-1 rounded-full bg-[var(--color-panel)] p-1">
        {tabButtons}
      </div>
      <MotionConfig transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}>
        <motion.div
          className="relative mt-4 w-full overflow-hidden"
          initial={false}
          animate={{ height: bounds.height }}
        >
          <div ref={ref} className="p-0.5">
            <AnimatePresence
              custom={direction}
              mode="popLayout"
              onExitComplete={() => setIsAnimating(false)}
            >
              <motion.div
                key={activeId}
                variants={variants}
                initial="initial"
                animate="active"
                exit="exit"
                custom={direction}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
              >
                {active?.content}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </MotionConfig>
    </div>
  );
}
