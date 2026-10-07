"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

const priceRanges = [
  {
    label: "All prices",
    value: "All",
  },
  {
    label: "Under ৳500",
    value: "under-500",
  },
  {
    label: "৳500 - ৳1,000",
    value: "500-1000",
  },
  {
    label: "৳1,000 - ৳2,000",
    value: "1000-2000",
  },
  {
    label: "৳2,000+",
    value: "2000-plus",
  },
];

const sortOptions = [
  {
    label: "Featured",
    value: "featured",
  },
  {
    label: "Newest",
    value: "newest",
  },
  {
    label: "Price: Low to High",
    value: "price-low",
  },
  {
    label: "Price: High to Low",
    value: "price-high",
  },
  {
    label: "Top Rated",
    value: "rating",
  },
];

function SearchContent() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [categories, setCategories] =
    useState(["All"]);

  const [activeCategory, setActiveCategory] =
    useState("All");

  const [activePrice, setActivePrice] =
    useState("All prices");

  const [sort, setSort] =
    useState("featured");

  const [products, setProducts] =
    useState([]);

  const [totalProducts, setTotalProducts] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  useEffect(() => {
    const urlQuery =
      searchParams.get("q") || "";

    setQuery(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    const controller =
      new AbortController();

    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/categories`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch categories"
          );
        }

        const result =
          await response.json();

        const categoryNames = (
          result.data || []
        ).map((category) => category.name);

        setCategories([
          "All",
          ...categoryNames,
        ]);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Search categories fetch error:",
            error
          );
        }
      }
    };

    fetchCategories();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller =
      new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params =
          new URLSearchParams();

        const searchTerm =
          query.trim();

        if (searchTerm) {
          params.set("q", searchTerm);
        }

        if (activeCategory !== "All") {
          params.set(
            "category",
            activeCategory.toLowerCase()
          );
        }

        const selectedPrice =
          priceRanges.find(
            (range) =>
              range.label === activePrice
          );

        if (
          selectedPrice?.min !==
          undefined
        ) {
          params.set(
            "minPrice",
            selectedPrice.min
          );
        }

        if (
          selectedPrice?.max !==
          undefined
        ) {
          params.set(
            "maxPrice",
            selectedPrice.max
          );
        }

        if (sort) {
          params.set("sort", sort);
        }

        params.set("page", "1");
        params.set("limit", "100");

        const response = await fetch(
          `${API_URL}/api/products?${params.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch products"
          );
        }

        const result =
          await response.json();

        const productData =
          result.data || [];

        setProducts(productData);

        setTotalProducts(
          result.pagination?.total ??
            productData.length
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Search products fetch error:",
            error
          );

          setProducts([]);
          setTotalProducts(0);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(
      fetchProducts,
      query.trim() ? 350 : 0
    );

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    query,
    activeCategory,
    activePrice,
    sort,
  ]);

  const clearFilters = () => {
    setActiveCategory("All");
    setActivePrice("All prices");
  };

  const clearSearch = () => {
    setQuery("");
  };

  const clearEverything = () => {
    setQuery("");
    setActiveCategory("All");
    setActivePrice("All prices");
    setSort("featured");
  };

  const hasFilters =
    activeCategory !== "All" ||
    activePrice !== "All prices";

  const hasAnything =
    query.trim() !== "" ||
    hasFilters ||
    sort !== "featured";

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[var(--background)]">
        <section className="container-main section-space">
          <div className="mb-8">
            <Link
              href="/"
              className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-[#666666] transition hover:text-[#111111]"
            >
              <ArrowLeft
                size={16}
                strokeWidth={1.8}
              />
              Back to home
            </Link>

            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#999991]">
              Discover
            </span>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#111111] sm:text-5xl">
              Search products
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Find products across electronics,
              fashion, beauty, home, sports,
              and more.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
            <aside className="hidden lg:block">
              <FilterPanel
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={
                  setActiveCategory
                }
                activePrice={activePrice}
                setActivePrice={
                  setActivePrice
                }
                clearFilters={clearFilters}
                hasFilters={hasFilters}
              />
            </aside>

            <div>
              <div className="rounded-[24px] border border-[var(--border)] bg-white p-3 sm:p-4">
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative flex-1">
                    <Search
                      size={18}
                      strokeWidth={1.8}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
                    />

                    <input
                      type="text"
                      value={query}
                      onChange={(event) =>
                        setQuery(
                          event.target.value
                        )
                      }
                      placeholder="Search for products..."
                      className="w-full rounded-2xl border border-transparent bg-[#f5f5f2] py-3.5 pl-11 pr-11 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111] focus:bg-white"
                    />

                    {query && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#777] transition hover:bg-[#eaeae6] hover:text-[#111111]"
                        aria-label="Clear search"
                      >
                        <X
                          size={16}
                          strokeWidth={1.8}
                        />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setMobileFiltersOpen(
                        true
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[#111111] lg:hidden"
                  >
                    <SlidersHorizontal
                      size={17}
                      strokeWidth={1.8}
                    />
                    Filters
                  </button>

                  <select
                    value={sort}
                    onChange={(event) =>
                      setSort(
                        event.target.value
                      )
                    }
                    className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
                  >
                    {sortOptions.map(
                      (option) => (
                        <option
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--muted)]">
                  <span className="font-semibold text-[#111111]">
                    {totalProducts}
                  </span>{" "}
                  {totalProducts === 1
                    ? "product"
                    : "products"}

                  {query && (
                    <>
                      {" "}
                      for{" "}
                      <span className="font-medium text-[#111111]">
                        "{query}"
                      </span>
                    </>
                  )}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-left text-sm font-medium text-[#111111] underline underline-offset-4"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {loading ? (
                <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({
                    length: 8,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse"
                    >
                      <div className="aspect-[4/5] rounded-[24px] bg-[#ecece7]" />

                      <div className="pt-4">
                        <div className="h-3 w-20 rounded bg-black/10" />

                        <div className="mt-2 h-5 w-32 rounded bg-black/10" />

                        <div className="mt-2 h-4 w-20 rounded bg-black/10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map(
                    (product) => (
                      <ProductCard
                        key={product._id}
                        product={{
                          ...product,
                          id: product._id,
                        }}
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="mt-7 rounded-[28px] border border-dashed border-[var(--border)] bg-white px-6 py-20 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f0ec]">
                    <Search
                      size={24}
                      strokeWidth={1.7}
                    />
                  </div>

                  <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
                    No products found
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
                    We couldn't find anything
                    matching your current search
                    or filters.
                  </p>

                  <button
                    type="button"
                    onClick={
                      clearEverything
                    }
                    className="mt-6 rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#252525]"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            onClick={() =>
              setMobileFiltersOpen(false)
            }
            className="absolute inset-0 bg-black/40"
            aria-label="Close filters"
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#999991]">
                  Refine
                </span>

                <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111111]">
                  Filters
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen(
                    false
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0ec] text-[#666] transition hover:bg-[#e8e8e3] hover:text-[#111111]"
                aria-label="Close filters"
              >
                <X
                  size={18}
                  strokeWidth={1.8}
                />
              </button>
            </div>

            <FilterPanel
              categories={categories}
              activeCategory={
                activeCategory
              }
              setActiveCategory={
                setActiveCategory
              }
              activePrice={activePrice}
              setActivePrice={
                setActivePrice
              }
              clearFilters={clearFilters}
              hasFilters={hasFilters}
            />

            <button
              type="button"
              onClick={() =>
                setMobileFiltersOpen(
                  false
                )
              }
              className="mt-7 w-full rounded-2xl bg-[#111111] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#252525]"
            >
              Show {totalProducts}{" "}
              {totalProducts === 1
                ? "result"
                : "results"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterPanel({
  categories,
  activeCategory,
  setActiveCategory,
  activePrice,
  setActivePrice,
  clearFilters,
  hasFilters,
}) {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#111111]">
          Filters
        </h2>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-[#777] underline underline-offset-4 transition hover:text-[#111111]"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#999991]">
          Category
        </p>

        <div className="mt-3 space-y-1">
          {categories.map((category) => {
            const active =
              activeCategory ===
              category;

            return (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setActiveCategory(
                    category
                  )
                }
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-[#111111] font-medium text-white"
                    : "text-[#666] hover:bg-[#f4f4f1] hover:text-[#111111]"
                }`}
              >
                {category}

                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#dfff00]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 border-t border-[var(--border)] pt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#999991]">
          Price
        </p>

        <div className="mt-3 space-y-1">
          {priceRanges.map((range) => {
            const active =
              activePrice ===
              range.label;

            return (
              <button
                key={range.label}
                type="button"
                onClick={() =>
                  setActivePrice(
                    range.label
                  )
                }
                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-[#f0f0ec] font-medium text-[#111111]"
                    : "text-[#666] hover:bg-[#f7f7f5] hover:text-[#111111]"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  );
}