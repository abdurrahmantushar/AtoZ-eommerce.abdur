"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  Package,
  Truck,
  XCircle,
  Search,
  MapPin,
  CreditCard,
  CalendarDays,
  Phone,
  User,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusSteps = [
  {
    key: "pending",
    label: "Order Placed",
    description: "Your order has been placed successfully.",
    icon: Clock3,
  },
  {
    key: "processing",
    label: "Processing",
    description: "Your order is being prepared.",
    icon: Package,
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "Your order is on the way.",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Your order has been delivered.",
    icon: CheckCircle2,
  },
];

export default function TrackOrderPage() {
  const searchParams = useSearchParams();

  const [trackingCode, setTrackingCode] = useState(
    searchParams.get("tracking") || ""
  );
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trackOrder = async (e) => {
    e?.preventDefault();

    const code = trackingCode.trim();

    if (!code) {
      setError("Please enter your tracking code.");
      setOrder(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setOrder(null);

      const response = await fetch(
        `${API_URL}/api/orders/track/${encodeURIComponent(code)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Order not found.");
      }

      setOrder(result.data);
    } catch (err) {
      setError(err.message || "Unable to track this order.");
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = order?.orderStatus?.toLowerCase();

  const currentStatusIndex = statusSteps.findIndex(
    (step) => step.key === currentStatus
  );

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return `৳${Number(price || 0).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#f7faf4] text-[#111111]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f4df] text-[var(--primary)]">
            <Truck size={27} />
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Track Your Order
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
            Enter your order tracking code to check the current status of your
            order.
          </p>

          <form
            onSubmit={trackOrder}
            className="mt-8 rounded-[22px] border border-[var(--border)] bg-white p-3 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />

                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Enter tracking code"
                  className="h-12 w-full rounded-full border border-[var(--border)] bg-[#fafcf8] pl-11 pr-4 text-sm outline-none transition focus:border-[var(--primary)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-full bg-[var(--primary)] px-7 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Tracking..." : "Track Order"}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {order && (
          <div className="mx-auto mt-10 max-w-5xl space-y-6">
            <div className="rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs text-[var(--muted)]">
                    Tracking / Order Number
                  </p>

                  <h2 className="mt-1 break-all text-lg font-semibold">
                    {order.orderNumber}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-xs text-[var(--muted)]">
                    <CalendarDays size={14} />
                    <span>{formatDateTime(order.createdAt)}</span>
                  </div>
                </div>

                <div
                  className={`flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium capitalize ${
                    currentStatus === "cancelled"
                      ? "bg-red-50 text-red-600"
                      : "bg-[#eaf6e4] text-[var(--primary)]"
                  }`}
                >
                  {currentStatus === "cancelled" ? (
                    <XCircle size={17} />
                  ) : (
                    <Package size={17} />
                  )}

                  {currentStatus}
                </div>
              </div>
            </div>

            {currentStatus === "cancelled" ? (
              <div className="rounded-[24px] border border-red-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <XCircle size={32} />
                  </div>

                  <h2 className="mt-4 text-xl font-semibold">
                    Order Cancelled
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                    This order has been cancelled and will not be processed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-semibold">Order Status</h2>

                <div className="mt-8">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const completed = index <= currentStatusIndex;
                    const active = index === currentStatusIndex;
                    const isLast = index === statusSteps.length - 1;

                    return (
                      <div key={step.key} className="relative flex gap-4">
                        {!isLast && (
                          <div
                            className={`absolute left-[19px] top-10 h-[calc(100%-8px)] w-[2px] ${
                              index < currentStatusIndex
                                ? "bg-[var(--primary)]"
                                : "bg-[#e5e9e1]"
                            }`}
                          />
                        )}

                        <div
                          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                            completed
                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                              : "border-[#dfe5da] bg-white text-[#9aa39a]"
                          }`}
                        >
                          <Icon size={18} />
                        </div>

                        <div className="pb-8">
                          <p
                            className={`text-sm font-semibold ${
                              active
                                ? "text-[var(--primary)]"
                                : completed
                                  ? "text-[#111111]"
                                  : "text-[#8d958c]"
                            }`}
                          >
                            {step.label}
                          </p>

                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {active ? step.description : completed ? "Completed" : "Waiting"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center gap-2">
                  <Package size={19} className="text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Order Items</h2>
                </div>

                <div className="mt-5 divide-y divide-[var(--border)]">
                  {order.items?.map((item, index) => (
                    <div
                      key={`${item.product}-${index}`}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f4f7f1]">
                        <img
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-medium">
                          {item.name}
                        </h3>

                        <p className="mt-2 text-xs text-[var(--muted)]">
                          Quantity: {item.quantity}
                        </p>

                        {item.selectedColor && (
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            Color: {item.selectedColor}
                          </p>
                        )}

                        {item.selectedSize && (
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            Size: {item.selectedSize}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-[var(--border)] pt-5">
                  <div className="ml-auto max-w-sm space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-[var(--muted)]">Subtotal</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-[var(--muted)]">Shipping</span>
                      <span>{formatPrice(order.shippingCost)}</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-[var(--muted)]">Discount</span>
                      <span className="text-[var(--primary)]">
                        -{formatPrice(order.discount)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 border-t border-[var(--border)] pt-3 text-base font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard
                      size={19}
                      className="text-[var(--primary)]"
                    />
                    <h2 className="text-lg font-semibold">Payment</h2>
                  </div>

                  <div className="mt-5 space-y-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-[var(--muted)]">Method</span>

                      <span className="font-medium uppercase">
                        {order.paymentMethod || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-[var(--muted)]">Status</span>

                      <span
                        className={`font-medium capitalize ${
                          order.paymentStatus === "paid"
                            ? "text-[var(--primary)]"
                            : "text-[#b7791f]"
                        }`}
                      >
                        {order.paymentStatus || "Pending"}
                      </span>
                    </div>

                    {order.paymentTransactionId && (
                      <div>
                        <p className="text-xs text-[var(--muted)]">
                          Transaction ID
                        </p>

                        <p className="mt-1 break-all text-xs font-medium">
                          {order.paymentTransactionId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={19} className="text-[var(--primary)]" />
                    <h2 className="text-lg font-semibold">Shipping Address</h2>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex gap-3">
                      <User
                        size={16}
                        className="mt-1 shrink-0 text-[var(--muted)]"
                      />

                      <div>
                        <p className="font-medium">
                          {order.shippingAddress?.fullName}
                        </p>

                        <p className="mt-1 leading-6 text-[var(--muted)]">
                          {order.shippingAddress?.addressLine}
                          <br />
                          {order.shippingAddress?.city}
                          {order.shippingAddress?.postalCode
                            ? ` - ${order.shippingAddress.postalCode}`
                            : ""}
                          <br />
                          {order.shippingAddress?.country}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone
                        size={16}
                        className="shrink-0 text-[var(--muted)]"
                      />

                      <span className="text-[var(--muted)]">
                        {order.shippingAddress?.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#111111] p-6 text-white shadow-sm">
                  <p className="text-sm text-white/60">Order Total</p>

                  <p className="mt-2 text-2xl font-semibold">
                    {formatPrice(order.total)}
                  </p>

                  <p className="mt-2 text-xs text-white/50">
                    Order placed on {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-7 py-3.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}