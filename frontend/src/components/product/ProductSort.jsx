"use client";

import { ChevronDown } from "lucide-react";

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

export default function ProductSort({ value, setValue }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-11 appearance-none rounded-full border border-[var(--border)] bg-white pl-4 pr-10 text-sm font-medium outline-none transition focus:border-[var(--dark)]"
      >
        {sortOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        strokeWidth={1.8}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
      />
    </div>
  );
}

