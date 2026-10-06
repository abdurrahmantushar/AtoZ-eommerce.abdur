
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

export default async function FeaturedProducts() {
  let products = [];

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?sort=featured&limit=8`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch featured products");
    }

    const result = await response.json();

    products = (result.data || []).map((product) => ({
      ...product,
      id: product._id,
    }));
  } catch (error) {
    console.error("Featured products fetch error:", error);
  }

  return (
    <section className="container-main section-space-sm">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
            Curated for you
          </p>

          <h2 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Featured products
          </h2>
        </div>

        <Link
          href="/products"
          className="group inline-flex w-fit items-center gap-2 text-sm font-medium"
        >
          Shop all

          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight size={15} strokeWidth={1.8} />
          </span>
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-sm text-[var(--muted)]">
            No featured products available.
          </div>
        )}
      </div>
    </section>
  );
}

