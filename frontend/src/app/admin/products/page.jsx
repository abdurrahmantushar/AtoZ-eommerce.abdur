"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  ImagePlus,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  comparePrice: "",
  stock: "",
  sku: "",
  status: "Active",
};

const getProductStatus = (product) => {
  if (product?.isActive === false) return "Inactive";

  const stock = Number(product?.stock || 0);

  if (stock <= 0) return "Out of stock";
  if (stock <= 10) return "Low stock";

  return "Active";
};

const normalizeProduct = (product) => {
  const categoryData =
    product?.category && typeof product.category === "object"
      ? product.category
      : null;

  return {
    ...product,
    id: product?._id || product?.id || "",
    categoryId:
      categoryData?._id ||
      categoryData?.id ||
      (typeof product?.category === "string"
        ? product.category
        : ""),
    categoryName:
      categoryData?.name ||
      product?.categoryName ||
      "Uncategorized",
    price: Number(product?.price || 0),
    comparePrice: Number(product?.comparePrice || 0),
    stock: Number(product?.stock || 0),
    sku: product?.sku || "—",
    status: getProductStatus(product),
    images: Array.isArray(product?.images) ? product.images : [],
  };
};

const getProductsFromResult = (result) => {
  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.products)) {
    return result.data.products;
  }

  if (Array.isArray(result?.products)) {
    return result.products;
  }

  return [];
};

const getPagination = (result) => {
  return (
    result?.pagination ||
    result?.data?.pagination ||
    result?.meta ||
    null
  );
};

const slugify = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchAllProducts = async () => {
    const allProducts = [];

    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 100) {
      const response = await fetch(
        `${API_URL}/api/admin/products?page=${page}&limit=100`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to load products"
        );
      }

      const batch = getProductsFromResult(result);
      const pagination = getPagination(result);

      allProducts.push(...batch);

      if (pagination) {
        const currentPage = Number(
          pagination.page || page
        );

        const totalPages = Number(
          pagination.totalPages || page
        );

        hasMore = currentPage < totalPages;
      } else {
        hasMore = batch.length === 100;
      }

      if (!batch.length) {
        hasMore = false;
      }

      page += 1;
    }

    return allProducts.map(normalizeProduct);
  };

  const fetchCategories = async () => {
    const response = await fetch(
      `${API_URL}/api/categories`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message || "Failed to load categories"
      );
    }

    if (Array.isArray(result?.data)) {
      return result.data;
    }

    if (Array.isArray(result?.categories)) {
      return result.categories;
    }

    if (Array.isArray(result)) {
      return result;
    }

    return [];
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productData, categoryData] =
        await Promise.all([
          fetchAllProducts(),
          fetchCategories(),
        ]);

      setProducts(productData);
      setCategories(categoryData);

      if (
        !form.category &&
        categoryData.length > 0
      ) {
        setForm((prev) => ({
          ...prev,
          category:
            categoryData[0]?._id ||
            categoryData[0]?.id ||
            "",
        }));
      }
    } catch (error) {
      setError(
        error?.message ||
          "Something went wrong while loading data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = search
        .trim()
        .toLowerCase();

      const matchesSearch =
        !searchValue ||
        product.name
          ?.toLowerCase()
          .includes(searchValue) ||
        product.sku
          ?.toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        category === "all" ||
        product.categoryId === category;

      const matchesStatus =
        status === "all" ||
        product.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [products, search, category, status]);

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.status === "Active"
  ).length;

  const lowStockProducts = products.filter(
    (product) =>
      product.status === "Low stock" ||
      product.status === "Out of stock"
  ).length;

  const openCreate = () => {
    setEditingProduct(null);

    setForm({
      ...emptyForm,
      category:
        categories[0]?._id ||
        categories[0]?.id ||
        "",
    });

    setSelectedImages([]);
    setExistingImages([]);

    setError("");
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);

    setForm({
      name: product?.name || "",
      description: product?.description || "",
      category:
        product?.categoryId ||
        product?.category?._id ||
        product?.category?.id ||
        "",
      price:
        product?.price !== undefined &&
        product?.price !== null
          ? String(product.price)
          : "",
      comparePrice:
        product?.comparePrice !== undefined &&
        product?.comparePrice !== null
          ? String(product.comparePrice)
          : "",
      stock:
        product?.stock !== undefined &&
        product?.stock !== null
          ? String(product.stock)
          : "",
      sku:
        product?.sku === "—"
          ? ""
          : product?.sku || "",
      status:
        product?.isActive === false
          ? "Inactive"
          : "Active",
    });

    setExistingImages(
      Array.isArray(product?.images)
        ? product.images
        : []
    );

    setSelectedImages([]);

    setError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setFormOpen(false);
    setEditingProduct(null);
    setForm({ ...emptyForm });
    setSelectedImages([]);
    setExistingImages([]);
    setError("");
  };

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value ?? "",
    }));
  };

  const handleImageSelect = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    const totalCurrentImages =
      existingImages.length +
      selectedImages.length;

    const remainingSlots = Math.max(
      8 - totalCurrentImages,
      0
    );

    const newFiles = files
      .filter((file) =>
        file.type.startsWith("image/")
      )
      .slice(0, remainingSlots);

    setSelectedImages((prev) => [
      ...prev,
      ...newFiles,
    ]);

    event.target.value = "";
  };

  const removeSelectedImage = (index) => {
    setSelectedImages((prev) =>
      prev.filter(
        (_, imageIndex) => imageIndex !== index
      )
    );
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) =>
      prev.filter(
        (_, imageIndex) => imageIndex !== index
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const name = form.name.trim();
    const description = form.description.trim();
    const sku = form.sku.trim();

    const price = Number(form.price);
    const comparePrice =
      form.comparePrice === ""
        ? 0
        : Number(form.comparePrice);

    const stock = Number(form.stock);

    if (!name) {
      setError("Product name is required.");
      return;
    }

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    if (
      form.price === "" ||
      Number.isNaN(price) ||
      price < 0
    ) {
      setError("Please enter a valid price.");
      return;
    }

    if (
      form.comparePrice !== "" &&
      (Number.isNaN(comparePrice) ||
        comparePrice < 0)
    ) {
      setError(
        "Please enter a valid compare price."
      );
      return;
    }

    if (
      comparePrice > 0 &&
      comparePrice < price
    ) {
      setError(
        "Compare price should be greater than or equal to the product price."
      );
      return;
    }

    if (
      form.stock === "" ||
      Number.isNaN(stock) ||
      stock < 0
    ) {
      setError("Please enter a valid stock.");
      return;
    }

    if (!sku) {
      setError("SKU is required.");
      return;
    }

    if (
      selectedImages.length +
        existingImages.length >
      8
    ) {
      setError(
        "You can have maximum 8 images."
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", name);
      formData.append(
        "slug",
        slugify(name)
      );
      formData.append(
        "description",
        description
      );
      formData.append(
        "category",
        form.category
      );
      formData.append(
        "price",
        String(price)
      );
      formData.append(
        "comparePrice",
        String(comparePrice)
      );
      formData.append(
        "stock",
        String(stock)
      );
      formData.append("sku", sku);
      formData.append(
        "isActive",
        String(
          form.status === "Active"
        )
      );

      if (editingProduct) {
        existingImages.forEach((image) => {
          formData.append(
            "existingImages",
            image
          );
        });
      }

      selectedImages.forEach((file) => {
        formData.append(
          "images",
          file
        );
      });

      const url = editingProduct
        ? `${API_URL}/api/products/${editingProduct.id}`
        : `${API_URL}/api/products`;

      const method = editingProduct
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to save product."
        );
      }

      closeForm();

      await loadData();
    } catch (error) {
      setError(
        error?.message ||
          "Something went wrong while saving product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(
        `${API_URL}/api/products/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to delete product."
        );
      }

      await loadData();
    } catch (error) {
      setError(
        error?.message ||
          "Something went wrong while deleting product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusClasses = (
    productStatus
  ) => {
    if (productStatus === "Active") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }

    if (productStatus === "Low stock") {
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }

    if (
      productStatus === "Out of stock"
    ) {
      return "bg-red-500/10 text-red-400 border-red-500/20";
    }

    return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  };

  return (
    <div className="min-h-screen text-[#999991]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Package size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Products
                </h1>

                <p className="text-sm text-zinc-500">
                  Manage your product catalog and inventory.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {error && !formOpen && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-zinc-500">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {totalProducts}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-zinc-500">
              Active Products
            </p>

            <p className="mt-2 text-3xl font-semibold text-emerald-400">
              {activeProducts}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-zinc-500">
              Low / Out of Stock
            </p>

            <p className="mt-2 text-3xl font-semibold text-amber-400">
              {lowStockProducts}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search product or SKU..."
              className="h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/20"
            />
          </div>

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
            className="h-11 rounded-xl border border-white/10 bg-[#111318] px-4 text-sm text-white outline-none"
          >
            <option value="all">
              All Categories
            </option>

            {categories.map((item) => (
              <option
                key={
                  item?._id ||
                  item?.id ||
                  item?.name
                }
                value={
                  item?._id ||
                  item?.id ||
                  ""
                }
              >
                {item?.name || ""}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
            className="h-11 rounded-xl border border-white/10 bg-[#111318] px-4 text-sm text-white outline-none"
          >
            <option value="all">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

            <option value="Low stock">
              Low Stock
            </option>

            <option value="Out of stock">
              Out of Stock
            </option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center text-sm text-zinc-500">
              Loading products...
            </div>
          ) : filteredProducts.length ===
            0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <Package
                size={38}
                className="mb-4 text-zinc-700"
              />

              <h3 className="text-base font-medium">
                No products found
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500">
                      <th className="px-6 py-4 font-medium">
                        Product
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Category
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Price
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Stock
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map(
                      (product) => (
                        <tr
                          key={product.id}
                          className="border-b border-white/5 last:border-0"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                                {product.images?.[0] ? (
                                  <img
                                    src={
                                      product.images[0]
                                    }
                                    alt={
                                      product.name ||
                                      "Product"
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-zinc-600">
                                    <Package size={18} />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">
                                  {product.name}
                                </p>

                                <p className="mt-1 text-xs text-zinc-600">
                                  SKU: {product.sku}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-zinc-400">
                            {product.categoryName}
                          </td>

                          <td className="px-6 py-5 text-sm font-medium">
                            ৳
                            {product.price.toLocaleString(
                              "en-BD"
                            )}
                          </td>

                          <td className="px-6 py-5 text-sm text-zinc-400">
                            {product.stock}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                product.status
                              )}`}
                            >
                              {product.status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() =>
                                  openEdit(
                                    product
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:bg-white/[0.07] hover:text-white"
                              >
                                <Edit3 size={16} />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    product.id
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  product.id
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-white/5 lg:hidden">
                {filteredProducts.map(
                  (product) => (
                    <div
                      key={product.id}
                      className="p-4"
                    >
                      <div className="flex gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                          {product.images?.[0] ? (
                            <img
                              src={
                                product.images[0]
                              }
                              alt={
                                product.name ||
                                "Product"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-600">
                              <Package size={18} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-medium">
                                {product.name}
                              </h3>

                              <p className="mt-1 text-xs text-zinc-600">
                                SKU: {product.sku}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium ${getStatusClasses(
                                product.status
                              )}`}
                            >
                              {product.status}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">
                                ৳
                                {product.price.toLocaleString(
                                  "en-BD"
                                )}
                              </p>

                              <p className="mt-1 text-xs text-zinc-500">
                                Stock:{" "}
                                {product.stock}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  openEdit(
                                    product
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400"
                              >
                                <Edit3 size={16} />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    product.id
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  product.id
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111318] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Add product information and images.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto"
            >
              <div className="space-y-5 p-5">
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Product Images
                  </label>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {existingImages.map(
                      (image, index) => (
                        <div
                          key={`${image}-${index}`}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/20"
                        >
                          <img
                            src={image}
                            alt={`Product ${
                              index + 1
                            }`}
                            className="h-full w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeExistingImage(
                                index
                              )
                            }
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                          >
                            <X size={14} />
                          </button>

                          <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white">
                            Existing
                          </div>
                        </div>
                      )
                    )}

                    {selectedImages.map(
                      (file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/20"
                        >
                          <img
                            src={URL.createObjectURL(
                              file
                            )}
                            alt={
                              file.name ||
                              "Selected image"
                            }
                            className="h-full w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeSelectedImage(
                                index
                              )
                            }
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                          >
                            <X size={14} />
                          </button>

                          <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white">
                            New
                          </div>
                        </div>
                      )
                    )}

                    {existingImages.length +
                      selectedImages.length <
                      8 && (
                      <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-zinc-500 transition hover:border-white/30 hover:bg-white/[0.04] hover:text-white">
                        <ImagePlus size={24} />

                        <span className="mt-2 text-xs">
                          Add Image
                        </span>

                        <span className="mt-1 text-[10px] text-zinc-600">
                          Max 8
                        </span>

                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={
                            handleImageSelect
                          }
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-zinc-600">
                    You can upload up to 8 images.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium">
                      Product Name
                    </label>

                    <input
                      value={form.name ?? ""}
                      onChange={(event) =>
                        updateField(
                          "name",
                          event.target.value
                        )
                      }
                      placeholder="Enter product name"
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium">
                      Description
                    </label>

                    <textarea
                      value={
                        form.description ?? ""
                      }
                      onChange={(event) =>
                        updateField(
                          "description",
                          event.target.value
                        )
                      }
                      placeholder="Write a short product description..."
                      rows={4}
                      className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Category
                    </label>

                    <select
                      value={
                        form.category ?? ""
                      }
                      onChange={(event) =>
                        updateField(
                          "category",
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#111318] px-4 text-sm text-white outline-none focus:border-white/20"
                    >
                      <option value="">
                        Select category
                      </option>

                      {categories.map(
                        (item) => (
                          <option
                            key={
                              item?._id ||
                              item?.id ||
                              item?.name
                            }
                            value={
                              item?._id ||
                              item?.id ||
                              ""
                            }
                          >
                            {item?.name || ""}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      SKU
                    </label>

                    <input
                      value={form.sku ?? ""}
                      onChange={(event) =>
                        updateField(
                          "sku",
                          event.target.value
                        )
                      }
                      placeholder="e.g. PROD-001"
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.price ?? ""
                      }
                      onChange={(event) =>
                        updateField(
                          "price",
                          event.target.value
                        )
                      }
                      placeholder="0"
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Compare Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.comparePrice ?? ""
                      }
                      onChange={(event) =>
                        updateField(
                          "comparePrice",
                          event.target.value
                        )
                      }
                      placeholder="0"
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        form.stock ?? ""
                      }
                      onChange={(event) =>
                        updateField(
                          "stock",
                          event.target.value
                        )
                      }
                      placeholder="0"
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Status
                    </label>

                    <select
                      value={
                        form.status ?? "Active"
                      }
                      onChange={(event) =>
                        updateField(
                          "status",
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#111318] px-4 text-sm text-white outline-none focus:border-white/20"
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 bg-black/10 p-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="h-11 rounded-xl border border-white/10 px-5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}