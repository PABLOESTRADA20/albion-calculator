"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Bounds {
  width: number;
  height: number;
}

// Medicion de contenedor con ResizeObserver (sin dependencias externas).
export function useMeasure<T extends HTMLElement>(): [
  React.RefObject<T | null>,
  Bounds,
] {
  const ref = useRef<T | null>(null);
  const [bounds, setBounds] = useState<Bounds>({ width: 0, height: 0 });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setBounds({ width: el.offsetWidth, height: el.offsetHeight });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  return [ref, bounds];
}
