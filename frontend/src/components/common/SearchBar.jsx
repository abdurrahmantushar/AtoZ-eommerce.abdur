"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search
        size={17}
        strokeWidth={1.8}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
      />

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products..."
        className="w-full rounded-full border border-[var(--border)] bg-white py-3 pl-11 pr-11 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111]"
      />

      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#777] transition hover:bg-[#f0f0ec] hover:text-[#111111]"
          aria-label="Clear search"
        >
          <X size={15} strokeWidth={1.8} />
        </button>
      )}
    </form>
  );
}