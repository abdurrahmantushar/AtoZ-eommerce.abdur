"use client";

import { useEffect, useState } from "react";

export default function ProductGallery({ product }) {
  const images =
    Array.isArray(product?.images) &&
    product.images.length > 0
      ? product.images
      : product?.image
        ? [product.image]
        : [];

  const [activeImage, setActiveImage] = useState(
    images[0] || ""
  );

  useEffect(() => {
    setActiveImage(images[0] || "");
  }, [product?.id, product?._id]);

  if (!images.length) {
    return (
      <div className="overflow-hidden rounded-[28px] bg-[#ecece7]">
        <div className="flex aspect-[4/5] items-center justify-center">
          <span className="text-sm text-[#888888]">
            No image available
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[88px_1fr]">
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
        {images.map((image, index) => {
          const active = activeImage === image;

          return (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(image)}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border transition lg:h-[84px] lg:w-[84px] ${
                active
                  ? "border-[#111111]"
                  : "border-[var(--border)]"
              }`}
            >
              <img
                src={image}
                alt={`${product.name} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>

      <div className="order-1 overflow-hidden rounded-[28px] bg-[#ecece7] lg:order-2">
        <div className="aspect-[4/5]">
          <img
            src={activeImage}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300"
          />
        </div>
      </div>
    </div>
  );
}

