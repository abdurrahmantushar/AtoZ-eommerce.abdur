
"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?sort=rating&limit=8`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trending products");
        }

        const result = await response.json();

        setProducts(result.data || []);
      } catch (error) {
        console.error(
          "Trending products fetch error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  return (
    <section className="bg-[#efefeb] py-20 lg:py-28">
      <div className="container-main">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              What people are loving
            </p>

            <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              Trending right now
            </h2>
          </div>

          <Link
            href="/products?sort=rating"
            className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-[var(--foreground)]"
          >
            Explore trending

            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight
                size={15}
                strokeWidth={1.8}
              />
            </span>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse"
              >
                <div className="aspect-[4/5] rounded-[24px] bg-white" />

                <div className="px-1 pt-4">
                  <div className="h-3 w-20 rounded bg-black/10" />

                  <div className="mt-2 h-5 w-32 rounded bg-black/10" />

                  <div className="mt-2 h-4 w-20 rounded bg-black/10" />
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <TrendingCard
                key={product._id}
                product={product}
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-sm text-[var(--muted)]">
              No trending products available.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TrendingCard({ product }) {
  const [liked, setLiked] = useState(false);

  const productId = product._id;

  const image =
    product.images?.[0] ||
    "/placeholder-product.jpg";

  const category =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  const oldPrice =
    product.comparePrice ?? null;

  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-[24px] bg-white">
        <Link
          href={`/products/${productId}`}
          className="block aspect-[4/5] overflow-hidden bg-[#e7e7e2]"
        >
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>

        <span className="absolute left-4 top-4 rounded-full bg-[var(--dark)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
          Trending
        </span>

        <button
          type="button"
          onClick={() =>
            setLiked((prev) => !prev)
          }
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full transition ${
            liked
              ? "bg-black text-white"
              : "bg-white/90 text-black hover:bg-black hover:text-white"
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart
            size={17}
            strokeWidth={1.7}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />
        </button>

        <button
          type="button"
          className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-black text-white opacity-0 shadow-lg transition duration-300 group-hover:opacity-100"
          aria-label="Add to cart"
        >
          <Plus
            size={18}
            strokeWidth={1.8}
          />
        </button>
      </div>

      <div className="px-1 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {category || "Product"}
        </p>

        <div className="mt-1 flex items-start justify-between gap-3">
          <Link
            href={`/products/${productId}`}
            className="text-base font-semibold leading-5 tracking-[-0.02em] text-[var(--foreground)]"
          >
            {product.name}
          </Link>

          <div className="flex shrink-0 items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-1 text-[10px] font-medium">
            <Star
              size={11}
              fill="currentColor"
            />
            <span>
              {product.rating ?? 0}
            </span>
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
      </div>
    </article>
  );
}

