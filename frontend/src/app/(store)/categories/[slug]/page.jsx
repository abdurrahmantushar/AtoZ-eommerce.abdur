
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";

const categoryStyles = {
  electronics: {
    description:
      "Smart devices, useful gadgets, and everyday technology designed to make life simpler.",
    countLabel: "Tech & gadgets",
    tone: "bg-[#e9edf2]",
  },

  fashion: {
    description:
      "Everyday clothing, footwear, bags, and modern essentials made for your personal style.",
    countLabel: "Style & essentials",
    tone: "bg-[#eee9e4]",
  },

  beauty: {
    description:
      "Skincare, personal care, and beauty essentials for your everyday routine.",
    countLabel: "Care & beauty",
    tone: "bg-[#f0e7e9]",
  },

  home: {
    description:
      "Practical home products, decor, organization, and pieces for a better living space.",
    countLabel: "Home & living",
    tone: "bg-[#e9ece4]",
  },

  grocery: {
    description:
      "Daily essentials, pantry favorites, and useful products for your everyday needs.",
    countLabel: "Daily essentials",
    tone: "bg-[#eeeae1]",
  },

  sports: {
    description:
      "Training gear, active essentials, and outdoor products for your next activity.",
    countLabel: "Active life",
    tone: "bg-[#e7ecea]",
  },

  accessories: {
    description:
      "Watches, bags, wallets, and everyday pieces that complete your look.",
    countLabel: "Finishing touches",
    tone: "bg-[#ece9e3]",
  },

  audio: {
    description:
      "Headphones, speakers, and everyday audio products built for better listening.",
    countLabel: "Sound & music",
    tone: "bg-[#e9e8ed]",
  },

  lifestyle: {
    description:
      "Useful products designed to make everyday routines easier and more enjoyable.",
    countLabel: "Everyday living",
    tone: "bg-[#e9eceb]",
  },
};

async function getCategory(slug) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    const category = (result.data || []).find(
      (item) => item.slug === slug
    );

    if (!category) {
      return null;
    }

    const style = categoryStyles[slug] || {
      description:
        "Discover products from this collection.",
      countLabel: "Collection",
      tone: "bg-[#e9eceb]",
    };

    return {
      ...category,
      description:
        category.description || style.description,
      countLabel: style.countLabel,
      tone: style.tone,
    };
  } catch (error) {
    console.error("Category fetch error:", error);

    return null;
  }
}

async function getCategoryProducts(slug) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?category=${slug}&page=1&limit=100`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        products: [],
        total: 0,
      };
    }

    const result = await response.json();

    return {
      products: result.data || [],
      total: result.pagination?.total || 0,
    };
  } catch (error) {
    console.error(
      "Category products fetch error:",
      error
    );

    return {
      products: [],
      total: 0,
    };
  }
}

export default async function CategoryPage({
  params,
}) {
  const { slug } = await params;

  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const {
    products,
    total,
  } = await getCategoryProducts(slug);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[var(--background)]">
        <section className="container-main section-space">
          <Link
            href="/categories"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#666666] transition hover:text-[#111111]"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.8}
            />
            All categories
          </Link>

          <div
            className={`relative overflow-hidden rounded-[32px] ${category.tone} px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20`}
          >
            <div className="relative z-10 max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#898983]">
                {category.countLabel}
              </span>

              <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em] text-[#111111] sm:text-6xl lg:text-7xl">
                {category.name}
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#666666] sm:text-base">
                {category.description}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-[#555555]">
                  {total}{" "}
                  {total === 1
                    ? "product"
                    : "products"}
                </span>

                <Link
                  href={`/products?category=${slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111]"
                >
                  Browse all
                  <ArrowRight
                    size={16}
                    strokeWidth={1.8}
                  />
                </Link>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[55px] border-white/30" />

            <div className="pointer-events-none absolute -bottom-28 right-20 h-64 w-64 rounded-full bg-white/20 blur-2xl" />
          </div>

          <div className="mt-14">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#999991]">
                  Collection
                </span>

                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-4xl">
                  Explore {category.name}
                </h2>
              </div>

              <Link
                href={`/products?category=${slug}`}
                className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#111111] underline underline-offset-4"
              >
                View all
                <ArrowRight
                  size={15}
                  strokeWidth={1.8}
                />
              </Link>
            </div>

            {products.length > 0 ? (
              <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={{
                      ...product,
                      id: product._id,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[28px] border border-dashed border-[var(--border)] bg-white px-6 py-20 text-center">
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
                  No products in this category yet
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
                  Products for this category will
                  appear here once they are added to
                  the store.
                </p>

                <Link
                  href="/products"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#252525]"
                >
                  Browse products
                  <ArrowRight
                    size={16}
                    strokeWidth={1.8}
                  />
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

