import Link from "next/link";
import { ChevronRight } from "lucide-react";

import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import RelatedProducts from "@/components/product/RelatedProducts";
import ProductReviews from "@/components/product/ProductReviews";
import ProductDetailsCart from "@/components/cart/ProductDetailsCart";

async function getProduct(id) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    const product = result.data;

    if (!product) {
      return null;
    }

    return {
      ...product,

      id: product._id,

      image:
        product.images?.[0] ||
        "/placeholder-product.jpg",

      oldPrice:
        product.comparePrice ?? null,

      reviews:
        product.reviewCount ?? 0,

      category:
        typeof product.category === "object"
          ? product.category?.name
          : product.category,

      badge:
        product.isFeatured
          ? "Featured"
          : "",

      rating:
        product.rating ?? 0,
    };
  } catch (error) {
    console.error(
      "Product details fetch error:",
      error
    );

    return null;
  }
}

export default async function ProductDetailsPage({
  params,
}) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <section className="container-main flex min-h-[70vh] items-center justify-center py-20">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Product
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
              Product not found
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">
              The product you are looking for does not exist
              or may have been removed.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex rounded-full bg-[#111111] px-6 py-3.5 text-sm font-medium !text-white"
            >
              Back to products
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="container-main py-8 sm:py-10 lg:py-14">
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <Link
            href="/products"
            className="transition hover:text-black"
          >
            Products
          </Link>

          <ChevronRight size={14} />

          <span>
            {product.category || "Category"}
          </span>

          <ChevronRight size={14} />

          <span className="truncate text-[var(--foreground)]">
            {product.name}
          </span>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
          <ProductGallery product={product} />

          <ProductInfo product={product} />
        </div>

        <ProductReviews product={product} />
      </section>

      <RelatedProducts
        currentProductId={product.id}
      />
      <ProductDetailsCart />
    </main>
  );
}