
"use client";

import {
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const priceRanges = [
  {
    label: "All prices",
    value: "All",
  },
  {
    label: "Under $50",
    value: "under-50",
  },
  {
    label: "$50 - $100",
    value: "50-100",
  },
  {
    label: "$100 - $200",
    value: "100-200",
  },
  {
    label: "$200+",
    value: "200-plus",
  },
];

export default function ProductFilter({
  selectedCategory = "All",
  setSelectedCategory = () => {},
  selectedPriceRange = "All",
  setSelectedPriceRange = () => {},
}) {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [categories, setCategories] =
    useState(["All"]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  useEffect(() => {
    const controller =
      new AbortController();

    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
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
        if (
          error.name !== "AbortError"
        ) {
          console.error(
            "Product filter categories error:",
            error
          );
        }
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoadingCategories(false);
        }
      }
    };

    fetchCategories();

    return () => {
      controller.abort();
    };
  }, []);

  const filterContent = (
    <div className="rounded-[28px] border border-[var(--border)] bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#111111]">
          Filters
        </h2>

        {(selectedCategory !== "All" ||
          selectedPriceRange !== "All") && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(
                "All"
              );
              setSelectedPriceRange(
                "All"
              );
            }}
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
          {loadingCategories ? (
            <div className="space-y-2">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 animate-pulse rounded-xl bg-[#f4f4f1]"
                />
              ))}
            </div>
          ) : (
            categories.map(
              (category) => {
                const active =
                  selectedCategory ===
                  category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(
                        category
                      );
                      setMobileOpen(
                        false
                      );
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? "bg-[#111111] font-medium text-white"
                        : "text-[#666666] hover:bg-[#f4f4f1] hover:text-[#111111]"
                    }`}
                  >
                    {category}

                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#dfff00]" />
                    )}
                  </button>
                );
              }
            )
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-[var(--border)] pt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#999991]">
          Price
        </p>

        <div className="mt-3 space-y-1">
          {priceRanges.map(
            (range) => {
              const active =
                selectedPriceRange ===
                range.value;

              return (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => {
                    setSelectedPriceRange(
                      range.value
                    );
                    setMobileOpen(
                      false
                    );
                  }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-[#f0f0ec] font-medium text-[#111111]"
                      : "text-[#666666] hover:bg-[#f7f7f5] hover:text-[#111111]"
                  }`}
                >
                  {range.label}
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block">
        {filterContent}
      </div>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() =>
            setMobileOpen(true)
          }
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[#111111]"
        >
          <SlidersHorizontal
            size={17}
            strokeWidth={1.8}
          />
          Filters
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-[100]">
            <button
              type="button"
              onClick={() =>
                setMobileOpen(false)
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
                    setMobileOpen(
                      false
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0ec] text-[#666666] transition hover:bg-[#e8e8e3] hover:text-[#111111]"
                  aria-label="Close filters"
                >
                  <X
                    size={18}
                    strokeWidth={1.8}
                  />
                </button>
              </div>

              {filterContent}

              <button
                type="button"
                onClick={() =>
                  setMobileOpen(
                    false
                  )
                }
                className="mt-6 w-full rounded-2xl bg-[#111111] px-5 py-3.5 text-sm font-medium text-white"
              >
                Apply filters
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

