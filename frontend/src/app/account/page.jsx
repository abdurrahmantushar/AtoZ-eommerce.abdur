"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";
import ProfileOverview from "@/components/account/ProfileOverview";
import RecentOrders from "@/components/account/RecentOrders";
import AddressCard from "@/components/account/AddressCard";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AccountPage() {
const router = useRouter();

const {
data: session,
isPending,
} = authClient.useSession();

const [defaultAddress, setDefaultAddress] = useState(null);
const [addressLoading, setAddressLoading] = useState(true);

useEffect(() => {
if (!session) {
setDefaultAddress(null);
setAddressLoading(false);
return;
}


const loadDefaultAddress = async () => {
  try {
    setAddressLoading(true);

    const response = await fetch(
      `${API_URL}/api/addresses`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || "Failed to load address."
      );
    }

    const addressList =
      data?.addresses ||
      data?.data?.addresses ||
      data?.data ||
      [];

    const addresses = Array.isArray(addressList)
      ? addressList
      : [];

    const activeDefault =
      addresses.find(
        (address) => address.isDefault
      ) || addresses[0] || null;

    setDefaultAddress(activeDefault);
  } catch (error) {
    console.error(
      "Account address loading error:",
      error
    );

    setDefaultAddress(null);
  } finally {
    setAddressLoading(false);
  }
};

loadDefaultAddress();


}, [session]);

if (isPending) {
return (
<> <Header />


    <main className="min-h-screen bg-[var(--background)]">
      <section className="container-main py-10 sm:py-14 lg:py-16">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-sm text-[var(--muted)]">
            Loading account...
          </p>
        </div>
      </section>
    </main>

    <Footer />
  </>
);


}

if (!session) {
return (
<> <Header />

    <main className="min-h-screen bg-[var(--background)]">
      <section className="container-main py-10 sm:py-14 lg:py-16">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-[var(--muted)]">
              Please sign in to view your account.
            </p>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </>
);


}

const firstName =
session.user.name?.trim().split(/\s+/)[0] ||
"there";

const openAddresses = () => {
router.push("/account/addresses");
};

return (
<> <Header />


  <main className="min-h-screen bg-[var(--background)]">
    <section className="container-main py-10 sm:py-14 lg:py-16">
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
          My account
        </p>

        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">
          Welcome back, {firstName}.
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
          Manage your profile, orders, saved products and delivery
          information.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[240px_1fr]">
        <AccountSidebar />

        <div className="space-y-5">
          <ProfileOverview />

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <RecentOrders />

            {addressLoading ? (
              <div className="h-fit min-h-[260px] animate-pulse rounded-[24px] bg-white" />
            ) : defaultAddress ? (
              <AddressCard
                address={defaultAddress}
                onEdit={openAddresses}
                onDelete={openAddresses}
                onSetDefault={openAddresses}
              />
            ) : (
              <div className="rounded-[24px] bg-white p-6 sm:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Delivery
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                  No saved address
                </h2>

                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Add a shipping address to make checkout faster and
                  easier.
                </p>

                <button
                  type="button"
                  onClick={openAddresses}
                  className="mt-5 rounded-full bg-[#111111] px-5 py-3 text-xs font-medium !text-white transition hover:bg-[#252525]"
                >
                  Add address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  </main>

  <Footer />
</>


);
}
