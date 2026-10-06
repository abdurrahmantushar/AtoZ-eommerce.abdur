"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Edit3,
  Plus,
  Search,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";

const emptyForm = {
  code: "",
  type: "Percentage",
  value: "",
  minPurchase: "",
  limit: "",
  expires: "",
  status: "Active",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] =
    useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState(null);
  const [error, setError] = useState("");

  const getStatus = (coupon) => {
    if (!coupon?.isActive) {
      return "Disabled";
    }

    if (
      coupon?.expiresAt &&
      new Date(coupon.expiresAt) < new Date()
    ) {
      return "Expired";
    }

    if (
      coupon?.usageLimit &&
      Number(coupon.usedCount || 0) >=
        Number(coupon.usageLimit)
    ) {
      return "Expired";
    }

    return "Active";
  };

  const normalizeCoupon = (coupon) => {
    return {
      ...coupon,
      id: coupon._id || coupon.id,
      type:
        coupon.type === "percentage"
          ? "Percentage"
          : "Fixed",
      value: Number(coupon.value || 0),
      minPurchase: Number(
        coupon.minOrderAmount || 0
      ),
      usage: Number(
        coupon.usedCount || 0
      ),
      limit: Number(
        coupon.usageLimit || 0
      ),
      expires:
        coupon.expiresAt || null,
      status: getStatus(coupon),
    };
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/coupons`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to fetch coupons"
        );
      }

      const couponData =
        result.data || [];

      setCoupons(
        couponData.map(normalizeCoupon)
      );
    } catch (error) {
      console.error(
        "Coupons fetch error:",
        error
      );

      setError(
        error.message ||
          "Unable to load coupons."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredCoupons = useMemo(() => {
    const term =
      search.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const matchesSearch =
        !term ||
        coupon.code
          ?.toLowerCase()
          .includes(term);

      const matchesStatus =
        status === "All" ||
        coupon.status === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [coupons, search, status]);

  const activeCount = coupons.filter(
    (coupon) => coupon.status === "Active"
  ).length;

  const totalRedemptions =
    coupons.reduce(
      (total, coupon) =>
        total + Number(coupon.usage || 0),
      0
    );

  const openCreate = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setError("");
    setFormOpen(true);
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code || "",
      type:
        coupon.type || "Percentage",
      value: String(coupon.value || ""),
      minPurchase: String(
        coupon.minPurchase || 0
      ),
      limit: String(coupon.limit || ""),
      expires: coupon.expires
        ? formatDateForInput(
            coupon.expires
          )
        : "",
      status:
        coupon.status === "Expired"
          ? "Active"
          : coupon.status || "Active",
    });

    setError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setFormOpen(false);
    setEditingCoupon(null);
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
      !form.code.trim() ||
      !form.value ||
      !form.limit ||
      !form.expires
    ) {
      setError(
        "Code, value, usage limit and expiry date are required."
      );
      return;
    }

    const numericValue =
      Number(form.value);

    const minimumPurchase =
      Number(form.minPurchase || 0);

    const usageLimit =
      Number(form.limit);

    if (numericValue <= 0) {
      setError(
        "Discount value must be greater than 0."
      );
      return;
    }

    if (
      form.type === "Percentage" &&
      numericValue > 100
    ) {
      setError(
        "Percentage discount cannot exceed 100."
      );
      return;
    }

    if (minimumPurchase < 0) {
      setError(
        "Minimum purchase cannot be negative."
      );
      return;
    }

    if (usageLimit < 1) {
      setError(
        "Usage limit must be at least 1."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const couponData = {
        code: form.code
          .trim()
          .toUpperCase(),

        type:
          form.type === "Percentage"
            ? "percentage"
            : "fixed",

        value: numericValue,

        minOrderAmount:
          minimumPurchase,

        usageLimit,

        expiresAt: new Date(
          `${form.expires}T23:59:59`
        ).toISOString(),

        isActive:
          form.status === "Active",
      };

      const url = editingCoupon
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/coupons/${editingCoupon.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/coupons`;

      const method = editingCoupon
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
            couponData
          ),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to save coupon"
        );
      }

      closeForm();
      await fetchCoupons();
    } catch (error) {
      console.error(
        "Coupon save error:",
        error
      );

      setError(
        error.message ||
          "Unable to save coupon."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    id
  ) => {
    const coupon = coupons.find(
      (item) => item.id === id
    );

    const confirmed =
      window.confirm(
        `Delete "${
          coupon?.code || "this coupon"
        }"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/coupons/${id}`,
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
            "Failed to delete coupon"
        );
      }

      await fetchCoupons();
    } catch (error) {
      console.error(
        "Coupon delete error:",
        error
      );

      setError(
        error.message ||
          "Unable to delete coupon."
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
              Promotions
            </span>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-4xl">
              Coupons
            </h2>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Create and manage discount codes for your customers.
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

            Create coupon
          </button>
        </div>

        {error && !formOpen && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total coupons"
            value={coupons.length}
          />

          <StatCard
            label="Active"
            value={activeCount}
          />

          <StatCard
            label="Total redemptions"
            value={totalRedemptions}
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
                  placeholder="Search coupon code..."
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

                <option value="Expired">
                  Expired
                </option>

                <option value="Disabled">
                  Disabled
                </option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-2xl bg-[#f5f5f2]"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left">
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Coupon
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Discount
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Minimum
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Usage
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Expires
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCoupons.map(
                      (coupon) => (
                        <CouponRow
                          key={coupon.id}
                          coupon={coupon}
                          onEdit={
                            openEdit
                          }
                          onDelete={
                            handleDelete
                          }
                          deleting={
                            deletingId ===
                            coupon.id
                          }
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 lg:hidden">
                {filteredCoupons.map(
                  (coupon) => (
                    <CouponMobileCard
                      key={coupon.id}
                      coupon={coupon}
                      onEdit={
                        openEdit
                      }
                      onDelete={
                        handleDelete
                      }
                      deleting={
                        deletingId ===
                        coupon.id
                      }
                    />
                  )
                )}
              </div>

              {filteredCoupons.length ===
                0 && (
                <div className="px-6 py-20 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f0ec]">
                    <TicketPercent
                      size={23}
                      strokeWidth={1.7}
                    />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-[#111111]">
                    No coupons found
                  </h3>

                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Try changing your search or status filter.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {formOpen && (
        <CouponFormModal
          form={form}
          editingCoupon={
            editingCoupon
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

function CouponRow({
  coupon,
  onEdit,
  onDelete,
  deleting,
}) {
  const usagePercent =
    coupon.limit > 0
      ? Math.min(
          (coupon.usage /
            coupon.limit) *
            100,
          100
        )
      : 0;

  return (
    <tr className="border-b border-[var(--border)] last:border-0">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f0ec]">
            <TicketPercent
              size={17}
              strokeWidth={1.7}
            />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.02em] text-[#111111]">
              {coupon.code}
            </p>

            <p className="mt-1 text-xs text-[#999991]">
              {coupon.limit} total uses
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5 text-sm font-semibold text-[#111111]">
        {coupon.type ===
        "Percentage"
          ? `${coupon.value}%`
          : `$${coupon.value}`}
      </td>

      <td className="px-6 py-5 text-sm text-[#666666]">
        $
        {Number(
          coupon.minPurchase || 0
        ).toFixed(2)}
      </td>

      <td className="px-6 py-5">
        <div className="w-28">
          <div className="mb-1 flex justify-between text-[10px] text-[#888880]">
            <span>
              {coupon.usage}
            </span>

            <span>
              {coupon.limit}
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[#eeeeea]">
            <div
              className="h-full rounded-full bg-[#111111]"
              style={{
                width: `${usagePercent}%`,
              }}
            />
          </div>
        </div>
      </td>

      <td className="px-6 py-5 text-sm text-[#666666]">
        {formatDisplayDate(
          coupon.expires
        )}
      </td>

      <td className="px-6 py-5">
        <CouponStatus
          status={coupon.status}
        />
      </td>

      <td className="px-6 py-5">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() =>
              onEdit(coupon)
            }
            disabled={deleting}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[#666666] hover:border-[#111111] hover:text-[#111111] disabled:opacity-40"
          >
            <Edit3
              size={15}
              strokeWidth={1.8}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(coupon.id)
            }
            disabled={deleting}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[#666666] hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
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
      </td>
    </tr>
  );
}

function CouponMobileCard({
  coupon,
  onEdit,
  onDelete,
  deleting,
}) {
  return (
    <div className="rounded-2xl bg-[#f7f7f5] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
            <TicketPercent
              size={17}
              strokeWidth={1.7}
            />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.02em] text-[#111111]">
              {coupon.code}
            </p>

            <p className="mt-1 text-xs text-[#888880]">
              Expires{" "}
              {formatDisplayDate(
                coupon.expires
              )}
            </p>
          </div>
        </div>

        <CouponStatus
          status={coupon.status}
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Info
          label="Discount"
          value={
            coupon.type ===
            "Percentage"
              ? `${coupon.value}%`
              : `$${coupon.value}`
          }
        />

        <Info
          label="Minimum"
          value={`$${Number(
            coupon.minPurchase || 0
          ).toFixed(2)}`}
        />

        <Info
          label="Usage"
          value={`${coupon.usage}/${coupon.limit}`}
        />
      </div>

      <div className="mt-4 flex gap-2 border-t border-[#e7e7e2] pt-3">
        <button
          type="button"
          onClick={() =>
            onEdit(coupon)
          }
          disabled={deleting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-medium text-[#111111] disabled:opacity-40"
        >
          <Edit3
            size={14}
            strokeWidth={1.8}
          />
          Edit
        </button>

        <button
          type="button"
          onClick={() =>
            onDelete(coupon.id)
          }
          disabled={deleting}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-500 disabled:opacity-40"
        >
          {deleting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
          ) : (
            <Trash2
              size={15}
              strokeWidth={1.8}
            />
          )}
        </button>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#999991]">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-[#111111]">
        {value}
      </p>
    </div>
  );
}

function CouponStatus({
  status,
}) {
  const styles = {
    Active:
      "bg-[#eef4e5] text-[#60703f]",
    Expired:
      "bg-[#f0f0ec] text-[#777777]",
    Disabled:
      "bg-[#f7eaea] text-[#9b5555]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        styles[status] ||
        "bg-[#f0f0ec] text-[#666666]"
      }`}
    >
      {status}
    </span>
  );
}

function CouponFormModal({
  form,
  editingCoupon,
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
        aria-label="Close coupon form"
      />

      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-6 sm:max-w-lg sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#999991]">
              Promotion
            </span>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
              {editingCoupon
                ? "Edit coupon"
                : "Create coupon"}
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
          <div>
            <label className="mb-2 block text-xs font-medium text-[#555555]">
              Coupon code
            </label>

            <input
              type="text"
              value={form.code}
              onChange={(event) =>
                onChange(
                  "code",
                  event.target.value.toUpperCase()
                )
              }
              placeholder="WELCOME10"
              className="w-full rounded-2xl border border-[var(--border)] bg-[#fafaf8] px-4 py-3.5 text-sm font-medium tracking-[0.03em] text-[#111111] outline-none placeholder:text-[#aaa] focus:border-[#111111] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-[#555555]">
                Discount type
              </label>

              <select
                value={form.type}
                onChange={(event) =>
                  onChange(
                    "type",
                    event.target.value
                  )
                }
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3.5 text-sm text-[#111111] outline-none focus:border-[#111111]"
              >
                <option value="Percentage">
                  Percentage
                </option>

                <option value="Fixed">
                  Fixed amount
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[#555555]">
                Value
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={form.value}
                  onChange={(event) =>
                    onChange(
                      "value",
                      event.target.value
                    )
                  }
                  placeholder={
                    form.type ===
                    "Percentage"
                      ? "10"
                      : "15"
                  }
                  className="w-full rounded-2xl border border-[var(--border)] bg-[#fafaf8] px-4 py-3.5 pr-10 text-sm text-[#111111] outline-none focus:border-[#111111] focus:bg-white"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#999999]">
                  {form.type ===
                  "Percentage"
                    ? "%"
                    : "$"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-[#555555]">
                Minimum purchase
              </label>

              <input
                type="number"
                min="0"
                value={form.minPurchase}
                onChange={(event) =>
                  onChange(
                    "minPurchase",
                    event.target.value
                  )
                }
                placeholder="50"
                className="w-full rounded-2xl border border-[var(--border)] bg-[#fafaf8] px-4 py-3.5 text-sm text-[#111111] outline-none focus:border-[#111111] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[#555555]">
                Usage limit
              </label>

              <input
                type="number"
                min="1"
                value={form.limit}
                onChange={(event) =>
                  onChange(
                    "limit",
                    event.target.value
                  )
                }
                placeholder="500"
                className="w-full rounded-2xl border border-[var(--border)] bg-[#fafaf8] px-4 py-3.5 text-sm text-[#111111] outline-none focus:border-[#111111] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#555555]">
              Expiry date
            </label>

            <div className="relative">
              <CalendarDays
                size={16}
                strokeWidth={1.8}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
              />

              <input
                type="date"
                value={form.expires}
                onChange={(event) =>
                  onChange(
                    "expires",
                    event.target.value
                  )
                }
                className="w-full rounded-2xl border border-[var(--border)] bg-[#fafaf8] py-3.5 pl-11 pr-4 text-sm text-[#111111] outline-none focus:border-[#111111] focus:bg-white"
              />
            </div>
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

              <option value="Disabled">
                Disabled
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
                : editingCoupon
                  ? "Save changes"
                  : "Create coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDateForInput(
  value
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(
  value
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

