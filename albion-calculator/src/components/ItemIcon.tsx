"use client";

import { useState } from "react";
import Image from "next/image";
import { itemIconUrl } from "@/lib/items";

interface ItemIconProps {
  itemId: string;
  quality?: number;
  size?: number;
  className?: string;
}

export function ItemIcon({ itemId, quality, size = 20, className = "" }: ItemIconProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return <span style={{ width: size, height: size }} className={`inline-block shrink-0 ${className}`} />;

  return (
    <Image
      src={itemIconUrl(itemId, quality)}
      alt=""
      width={size}
      height={size}
      unoptimized
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-sm border border-[var(--color-border)] bg-[var(--color-bg)] object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
