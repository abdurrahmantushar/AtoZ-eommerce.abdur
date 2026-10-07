"use client";

import Link from "next/link";
import { Heart, Plus, Star } from "lucide-react";
import useWishlist from "@/hooks/useWishlist";

export default function ProductCard({ product }) {
  const { toggleWishlist, isWishlisted } = useWishlist();

  const productId = product.id || product._id;

  const image =
    product.image ||
    product.images?.[0] ||
    "/placeholder-product.jpg";

  const category =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  const oldPrice =
    product.oldPrice ?? product.comparePrice;

  const reviews =
    product.reviews ?? product.reviewCount ?? 0;

  const badge =
    product.badge ||
    (product.isFeatured ? "Featured" : "");

  const liked = isWishlisted(productId);

  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-[24px] bg-[#ecece7]">
        <Link
          href={`/products/${productId}`}
          className="block aspect-[4/5] overflow-hidden"
        >
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>

        {badge && (
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md">
              {badge}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition ${liked
              ? "bg-black text-white"
              : "bg-white/90 text-black hover:bg-black hover:text-white"
            }`}
          aria-label="Toggle wishlist"
        >
          <Heart
            size={17}
            strokeWidth={1.7}
            fill={liked ? "currentColor" : "none"}
          />
        </button>

        <button
          type="button"
          className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-black text-white opacity-0 transition duration-300 group-hover:opacity-100"
          aria-label="Add to cart"
        >
          <Plus size={18} strokeWidth={1.8} />
        </button>
      </div>

      <div className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--muted)]">
              {category || "Product"}
            </p>

            <Link
              href={`/products/${productId}`}
              className="mt-1 block truncate text-base font-medium tracking-[-0.02em]"
            >
              {product.name}
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1 text-xs">
            <Star size={13} fill="currentColor" />
            <span>{product.rating ?? 0}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-semibold">
            ৳{product.price}
          </span>

          {oldPrice && oldPrice > product.price && (
            <span className="text-sm text-[var(--muted-light)] line-through">
              ৳{oldPrice}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-[var(--muted)]">
          {reviews} reviews
        </p>
      </div>
    </article>
  );
}