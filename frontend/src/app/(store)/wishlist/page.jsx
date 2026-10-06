"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import useWishlist from "@/hooks/useWishlist";

export default function WishlistPage() {
  const {
    items,
    clearWishlist,
  } = useWishlist();

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="container-main py-10 sm:py-14 lg:py-16">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Your saved products
            </p>

            <h1 className="mt-3 text-5xl font-semibold tracking-[-0.055em]">
              Wishlist
            </h1>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="w-fit text-xs font-medium text-[var(--muted)] underline underline-offset-4 transition hover:text-[var(--foreground)]"
            >
              Clear wishlist
            </button>
          )}
        </div>

        {items.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[55vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ecece7]">
                <Heart size={23} strokeWidth={1.6} />
              </div>

              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">
                Your wishlist is empty
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
                Save products you love and come back to them whenever you are
                ready.
              </p>

              <Link
                href="/products"
                className="mt-7 inline-flex rounded-full bg-[#111111] px-6 py-3.5 text-sm font-medium !text-white transition hover:opacity-80"
              >
                Explore products
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}