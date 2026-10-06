
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const categoryStyles = {
  electronics: {
    description:
      "Smart devices, gadgets, accessories and everyday tech.",
    tone: "bg-[#e9edf2]",
  },

  fashion: {
    description:
      "Everyday essentials, footwear, bags and modern style.",
    tone: "bg-[#eee9e4]",
  },

  beauty: {
    description:
      "Skincare, self-care essentials and beauty favorites.",
    tone: "bg-[#f0e7e9]",
  },

  home: {
    description:
      "Furniture, decor, organization and useful home pieces.",
    tone: "bg-[#e9ece4]",
  },

  grocery: {
    description:
      "Daily essentials, pantry favorites and fresh picks.",
    tone: "bg-[#eeeae1]",
  },

  sports: {
    description:
      "Training gear, active essentials and outdoor equipment.",
    tone: "bg-[#e7ecea]",
  },

  accessories: {
    description:
      "Watches, wallets, bags and pieces that complete your look.",
    tone: "bg-[#ece9e3]",
  },

  audio: {
    description:
      "Headphones, speakers and immersive everyday audio.",
    tone: "bg-[#e9e8ed]",
  },

  lifestyle: {
    description:
      "Useful products made for better everyday living.",
    tone: "bg-[#e9eceb]",
  },
};

async function getCategories() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const result = await response.json();

    return result.data || [];
  } catch (error) {
    console.error(
      "Categories page fetch error:",
      error
    );

    return [];
  }
}

async function getProductCount(slug) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?category=${slug}&page=1&limit=1`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return 0;
    }

    const result = await response.json();

    return result.pagination?.total || 0;
  } catch (error) {
    console.error(
      `Product count fetch error for ${slug}:`,
      error
    );

    return 0;
  }
}

async function getCategoriesWithCount() {
  const categories = await getCategories();

  const categoriesWithCount = await Promise.all(
    categories.map(async (category, index) => {
      const style =
        categoryStyles[category.slug] || {
          description:
            "Discover products from this collection.",
          tone: "bg-[#e9eceb]",
        };

      const productCount = await getProductCount(
        category.slug
      );

      return {
        ...category,
        label: String(index + 1).padStart(2, "0"),
        description:
          category.description || style.description,
        tone: style.tone,
        count: `${productCount}+ products`,
      };
    })
  );

  return categoriesWithCount;
}

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories =
    await getCategoriesWithCount();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[var(--background)]">
        <section className="container-main section-space">
          <div className="mb-12">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#666666] transition hover:text-[#111111]"
            >
              <ArrowLeft
                size={16}
                strokeWidth={1.8}
              />
              Back to home
            </Link>

            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999991]">
                  Explore
                </span>

                <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#111111] sm:text-6xl lg:text-7xl">
                  Shop by
                  <span className="text-[#999991]">
                    {" "}
                    category.
                  </span>
                </h1>
              </div>

              <div className="lg:pb-1">
                <p className="max-w-lg text-sm leading-7 text-[var(--muted)]">
                  Discover products across the
                  categories that make up your everyday
                  life. From smart tech to home
                  essentials, everything stays within
                  reach.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug}`}
                  className={`group relative min-h-[300px] overflow-hidden rounded-[30px] border border-[var(--border)] ${category.tone} p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.08)] ${
                    index === 0 ? "xl:col-span-2" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold tracking-[0.14em] text-[#888880]">
                      {category.label}
                    </span>

                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-[#111111] transition duration-300 group-hover:rotate-45">
                      <ArrowUpRight
                        size={18}
                        strokeWidth={1.8}
                      />
                    </span>
                  </div>

                  <div className="absolute inset-x-6 bottom-6">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-[#8a8a84]">
                      {category.count}
                    </p>

                    <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-4xl">
                      {category.name}
                    </h2>

                    <p className="mt-3 max-w-md text-sm leading-6 text-[#666666]">
                      {category.description}
                    </p>
                  </div>

                  <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border-[28px] border-white/25 transition duration-500 group-hover:scale-110" />
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-sm text-[var(--muted)]">
                No categories available.
              </div>
            )}
          </div>

          <div className="mt-6 rounded-[30px] bg-[#111111] px-6 py-8 text-white sm:px-8 lg:flex lg:items-center lg:justify-between lg:px-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                Everything in one place
              </span>

              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Can't decide where to start?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                Browse the complete product collection
                and discover something that fits your
                everyday needs.
              </p>
            </div>

            <Link
              href="/products"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-medium !text-[#111111] transition hover:bg-[#f0f0ec] lg:mt-0"
            >
              Browse all products

              <ArrowUpRight
                size={17}
                strokeWidth={1.8}
              />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

