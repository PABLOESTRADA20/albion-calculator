"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ComponentProps,
  type MutableRefObject,
  type RefObject,
} from "react";

type RGB = readonly [number, number, number];

type PaletteBand = Readonly<{ color: RGB; op: number }>;

type GridBeamPaletteLayers = Readonly<{
  h: readonly PaletteBand[];
  v: readonly PaletteBand[];
}>;

const MONO_DARK: GridBeamPaletteLayers = {
  h: [
    { color: [200, 200, 200], op: 0.14 },
    { color: [180, 180, 180], op: 0.11 },
    { color: [190, 190, 190], op: 0.14 },
    { color: [175, 175, 175], op: 0.11 },
    { color: [195, 195, 195], op: 0.14 },
    { color: [185, 185, 185], op: 0.11 },
  ],
  v: [
    { color: [185, 185, 185], op: 0.14 },
    { color: [170, 170, 170], op: 0.11 },
    { color: [195, 195, 195], op: 0.14 },
    { color: [180, 180, 180], op: 0.11 },
    { color: [190, 190, 190], op: 0.14 },
    { color: [175, 175, 175], op: 0.11 },
  ],
};

type BeamRuntimeConfig = Readonly<{
  rows: number;
  cols: number;
  palette: GridBeamPaletteLayers;
  active: boolean;
  duration: number;
  strength: number;
  breathe: boolean;
}>;

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function gaussian(x: number, s: number): number {
  return Math.exp(-(x * x) / (2 * s * s));
}

function useBeamCanvas(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  config: MutableRefObject<BeamRuntimeConfig>
) {
  const animRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    startRef.current = performance.now();

    const draw = (now: number) => {
      const { rows, cols, palette, active, duration, strength, breathe } =
        config.current;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      if (!active) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const elapsed = (now - (startRef.current ?? now)) / 1000;
      const fade = smoothstep(Math.min(1, elapsed / 0.8));
      const cellW = w / cols;
      const cellH = h / rows;
      const gs = fade * strength;
      const br = breathe
        ? 0.85 + 0.3 * Math.sin(elapsed * 1.4) + 0.1 * Math.sin(elapsed * 2.3)
        : 1;

      const rgba = (r: number, g: number, b: number, a: number) =>
        `rgba(${r},${g},${b},${Math.max(0, a).toFixed(4)})`;

      for (let r = 1; r < rows; r++) {
        const y = r * cellH;
        const pal = palette.h[r % palette.h.length];
        const [cr, cg, cb] = pal.color;
        const op = pal.op;
        const speed = 1 + (r % 3) * 0.12;
        const offset = r * 0.21 + (r % 2) * 0.35;
        const t = ((elapsed * speed) / duration + offset) % 1;
        const x = t * w;

        const bloomLen = cellW * 0.6 * br;
        const bloomGrad = ctx.createRadialGradient(x, y, 0, x, y, bloomLen);
        bloomGrad.addColorStop(0, rgba(cr, cg, cb, op * 0.3 * gs));
        bloomGrad.addColorStop(0.4, rgba(cr, cg, cb, op * 0.12 * gs));
        bloomGrad.addColorStop(1, "transparent");
        ctx.save();
        ctx.scale(1, 4 / bloomLen);
        ctx.fillStyle = bloomGrad;
        ctx.beginPath();
        ctx.arc(x, (y * bloomLen) / 4, bloomLen, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const coreLen = cellW * 0.55 * br;
        const lineGrad = ctx.createLinearGradient(
          x - coreLen,
          y,
          x + coreLen,
          y
        );
        lineGrad.addColorStop(0, "transparent");
        lineGrad.addColorStop(0.12, rgba(cr, cg, cb, op * 0.4 * gs));
        lineGrad.addColorStop(0.5, rgba(cr, cg, cb, op * 1.0 * gs));
        lineGrad.addColorStop(0.88, rgba(cr, cg, cb, op * 0.4 * gs));
        lineGrad.addColorStop(1, "transparent");
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - coreLen, y);
        ctx.lineTo(x + coreLen, y);
        ctx.stroke();
      }

      for (let c = 1; c < cols; c++) {
        const x = c * cellW;
        const pal = palette.v[c % palette.v.length];
        const [cr, cg, cb] = pal.color;
        const op = pal.op;
        const speed = 1 + (c % 3) * 0.1;
        const offset = c * 0.26 + (c % 2) * 0.4;
        const t = ((elapsed * speed) / (duration * 1.2) + offset) % 1;
        const y = t * h;

        const bloomLen = cellH * 0.6 * br;
        const bloomGrad = ctx.createRadialGradient(x, y, 0, x, y, bloomLen);
        bloomGrad.addColorStop(0, rgba(cr, cg, cb, op * 0.3 * gs));
        bloomGrad.addColorStop(0.4, rgba(cr, cg, cb, op * 0.12 * gs));
        bloomGrad.addColorStop(1, "transparent");
        ctx.save();
        ctx.scale(4 / bloomLen, 1);
        ctx.fillStyle = bloomGrad;
        ctx.beginPath();
        ctx.arc((x * bloomLen) / 4, y, bloomLen, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const coreLen = cellH * 0.55 * br;
        const lineGrad = ctx.createLinearGradient(
          x,
          y - coreLen,
          x,
          y + coreLen
        );
        lineGrad.addColorStop(0, "transparent");
        lineGrad.addColorStop(0.12, rgba(cr, cg, cb, op * 0.4 * gs));
        lineGrad.addColorStop(0.5, rgba(cr, cg, cb, op * 1.0 * gs));
        lineGrad.addColorStop(0.88, rgba(cr, cg, cb, op * 0.4 * gs));
        lineGrad.addColorStop(1, "transparent");
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y - coreLen);
        ctx.lineTo(x, y + coreLen);
        ctx.stroke();
      }

      for (let r = 1; r < rows; r++) {
        for (let c = 1; c < cols; c++) {
          const ix = c * cellW;
          const iy = r * cellH;
          const hSpeed = 1 + (r % 3) * 0.12;
          const hOffset = r * 0.21 + (r % 2) * 0.35;
          const ht = ((elapsed * hSpeed) / duration + hOffset) % 1;
          const hx = ht * w;
          const vSpeed = 1 + (c % 3) * 0.1;
          const vOffset = c * 0.26 + (c % 2) * 0.4;
          const vt = ((elapsed * vSpeed) / (duration * 1.2) + vOffset) % 1;
          const vy = vt * h;

          const proxH = gaussian((hx - ix) / cellW, 0.25);
          const proxV = gaussian((vy - iy) / cellH, 0.25);
          const prox = proxH * proxV;

          if (prox > 0.05) {
            const pH = palette.h[r % palette.h.length];
            const pV = palette.v[c % palette.v.length];
            const mr = Math.floor((pH.color[0] + pV.color[0]) / 2);
            const mg = Math.floor((pH.color[1] + pV.color[1]) / 2);
            const mb = Math.floor((pH.color[2] + pV.color[2]) / 2);
            const fr = 3.5 * Math.sqrt(prox);
            const fop = prox * 0.6 * gs;

            const fg = ctx.createRadialGradient(ix, iy, 0, ix, iy, fr);
            fg.addColorStop(0, rgba(mr + 140, mg + 140, mb + 140, fop));
            fg.addColorStop(0.5, rgba(mr, mg, mb, fop * 0.4));
            fg.addColorStop(1, "transparent");
            ctx.fillStyle = fg;
            ctx.beginPath();
            ctx.arc(ix, iy, fr, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [canvasRef, config]);
}

interface GridBeamOptions {
  rows?: number;
  cols?: number;
  active?: boolean;
  duration?: number;
  strength?: number;
  breathe?: boolean;
}

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useGridBeam({
  rows: rowsProp = 3,
  cols: colsProp = 4,
  active = true,
  duration = 3,
  strength = 1,
  breathe = true,
}: GridBeamOptions) {
  const rows = Math.max(2, rowsProp);
  const cols = Math.max(2, colsProp);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const configRef = useRef<BeamRuntimeConfig>({
    rows,
    cols,
    palette: MONO_DARK,
    active: active && !reducedMotion,
    duration,
    strength,
    breathe,
  });

  useEffect(() => {
    configRef.current = {
      rows,
      cols,
      palette: MONO_DARK,
      active: active && !reducedMotion,
      duration,
      strength,
      breathe,
    };
  }, [rows, cols, active, reducedMotion, duration, strength, breathe]);

  useBeamCanvas(canvasRef, configRef);

  return canvasRef;
}

interface GridBeamDividersProps extends ComponentProps<"svg"> {
  rows: number;
  cols: number;
  dividerStroke?: string;
}

function GridBeamDividers({
  rows,
  cols,
  dividerStroke = "var(--color-border)",
  className = "",
  ...props
}: GridBeamDividersProps) {
  return (
    <svg
      aria-hidden
      role="presentation"
      className={`pointer-events-none absolute inset-0 z-10 h-full w-full ${className}`}
      preserveAspectRatio="none"
      {...props}
    >
      {Array.from({ length: rows - 1 }, (_, r) => {
        const y = `${((r + 1) / rows) * 100}%`;
        return (
          <line
            key={`h-${r}`}
            stroke={dividerStroke}
            strokeWidth={1}
            x1="0"
            x2="100%"
            y1={y}
            y2={y}
          />
        );
      })}
      {Array.from({ length: cols - 1 }, (_, c) => {
        const x = `${((c + 1) / cols) * 100}%`;
        return (
          <line
            key={`v-${c}`}
            stroke={dividerStroke}
            strokeWidth={1}
            x1={x}
            x2={x}
            y1="0"
            y2="100%"
          />
        );
      })}
    </svg>
  );
}

interface GridBeamCanvasProps extends ComponentProps<"canvas"> {
  borderRadius?: number;
}

const GridBeamCanvas = forwardRef<HTMLCanvasElement, GridBeamCanvasProps>(
  function GridBeamCanvas({ className = "", style, borderRadius, ...props }, ref) {
    return (
      <canvas
        aria-hidden
        ref={ref}
        className={`pointer-events-none absolute inset-0 z-20 h-full w-full ${className}`}
        style={{ borderRadius, ...style } as CSSProperties}
        {...props}
      />
    );
  }
);

interface GridBeamProps extends GridBeamOptions {
  children: React.ReactNode;
  className?: string;
  borderRadius?: number;
}

export function GridBeam({
  children,
  className = "",
  borderRadius,
  rows,
  cols,
  active,
  duration,
  strength,
  breathe,
}: GridBeamProps) {
  const canvasRef = useGridBeam({
    rows,
    cols,
    active,
    duration,
    strength,
    breathe,
  });

  const resolved = useMemo(() => {
    const r = Math.max(2, rows ?? 3);
    const c = Math.max(2, cols ?? 4);
    return { r, c };
  }, [rows, cols]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ borderRadius } as CSSProperties}
    >
      <GridBeamDividers rows={resolved.r} cols={resolved.c} />
      <GridBeamCanvas borderRadius={borderRadius} ref={canvasRef} />
      <div className="relative z-30">{children}</div>
    </div>
  );
}
