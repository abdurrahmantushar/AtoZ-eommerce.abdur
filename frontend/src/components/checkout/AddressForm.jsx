"use client";

export default function AddressForm({ address, setAddress }) {
  const updateField = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="rounded-[24px] bg-white p-6 sm:p-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Step 01
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
          Delivery address
        </h2>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input
          label="First name"
          value={address.firstName}
          onChange={(e) =>
            updateField("firstName", e.target.value)
          }
        />

        <Input
          label="Last name"
          value={address.lastName}
          onChange={(e) =>
            updateField("lastName", e.target.value)
          }
        />

        <Input
          label="Email"
          type="email"
          value={address.email}
          onChange={(e) =>
            updateField("email", e.target.value)
          }
        />

        <Input
          label="Phone"
          type="tel"
          value={address.phone}
          onChange={(e) =>
            updateField("phone", e.target.value)
          }
        />

        <div className="sm:col-span-2">
          <Input
            label="Street address"
            value={address.address}
            onChange={(e) =>
              updateField("address", e.target.value)
            }
          />
        </div>

        <Input
          label="City"
          value={address.city}
          onChange={(e) =>
            updateField("city", e.target.value)
          }
        />

        <Input
          label="Postal code"
          value={address.postalCode}
          onChange={(e) =>
            updateField("postalCode", e.target.value)
          }
        />

        <div className="sm:col-span-2">
          <label className="text-xs font-medium">
            Country
          </label>

          <select
            value={address.country}
            onChange={(e) =>
              updateField("country", e.target.value)
            }
            className="mt-2 h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm outline-none transition focus:border-[#111111]"
          >
            <option value="Bangladesh">Bangladesh</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  type = "text",
  value,
  onChange,
}) {
  return (
    <label>
      <span className="text-xs font-medium">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={onChange}
        className="mt-2 h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm outline-none transition focus:border-[#111111]"
      />
    </label>
  );
}