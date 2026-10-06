"use client";

import {
  BriefcaseBusiness,
  Check,
  Edit3,
  Home,
  MapPin,
  Trash2,
} from "lucide-react";

export default function AddressCard({
  address = {
    id: "default-home",
    label: "Home",
    firstName: "Alex",
    lastName: "Taylor",
    phone: "+880 1700-000000",
    address: "123 Example Street",
    city: "Chattogram",
    postalCode: "4000",
    country: "Bangladesh",
    isDefault: true,
  },
  onEdit,
  onDelete,
  onSetDefault,
}) {
  const addressId =
    address?._id || address?.id;

  const isHome =
    address?.label?.toLowerCase() ===
    "home";

  return (
    <div
      className={`rounded-[28px] border bg-white p-5 transition ${
        address.isDefault
          ? "border-[#111111] shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
          : "border-[var(--border)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0f0ec]">
            {isHome ? (
              <Home
                size={19}
                strokeWidth={1.8}
              />
            ) : (
              <BriefcaseBusiness
                size={19}
                strokeWidth={1.8}
              />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[15px] font-semibold text-[#111111]">
                {address.label ||
                  "Address"}
              </h3>

              {address.isDefault && (
                <span className="rounded-full bg-[#111111] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                  Default
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Shipping address
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              onEdit?.(address)
            }
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#666] transition hover:bg-[#f0f0ec] hover:text-[#111111]"
            aria-label={`Edit ${
              address.label ||
              "address"
            }`}
          >
            <Edit3
              size={16}
              strokeWidth={1.8}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete?.(addressId)
            }
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#666] transition hover:bg-red-50 hover:text-red-500"
            aria-label={`Delete ${
              address.label ||
              "address"
            }`}
          >
            <Trash2
              size={16}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-[#f7f7f5] p-4">
        <div className="flex items-start gap-3">
          <MapPin
            size={17}
            strokeWidth={1.8}
            className="mt-0.5 shrink-0 text-[#777]"
          />

          <div className="space-y-1 text-sm leading-6">
            <p className="font-medium text-[#111111]">
              {address.firstName}{" "}
              {address.lastName}
            </p>

            <p className="text-[#666666]">
              {address.address}
            </p>

            <p className="text-[#666666]">
              {address.city},{" "}
              {address.postalCode}
            </p>

            <p className="text-[#666666]">
              {address.country}
            </p>

            <p className="pt-1 text-[#666666]">
              {address.phone}
            </p>
          </div>
        </div>
      </div>

      {!address.isDefault && (
        <button
          type="button"
          onClick={() =>
            onSetDefault?.(addressId)
          }
          className="mt-4 flex items-center gap-2 text-sm font-medium text-[#111111] transition hover:opacity-60"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)]">
            <Check
              size={13}
              strokeWidth={2}
            />
          </span>

          Set as default
        </button>
      )}
    </div>
  );
}
