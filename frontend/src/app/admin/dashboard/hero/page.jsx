"use client";

import { useEffect, useState } from "react";
import { Save, Video } from "lucide-react";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const initialForm = {
  heroBadge: "",
  heroLittleTitle: "",
  heroHeadingOne: "",
  heroHeadingTwo: "",
  heroDescription: "",
  heroCategoryList: "",
  heroVideoUrl: "",
};

export default function HeroSettingsPage() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/site-settings`, {
          credentials: "include",
        });

        const result = await response.json();

        if (result.success && result.data) {
          setFormData({
            heroBadge: result.data.heroBadge || "",
            heroLittleTitle: result.data.heroLittleTitle || "",
            heroHeadingOne: result.data.heroHeadingOne || "",
            heroHeadingTwo: result.data.heroHeadingTwo || "",
            heroDescription: result.data.heroDescription || "",
            heroCategoryList: result.data.heroCategoryList || "",
            heroVideoUrl: result.data.heroVideoUrl || "",
          });
        }
      } catch (error) {
        toast.error("Failed to load hero settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/site-settings`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update hero settings.");
      }

      setFormData({
        heroBadge: result.data.heroBadge || "",
        heroLittleTitle: result.data.heroLittleTitle || "",
        heroHeadingOne: result.data.heroHeadingOne || "",
        heroHeadingTwo: result.data.heroHeadingTwo || "",
        heroDescription: result.data.heroDescription || "",
        heroCategoryList: result.data.heroCategoryList || "",
        heroVideoUrl: result.data.heroVideoUrl || "",
      });

      toast.success("Hero settings updated successfully.");
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2f8ee] text-[#5f8f3d]">
            <Video size={21} strokeWidth={1.8} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
              Hero Settings
            </h1>

            <p className="mt-1 text-sm text-[#777777]">
              Manage your homepage hero content and video.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-[#e8e8e3] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#222222]">
                Badge
              </label>

              <input
                type="text"
                name="heroBadge"
                value={formData.heroBadge}
                onChange={handleChange}
                placeholder="The AtoZ Edit — 2026"
                className="h-12 w-full rounded-xl border border-[#deded8] bg-[#fafaf7] px-4 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#222222]">
                Little Title
              </label>

              <input
                type="text"
                name="heroLittleTitle"
                value={formData.heroLittleTitle}
                onChange={handleChange}
                placeholder="Curated for every kind of life"
                className="h-12 w-full rounded-xl border border-[#deded8] bg-[#fafaf7] px-4 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#222222]">
                Heading 1
              </label>

              <input
                type="text"
                name="heroHeadingOne"
                value={formData.heroHeadingOne}
                onChange={handleChange}
                placeholder="Discover more."
                className="h-12 w-full rounded-xl border border-[#deded8] bg-[#fafaf7] px-4 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#222222]">
                Heading 2
              </label>

              <input
                type="text"
                name="heroHeadingTwo"
                value={formData.heroHeadingTwo}
                onChange={handleChange}
                placeholder="Live your way."
                className="h-12 w-full rounded-xl border border-[#deded8] bg-[#fafaf7] px-4 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-[#222222]">
                Description
              </label>

              <textarea
                name="heroDescription"
                value={formData.heroDescription}
                onChange={handleChange}
                placeholder="From everyday essentials..."
                rows={5}
                className="w-full resize-none rounded-xl border border-[#deded8] bg-[#fafaf7] px-4 py-3 text-sm leading-6 text-[#111111] outline-none transition focus:border-[#111111]"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-[#222222]">
                Category List
              </label>

              <input
                type="text"
                name="heroCategoryList"
                value={formData.heroCategoryList}
                onChange={handleChange}
                placeholder="Fashion · Tech · Beauty · Home · Lifestyle"
                className="h-12 w-full rounded-xl border border-[#deded8] bg-[#fafaf7] px-4 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-[#222222]">
                Hero Video URL
              </label>

              <input
                type="url"
                name="heroVideoUrl"
                value={formData.heroVideoUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=AXF4WhoDLus"
                className="h-12 w-full rounded-xl border border-[#deded8] bg-[#fafaf7] px-4 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
              />

              <p className="mt-2 text-xs text-[#888888]">
                Use a normal YouTube video URL.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end border-t border-[#eeeeea] pt-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-3 text-sm font-medium text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={17} strokeWidth={1.8} />
              {saving ? "Updating..." : "Update Hero"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}