"use client";

import type { ReactNode } from "react";

interface HowToProps {
  steps: ReactNode[];
  notes?: ReactNode[];
}

// Bloque colapsable de ayuda por calculadora (details nativo: sin estado).
export function HowTo({ steps, notes }: HowToProps) {
  return (
    <details className="group rounded-md border border-[var(--color-border)] bg-[var(--color-panel-raised)]">
      <summary className="flex cursor-pointer select-none items-center justify-between px-3 py-2 text-sm text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)]">
        Cómo usar
        <span className="text-xs transition-transform group-open:rotate-90">
          ▸
        </span>
      </summary>
      <div className="space-y-3 border-t border-[var(--color-border)] px-3 py-3 text-sm text-[var(--color-text-dim)]">
        <ol className="list-decimal space-y-1 pl-5">
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        {notes && notes.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-xs">
            {notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
