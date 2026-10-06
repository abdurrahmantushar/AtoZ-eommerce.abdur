
"use client";

import Link from "next/link";
import { CheckCircle2, TicketPercent ,ChevronDown, Check } from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AddressForm from "@/components/checkout/AddressForm";
import ShippingMethod from "@/components/checkout/ShippingMethod";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";

import useCart from "@/hooks/useCart";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [activeCoupons, setActiveCoupons] = useState([]);

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Bangladesh",
  });

  const [shipping, setShipping] =
    useState("standard");

  const [payment, setPayment] =
    useState("card");

  const [couponCode, setCouponCode] =
    useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState(null);

  const [couponMessage, setCouponMessage] =
    useState("");

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [orderPlaced, setOrderPlaced] =
    useState(false);

  const [createdOrder, setCreatedOrder] =
    useState(null);

  const [orderError, setOrderError] =
    useState("");

  const shippingCost = useMemo(() => {
    return shipping === "express" ? 12 : 0;
  }, [shipping]);

  const discount = useMemo(() => {
    return appliedCoupon?.discount || 0;
  }, [appliedCoupon]);

  const orderTotal = useMemo(() => {
    return Math.max(
      subtotal + shippingCost - discount,
      0
    );
  }, [subtotal, shippingCost, discount]);

  const getBackendPaymentMethod = () => {
    const paymentMap = {
      card: "stripe",
      stripe: "stripe",
      bkash: "bkash",
      nagad: "nagad",
      cod: "cod",
      cash: "cod",
    };

    return (
      paymentMap[payment] || payment
    );
  };

  const findOrCreateAddress = async () => {
    const fullName =
      `${address.firstName} ${address.lastName}`
        .trim();

    if (
      !address.firstName.trim() ||
      !address.lastName.trim() ||
      !address.phone.trim() ||
      !address.address.trim() ||
      !address.city.trim()
    ) {
      throw new Error(
        "Please complete all required address fields."
      );
    }

    const existingResponse = await fetch(
      `${API_URL}/api/addresses`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!existingResponse.ok) {
      if (existingResponse.status === 401) {
        throw new Error(
          "Please login before placing your order."
        );
      }

      throw new Error(
        "Unable to load your addresses."
      );
    }

    const existingResult =
      await existingResponse.json();

    const existingAddresses =
      existingResult.data || [];

    const existingAddress =
      existingAddresses.find(
        (item) =>
          item.fullName === fullName &&
          item.phone === address.phone.trim() &&
          item.addressLine === address.address.trim() &&
          item.city === address.city.trim() &&
          (item.postalCode || "") ===
            address.postalCode.trim() &&
          (item.country || "Bangladesh") ===
            address.country
      );

    if (existingAddress) {
      return existingAddress._id;
    }

    const createResponse = await fetch(
      `${API_URL}/api/addresses`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phone: address.phone.trim(),
          addressLine:
            address.address.trim(),
          city: address.city.trim(),
          postalCode:
            address.postalCode.trim(),
          country:
            address.country || "Bangladesh",
          isDefault:
            existingAddresses.length === 0,
        }),
      }
    );

    const createResult =
      await createResponse.json();

    if (!createResponse.ok) {
      throw new Error(
        createResult.message ||
          "Failed to save shipping address."
      );
    }

    return createResult.data._id;
  };

  const handleApplyCoupon = async () => {
    const code =
      couponCode.trim().toUpperCase();

    if (!code) {
      setCouponMessage(
        "Enter a coupon code."
      );
      return;
    }

    try {
      setCouponMessage(
        "Checking coupon..."
      );

const response = await fetch(
  `${API_URL}/api/coupons/validate`,
  {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      orderAmount: subtotal,
    }),
  }
);

      const result =
        await response.json();

      if (!response.ok) {
        setAppliedCoupon(null);
        setCouponMessage(
          result.message ||
            "Invalid coupon code."
        );
        return;
      }

      setAppliedCoupon({
        ...result.data,
        discount:
          Number(result.data.discount) || 0,
      });

      setCouponMessage(
        `${result.data.code} applied successfully.`
      );
    } catch (error) {
      console.error(
        "Coupon validation error:",
        error
      );

      setAppliedCoupon(null);
      setCouponMessage(
        "Unable to validate coupon."
      );
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("");
  };

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);
      setOrderError("");

      const addressId =
        await findOrCreateAddress();

      const backendPaymentMethod =
        getBackendPaymentMethod();

      const response = await fetch(
        `${API_URL}/api/orders`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
body: JSON.stringify({
  items: items.map((item) => ({
    productId: item.id,
    quantity: Number(item.quantity),
    selectedColor: item.selectedColor || "",
    selectedSize: item.selectedSize || "",
  })),
  addressId,
  shippingMethod: shipping,
  paymentMethod: backendPaymentMethod,
  couponCode: appliedCoupon?.code || "",
}),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to place order."
        );
      }

      setCreatedOrder(result.data);

      clearCart();

      setOrderPlaced(true);
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      setOrderError(
        error.message ||
          "Something went wrong while placing your order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

useEffect(() => {
  const fetchActiveCoupons = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/coupons/active`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error(
          "Active coupons error:",
          result.message || "Failed to fetch coupons."
        );
        return;
      }

      setActiveCoupons(result.data || []);
    } catch (error) {
      console.error(
        "Active coupon fetch error:",
        error
      );
    }
  };

  fetchActiveCoupons();
}, []);

  if (orderPlaced) {
    return (
      <>
        <Header />

        <main className="min-h-[70vh] bg-[var(--background)]">
          <section className="container-main flex min-h-[70vh] items-center justify-center py-20">
            <div className="max-w-lg text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#111111] text-white">
                <CheckCircle2
                  size={30}
                  strokeWidth={1.8}
                />
              </div>

              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Order confirmed
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                Thanks for your order.
              </h1>

              {createdOrder && (
                <div className="mt-5 rounded-[20px] bg-white px-5 py-4 text-sm">
                  <p className="text-[var(--muted)]">
                    Order number
                  </p>

                  <p className="mt-1 font-semibold text-[#111111]">
                    {createdOrder.orderNumber}
                  </p>

                  <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                    <span>
                      Payment:
                    </span>

                    <span className="font-medium">
                      {createdOrder.paymentMethod}
                    </span>

                    <span className="text-[var(--muted)]">
                      •
                    </span>

                    <span>
                      {createdOrder.paymentStatus}
                    </span>
                  </div>
                </div>
              )}

              <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
                Your order has been received
                successfully.
              </p>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href={`/track-order?tracking=${createdOrder?.orderNumber || ""}`}
                  className="inline-flex items-center justify-center rounded-full bg-[#111111] px-6 py-3.5 text-sm font-medium !text-white transition hover:opacity-80"
                >
                  Track Order
                </Link>

                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-6 py-3.5 text-sm font-medium text-[#111111] transition hover:bg-[#f5f5f2]"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header />

        <main className="min-h-[70vh] bg-[var(--background)]">
          <section className="container-main flex min-h-[70vh] items-center justify-center py-20">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Checkout
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
                Your cart is empty
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">
                Add some products before continuing
                to checkout.
              </p>

              <Link
                href="/products"
                className="mt-7 inline-flex rounded-full bg-[#111111] px-6 py-3.5 text-sm font-medium !text-white transition hover:opacity-80"
              >
                Explore products
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[var(--background)]">
        <section className="container-main py-10 sm:py-14 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Secure checkout
            </p>

            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">
              Checkout
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Complete your details below to place
              your order.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
            <div className="space-y-5">
              <AddressForm
                address={address}
                setAddress={setAddress}
              />

              <ShippingMethod
                selected={shipping}
                setSelected={setShipping}
              />

              <PaymentMethod
                selected={payment}
                setSelected={setPayment}
              />

              <CouponBox
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                appliedCoupon={appliedCoupon}
                couponMessage={couponMessage}
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
                activeCoupons={activeCoupons}
              />

              {orderError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {orderError}
                </div>
              )}
            </div>

            <CheckoutSummary
              items={items}
              subtotal={subtotal}
              shippingCost={shippingCost}
              discount={discount}
              total={orderTotal}
              onPlaceOrder={handlePlaceOrder}
              placingOrder={placingOrder}
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}


function CouponBox({
  couponCode,
  setCouponCode,
  appliedCoupon,
  couponMessage,
  onApply,
  onRemove,
  activeCoupons,
}) {
  const [showCoupons, setShowCoupons] = useState(false);

  const handleSelectCoupon = (coupon) => {
    setCouponCode(coupon.code);
    setShowCoupons(false);
  };

  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-white p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f0ec]">
          <TicketPercent
            size={17}
            strokeWidth={1.8}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#111111]">
            Have a coupon?
          </h3>

          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Apply a discount code before placing your order.
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            value={couponCode}
            onChange={(event) =>
              setCouponCode(event.target.value.toUpperCase())
            }
            placeholder="Enter coupon code"
            disabled={!!appliedCoupon}
            className="w-full rounded-2xl border border-[var(--border)] bg-[#fafaf8] px-4 py-3 pr-12 text-sm uppercase tracking-[0.03em] text-[#111111] outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-[#aaa] focus:border-[#111111] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          />

          {!appliedCoupon && activeCoupons?.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowCoupons((prev) => !prev)}
                className={`absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition ${
                  showCoupons
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <ChevronDown
                  size={17}
                  className={`transition-transform duration-200 ${
                    showCoupons ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showCoupons && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)]">
                  <div className="border-b border-[var(--border)] bg-[#fafaf8] px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Active Coupons
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Select a coupon to use
                    </p>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-2">
                    {activeCoupons.map((coupon) => (
                      <button
                        key={coupon._id}
                        type="button"
                        onClick={() => handleSelectCoupon(coupon)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-[#f5f7ef]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-[#111111]">
                              {coupon.code}
                            </p>

                            {couponCode === coupon.code && (
                              <Check
                                size={14}
                                className="text-[#60703f]"
                              />
                            )}
                          </div>

                          <p className="mt-1 text-[10px] text-gray-400">
                            {coupon.type === "percentage"
                              ? `${coupon.value}% OFF`
                              : `$${coupon.value} OFF`}
                          </p>
                        </div>

                        <span className="ml-3 shrink-0 rounded-lg bg-[#eef4e5] px-2.5 py-1.5 text-[9px] font-bold text-[#60703f]">
                          Use
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {appliedCoupon ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-2xl bg-[#f0f0ec] px-4 py-3 text-sm font-medium text-[#111111] transition hover:bg-[#e8e8e3]"
          >
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={onApply}
            className="rounded-2xl bg-[#111111] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#252525]"
          >
            Apply
          </button>
        )}
      </div>

      {couponMessage && (
        <p
          className={`mt-3 text-xs ${
            appliedCoupon ? "text-[#60703f]" : "text-red-500"
          }`}
        >
          {couponMessage}
        </p>
      )}

      {appliedCoupon && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#eef4e5] px-4 py-3">
          <div>
            <p className="text-xs font-semibold text-[#60703f]">
              {appliedCoupon.code}
            </p>

            <p className="mt-0.5 text-[10px] text-[#71834b]">
              Discount applied
            </p>
          </div>

          <span className="text-sm font-semibold text-[#60703f]">
            {appliedCoupon.type === "percentage"
              ? `${appliedCoupon.value}% OFF`
              : `$${appliedCoupon.value} OFF`}
          </span>
        </div>
      )}
    </div>
  );
}


