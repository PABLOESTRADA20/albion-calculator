"use client";

import { SERVERS } from "@/types/albion";
import type { ServerId } from "@/types/albion";

interface ServerSelectorProps {
  value: ServerId;
  onChange: (value: ServerId) => void;
}

export function ServerSelector({ value, onChange }: ServerSelectorProps) {
  return (
    <div className="inline-flex rounded-lg bg-[var(--color-panel)] p-1">
      {SERVERS.map((server) => (
        <button
          key={server.id}
          onClick={() => onChange(server.id)}
          className={[
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === server.id
              ? "bg-[var(--color-text)] text-[var(--color-bg)]"
              : "text-[var(--color-text-dim)] hover:text-[var(--color-text)]",
          ].join(" ")}
        >
          {server.label}
        </button>
      ))}
    </div>
  );
}
