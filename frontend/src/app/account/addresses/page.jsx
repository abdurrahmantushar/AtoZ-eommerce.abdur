"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
ArrowLeft,
BriefcaseBusiness,
Check,
Home,
MapPin,
Plus,
X,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AddressCard from "@/components/account/AddressCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const emptyForm = {
label: "Home",
firstName: "",
lastName: "",
phone: "",
address: "",
city: "",
postalCode: "",
country: "Bangladesh",
};

export default function AddressesPage() {
const [addresses, setAddresses] = useState([]);
const [showForm, setShowForm] = useState(false);
const [editingId, setEditingId] = useState(null);
const [form, setForm] = useState(emptyForm);

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [deletingId, setDeletingId] = useState(null);
const [defaultId, setDefaultId] = useState(null);

const [saved, setSaved] = useState(false);
const [error, setError] = useState("");

const normalizeAddress = (address) => ({
...address,
id: address.id || address._id,
});

const loadAddresses = async () => {
try {
setLoading(true);
setError("");

  const response = await fetch(`${API_URL}/api/addresses`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load addresses.");
  }

  const addressList =
    data?.addresses ||
    data?.data?.addresses ||
    data?.data ||
    [];

  setAddresses(
    Array.isArray(addressList)
      ? addressList.map(normalizeAddress)
      : []
  );
} catch (err) {
  setError(err.message || "Failed to load addresses.");
  setAddresses([]);
} finally {
  setLoading(false);
}


};

useEffect(() => {
loadAddresses();
}, []);

const openAddForm = () => {
setEditingId(null);
setForm(emptyForm);
setShowForm(true);
setSaved(false);
setError("");
};

const openEditForm = (address) => {
const addressId = address.id || address._id;


setEditingId(addressId);

setForm({
  label: address.label || "Home",
  firstName: address.firstName || "",
  lastName: address.lastName || "",
  phone: address.phone || "",
  address: address.address || "",
  city: address.city || "",
  postalCode: address.postalCode || "",
  country: address.country || "Bangladesh",
});

setShowForm(true);
setSaved(false);
setError("");


};

const closeForm = () => {
if (saving) return;

setShowForm(false);
setEditingId(null);
setForm(emptyForm);
setSaved(false);
setError("");


};

const updateField = (field, value) => {
setForm((prev) => ({
...prev,
[field]: value,
}));
};

const handleSubmit = async (event) => {
event.preventDefault();

if (
  !form.firstName.trim() ||
  !form.lastName.trim() ||
  !form.phone.trim() ||
  !form.address.trim() ||
  !form.city.trim() ||
  !form.postalCode.trim()
) {
  setError("Please fill in all required fields.");
  return;
}

try {
  setSaving(true);
  setError("");
  setSaved(false);

  const isEditing = Boolean(editingId);

  const response = await fetch(
    isEditing
      ? `${API_URL}/api/addresses/${editingId}`
      : `${API_URL}/api/addresses`,
    {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(form),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        (isEditing
          ? "Failed to update address."
          : "Failed to save address.")
    );
  }

  await loadAddresses();

  setSaved(true);

  setTimeout(() => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setSaved(false);
  }, 700);
} catch (err) {
  setError(err.message || "Something went wrong.");
} finally {
  setSaving(false);
}


};

const handleDelete = async (id) => {
if (!id) return;


const confirmed = window.confirm(
  "Are you sure you want to delete this address?"
);

if (!confirmed) return;

try {
  setDeletingId(id);
  setError("");

  const response = await fetch(`${API_URL}/api/addresses/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to delete address.");
  }

  await loadAddresses();
} catch (err) {
  setError(err.message || "Failed to delete address.");
} finally {
  setDeletingId(null);
}
};

const handleSetDefault = async (id) => {
if (!id) return;


try {
  setDefaultId(id);
  setError("");

  const response = await fetch(
    `${API_URL}/api/addresses/${id}/default`,
    {
      method: "PATCH",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to set default address."
    );
  }

  await loadAddresses();
} catch (err) {
  setError(err.message || "Failed to set default address.");
} finally {
  setDefaultId(null);
}


};

return (
<> <Header />


  <main className="min-h-screen bg-[var(--background)]">
    <section className="container-main section-space">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/account"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#666666] transition hover:text-[#111111]"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Back to account
        </Link>

        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999991]">
              Account
            </span>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-5xl">
              Addresses
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
              Manage your saved shipping addresses and choose your default
              delivery location.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#252525]"
          >
            <Plus size={17} strokeWidth={1.9} />
            Add new address
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            {loading ? (
              <div className="grid gap-5 md:grid-cols-2">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-[240px] animate-pulse rounded-[28px] border border-[var(--border)] bg-white"
                  />
                ))}
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {addresses.map((address) => (
                  <div
                    key={address.id || address._id}
                    className="relative"
                  >
                    <AddressCard
                      address={address}
                      onEdit={openEditForm}
                      onDelete={handleDelete}
                      onSetDefault={handleSetDefault}
                    />

                    {deletingId === (address.id || address._id) && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-white/70 text-sm font-medium text-[#111111]">
                        Deleting...
                      </div>
                    )}

                    {defaultId === (address.id || address._id) && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-white/70 text-sm font-medium text-[#111111]">
                        Updating default...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f0ec]">
                  <MapPin size={24} strokeWidth={1.7} />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-[#111111]">
                  No saved addresses
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                  Add a shipping address so checkout becomes faster and
                  easier.
                </p>

                <button
                  type="button"
                  onClick={openAddForm}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white"
                >
                  <Plus size={17} strokeWidth={1.9} />
                  Add address
                </button>
              </div>
            )}
          </div>

          {showForm ? (
            <div className="h-fit rounded-[28px] border border-[var(--border)] bg-white p-6 lg:sticky lg:top-28">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#999991]">
                    {editingId ? "Edit address" : "New address"}
                  </span>

                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#111111]">
                    {editingId ? "Update address" : "Add an address"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f2] text-[#666] transition hover:bg-[#ecece7] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Close address form"
                >
                  <X size={17} strokeWidth={1.8} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-medium text-[#555]">
                    Address type
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        value: "Home",
                        icon: Home,
                      },
                      {
                        value: "Office",
                        icon: BriefcaseBusiness,
                      },
                    ].map(({ value, icon: Icon }) => {
                      const active = form.label === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateField("label", value)}
                          className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm transition ${
                            active
                              ? "border-[#111111] bg-[#111111] text-white"
                              : "border-[var(--border)] bg-white text-[#555] hover:border-[#bbb]"
                          }`}
                        >
                          <Icon size={16} strokeWidth={1.8} />
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="First name"
                    value={form.firstName}
                    onChange={(value) =>
                      updateField("firstName", value)
                    }
                    placeholder="Alex"
                  />

                  <Field
                    label="Last name"
                    value={form.lastName}
                    onChange={(value) =>
                      updateField("lastName", value)
                    }
                    placeholder="Taylor"
                  />
                </div>

                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="+880 1700-000000"
                />

                <Field
                  label="Street address"
                  value={form.address}
                  onChange={(value) => updateField("address", value)}
                  placeholder="123 Example Street"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="City"
                    value={form.city}
                    onChange={(value) => updateField("city", value)}
                    placeholder="Chattogram"
                  />

                  <Field
                    label="Postal code"
                    value={form.postalCode}
                    onChange={(value) =>
                      updateField("postalCode", value)
                    }
                    placeholder="4000"
                  />
                </div>

                <Field
                  label="Country"
                  value={form.country}
                  onChange={(value) => updateField("country", value)}
                  placeholder="Bangladesh"
                />

                <button
                  type="submit"
                  disabled={saving || saved}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#252525] disabled:cursor-default disabled:opacity-80"
                >
                  {saved ? (
                    <>
                      <Check size={17} strokeWidth={2} />
                      Saved
                    </>
                  ) : saving ? (
                    "Saving..."
                  ) : editingId ? (
                    "Update address"
                  ) : (
                    "Save address"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="h-fit rounded-[28px] bg-[#111111] p-7 text-white lg:sticky lg:top-28">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <MapPin size={21} strokeWidth={1.8} />
              </div>

              <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">
                Keep checkout simple.
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/60">
                Save your frequently used delivery locations and select
                your default address whenever you need it.
              </p>

              <button
                type="button"
                onClick={openAddForm}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium !text-[#111111] transition hover:bg-[#f0f0ec]"
              >
                <Plus size={17} strokeWidth={1.9} />
                Add address
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  </main>

  <Footer />
</>


);
}

function Field({ label, value, onChange, placeholder }) {
return ( <div> <label className="mb-2 block text-xs font-medium text-[#555]">
{label} </label>


  <input
    type="text"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    className="w-full rounded-2xl border border-[var(--border)] bg-[#fafaf8] px-4 py-3 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111] focus:bg-white"
  />
</div>


);
}
