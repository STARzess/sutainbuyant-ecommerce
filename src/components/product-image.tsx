"use client";

import Image from "next/image";
import { useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";

export function ProductImage({ product, size = "card", priority = false }: { product: Pick<CatalogProduct, "name" | "image">; size?: "card" | "detail" | "cart"; priority?: boolean }) {
  const [failed, setFailed] = useState<string[]>([]);
  const image = product.image;
  const preferred = size === "cart" ? image?.thumbnail : size === "card" ? image?.preview : image?.url;
  const src = [preferred, image?.url].find((url) => url && !failed.includes(url));
  return (
    <span className="product-photo">
      {src ? (
        <Image src={src} alt={product.name} fill sizes={size === "cart" ? "105px" : size === "detail" ? "(max-width: 700px) 90vw, 600px" : "(max-width: 700px) 45vw, (max-width: 1100px) 30vw, 320px"} priority={priority} onError={() => setFailed((previous) => [...previous, src])} />
      ) : (
        <span className="product-photo-empty" role="img" aria-label={product.name}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2" /></svg>
        </span>
      )}
    </span>
  );
}
