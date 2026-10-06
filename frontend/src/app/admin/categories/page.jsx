"use client";

import { useMemo, useEffect, useState } from "react";
import {
  Edit3,
  FolderTree,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  color: "#e9eceb",
  status: "Active",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("All");

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to fetch categories"
        );
      }

      const categoryData =
        result.data || [];

      const categoriesWithProducts =
        await Promise.all(
          categoryData.map(
            async (category) => {
              try {
                const productResponse =
                  await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/products?category=${encodeURIComponent(
                      category.slug
                    )}&page=1&limit=1`,
                    {
                      credentials:
                        "include",
                      cache: "no-store",
                    }
                  );

                const productResult =
                  await productResponse.json();

                const pagination =
                  productResult.pagination ||
                  productResult.data?.pagination ||
                  productResult.meta ||
                  {};

                const productCount = Number(
                  pagination.total ||
                    productResult.total ||
                    0
                );

                return {
                  ...category,
                  id:
                    category._id ||
                    category.id,
                  status: category.isActive
                    ? "Active"
                    : "Inactive",
                  products:
                    productCount,
                };
              } catch (error) {
                console.error(
                  `Product count error for ${category.name}:`,
                  error
                );

                return {
                  ...category,
                  id:
                    category._id ||
                    category.id,
                  status: category.isActive
                    ? "Active"
                    : "Inactive",
                  products: 0,
                };
              }
            }
          )
        );

      setCategories(
        categoriesWithProducts
      );
    } catch (error) {
      console.error(
        "Categories fetch error:",
        error
      );

      setError(
        error.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      return categories.filter(
        (category) => {
          const matchesSearch =
            !term ||
            category.name
              ?.toLowerCase()
              .includes(term) ||
            category.slug
              ?.toLowerCase()
              .includes(term);

          const matchesStatus =
            status === "All" ||
            category.status === status;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [categories, search, status]);

  const activeCount =
    categories.filter(
      (category) =>
        category.status === "Active"
    ).length;

  const assignedProducts =
    categories.reduce(
      (total, category) =>
        total +
        Number(category.products || 0),
      0
    );

  const openCreate = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setError("");
    setFormOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);

setForm({
  name: category.name || "",
  slug: category.slug || "",
  description: category.description || "",
  color: category.color || "#e9eceb",
  status: category.status || "Active",
});

    setError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setFormOpen(false);
    setEditingCategory(null);
    setForm(emptyForm);
    setError("");
  };

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.slug.trim()
    ) {
      setError(
        "Category name and slug are required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const categoryData = {
        name: form.name.trim(),
        slug: form.slug
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-"),
        description: form.description.trim(),
        color: form.color,
        isActive: form.status === "Active",
      };
      const url = editingCategory
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${editingCategory.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/categories`;

      const method = editingCategory
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            categoryData
          ),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to save category"
        );
      }

      closeForm();
      await fetchCategories();
    } catch (error) {
      console.error(
        "Category save error:",
        error
      );

      setError(
        error.message ||
          "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    id
  ) => {
    const category =
      categories.find(
        (item) => item.id === id
      );

    const confirmed = window.confirm(
      `Delete "${category?.name || "this category"}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to delete category"
        );
      }

      await fetchCategories();
    } catch (error) {
      console.error(
        "Category delete error:",
        error
      );

      setError(
        error.message ||
          "Unable to delete category."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#999991]">
              Catalog
            </span>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-4xl">
              Categories
            </h2>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Organize products into clear storefront categories.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#252525]"
          >
            <Plus
              size={17}
              strokeWidth={1.8}
            />
            Add category
          </button>
        </div>

        {error && !formOpen && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total categories"
            value={categories.length}
          />

          <StatCard
            label="Active"
            value={activeCount}
          />

          <StatCard
            label="Products assigned"
            value={assignedProducts}
          />
        </div>

        <div className="mt-6 rounded-[28px] border border-[var(--border)] bg-white">
          <div className="border-b border-[var(--border)] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search categories..."
                  className="w-full rounded-2xl border border-transparent bg-[#f5f5f2] py-3.5 pl-11 pr-4 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111] focus:bg-white"
                />
              </div>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[#111111] outline-none"
              >
                <option value="All">
                  All status
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-[#f7f7f5] p-4"
                >
                  <div className="h-11 w-11 animate-pulse rounded-xl bg-[#e9e9e4]" />

                  <div className="mt-6 h-5 w-32 animate-pulse rounded bg-[#e9e9e4]" />

                  <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[#e9e9e4]" />

                  <div className="mt-4 h-10 w-full animate-pulse rounded bg-[#e9e9e4]" />

                  <div className="mt-5 h-px bg-[#e7e7e2]" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map(
                  (category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onEdit={openEdit}
                      onDelete={
                        handleDelete
                      }
                      deleting={
                        deletingId ===
                        category.id
                      }
                    />
                  )
                )}
              </div>

              {filteredCategories.length ===
                0 && (
                <div className="px-6 py-20 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f0ec]">
                    <FolderTree
                      size={23}
                      strokeWidth={1.7}
                    />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-[#111111]">
                    No categories found
                  </h3>

                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Try a different
                    search or status
                    filter.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {formOpen && (
        <CategoryFormModal
          form={form}
          editingCategory={
            editingCategory
          }
          onClose={closeForm}
          onChange={updateField}
          onSubmit={handleSubmit}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
}) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-white p-5">
      <p className="text-xs text-[#888880]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
        {value}
      </p>
    </div>
  );
}

function CategoryCard({
  category,
  onEdit,
  onDelete,
  deleting,
}) {
  return (
    <div className="rounded-2xl bg-[#f7f7f5] p-4 transition hover:bg-[#f3f3ef]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
          <FolderTree
            size={18}
            strokeWidth={1.7}
          />
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            category.status ===
            "Active"
              ? "bg-[#eef4e5] text-[#60703f]"
              : "bg-[#f0f0ec] text-[#777777]"
          }`}
        >
          {category.status}
        </span>
      </div>

      <h3 className="mt-6 text-lg font-semibold tracking-[-0.03em] text-[#111111]">
        {category.name}
      </h3>

      <p className="mt-1 text-xs text-[#999991]">
        /{category.slug}
      </p>

      <p className="mt-4 min-h-[42px] text-sm leading-6 text-[#666666]">
        {category.description ||
          "No description added."}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-[#e7e7e2] pt-4">
        <div className="flex items-center gap-2 text-xs text-[#666666]">
          <Package
            size={14}
            strokeWidth={1.7}
          />

          {category.products || 0}{" "}
          products
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() =>
              onEdit(category)
            }
            disabled={deleting}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#666666] transition hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Edit ${category.name}`}
          >
            <Edit3
              size={15}
              strokeWidth={1.8}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(category.id)
            }
            disabled={deleting}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#666666] transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Delete ${category.name}`}
          >
            {deleting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#999] border-t-transparent" />
            ) : (
              <Trash2
                size={15}
                strokeWidth={1.8}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryFormModal({
  form,
  editingCategory,
  onClose,
  onChange,
  onSubmit,
  saving,
  error,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close category form"
      />

      <div className="relative w-full max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-white p-6 sm:max-w-lg sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#999991]">
              Catalog
            </span>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
              {editingCategory
                ? "Edit category"
                : "Add category"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0ec] disabled:opacity-40"
          >
            <X
              size={17}
              strokeWidth={1.8}
            />
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="mt-7 space-y-5"
        >
          <FormField
            label="Category name"
            value={form.name}
            onChange={(value) =>
              onChange(
                "name",
                value
              )
            }
            placeholder="Electronics"
          />

          <FormField
            label="Slug"
            value={form.slug}
            onChange={(value) =>
              onChange(
                "slug",
                value
              )
            }
            placeholder="electronics"
          />
                <div>
        <label className="mb-2 block text-xs font-medium text-[#555555]">
          Category color
        </label>

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={form.color}
            onChange={(event) =>
              onChange("color", event.target.value)
            }
            className="h-12 w-14 cursor-pointer rounded-xl border border-[var(--border)] bg-white p-1"
          />

          <input
            type="text"
            value={form.color}
            onChange={(event) =>
              onChange("color", event.target.value)
            }
            placeholder="#e9eceb"
            className="flex-1 rounded-2xl border border-[var(--border)] bg-[#fafaf8] px-4 py-3.5 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111] focus:bg-white"
          />
        </div>
      </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#555555]">
              Description
            </label>

            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                onChange(
                  "description",
                  event.target.value
                )
              }
              placeholder="Describe this category..."
              className="w-full resize-none rounded-2xl border border-[var(--border)] bg-[#fafaf8] px-4 py-3.5 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111] focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#555555]">
              Status
            </label>

            <select
              value={form.status}
              onChange={(event) =>
                onChange(
                  "status",
                  event.target.value
                )
              }
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3.5 text-sm text-[#111111] outline-none focus:border-[#111111]"
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-2xl border border-[var(--border)] px-5 py-3.5 text-sm font-medium text-[#555555] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-2xl bg-[#111111] px-5 py-3.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingCategory
                  ? "Save changes"
                  : "Create category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-[#555555]">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[var(--border)] bg-[#fafaf8] px-4 py-3.5 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111] focus:bg-white"
      />
    </div>
  );
}

