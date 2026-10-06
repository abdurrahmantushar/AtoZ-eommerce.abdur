"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const defaultHero = {
  heroBadge: "The AtoZ Edit — 2026",
  heroLittleTitle: "Curated for every kind of life",
  heroHeadingOne: "Discover more.",
  heroHeadingTwo: "Live your way.",
  heroDescription:
    "From everyday essentials to the pieces you have been looking for, explore a modern marketplace built around discovery.",
  heroCategoryList: "Fashion · Tech · Beauty · Home · Lifestyle",
  heroVideoUrl: "https://www.youtube.com/watch?v=AXF4WhoDLus",
};

const getYouTubeVideoId = (url) => {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.slice(1).split("/")[0];
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      if (parsedUrl.pathname === "/watch") {
        return parsedUrl.searchParams.get("v") || "";
      }

      if (parsedUrl.pathname.startsWith("/embed/")) {
        return parsedUrl.pathname.split("/embed/")[1].split("?")[0];
      }

      if (parsedUrl.pathname.startsWith("/shorts/")) {
        return parsedUrl.pathname.split("/shorts/")[1].split("?")[0];
      }
    }
  } catch {
    return "";
  }

  return "";
};

export default function Hero() {
  const [hero, setHero] = useState(defaultHero);

  useEffect(() => {
    const fetchHeroSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/site-settings`, {
          credentials: "include",
        });

        const result = await response.json();

        if (result.success && result.data) {
          setHero({
            ...defaultHero,
            ...result.data,
          });
        }
      } catch (error) {
        console.error("Failed to fetch hero settings:", error);
      }
    };

    fetchHeroSettings();
  }, []);

  const videoId = getYouTubeVideoId(hero.heroVideoUrl);

  const videoSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&playsinline=1&rel=0`
    : "";

  return (
    <section className="container-main pt-4 pb-6 lg:pt-6 lg:pb-10">
      <div className="relative min-h-[620px] overflow-hidden rounded-[28px] bg-[#171717] lg:min-h-[700px]">
        {videoSrc && (
          <iframe
            className="pointer-events-none absolute inset-0 h-full w-full scale-[1.12]"
            src={videoSrc}
            title="AtoZ Shopping Hero"
            allow="autoplay; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />

        <div className="relative z-10 flex min-h-[620px] flex-col justify-between p-6 text-white sm:p-10 lg:min-h-[700px] lg:p-14">
          <div className="flex items-start justify-between gap-6">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-md sm:text-xs">
              {hero.heroBadge}
            </span>

            <button
              type="button"
              className="hidden h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition hover:bg-white hover:text-black sm:flex"
              aria-label="Play collection story"
            >
              <Play size={16} fill="currentColor" strokeWidth={1.6} />
            </button>
          </div>

          <div className="max-w-4xl">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-white/65">
              {hero.heroLittleTitle}
            </p>

            <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.92] tracking-[-0.055em] sm:text-6xl md:text-7xl lg:text-[92px]">
              {hero.heroHeadingOne}
              <br />
              {hero.heroHeadingTwo}
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
              {hero.heroDescription}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-medium !text-[#111111] transition hover:bg-[#dfff00]"
              >
                Shop all products

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight size={15} strokeWidth={2} />
                </span>
              </Link>

              <Link
                href="/categories"
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-medium backdrop-blur-md transition hover:bg-white hover:text-black"
              >
                Explore categories
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 border-t border-white/15 pt-5 text-xs text-white/55 sm:flex-row sm:items-center">
            <span>{hero.heroCategoryList}</span>

            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#dfff00]" />
              New drops every week
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}