"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const PLACEHOLDER = "/placeholder-product.svg";

export type CatalogPartImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Storefront part images: PHP serves `/uploads/*` under `/backend/*`. Missing files on disk
 * are common in dev (uploads not in git). Skip the image optimizer for those URLs so 404s
 * do not spam the Next dev server, and fall back to the placeholder after a failed load.
 */
export function CatalogPartImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: CatalogPartImageProps) {
  const [current, setCurrent] = useState(src);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  const handleError = useCallback(() => {
    setCurrent((p) => (p === PLACEHOLDER ? p : PLACEHOLDER));
  }, []);

  const unoptimized =
    current.startsWith("/backend/") || current.startsWith("http://127.0.0.1:");

  return (
    <Image
      src={current}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      onError={handleError}
    />
  );
}
