"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
ArrowLeft,
Check,
Clock3,
CreditCard,
MapPin,
Package,
Truck,
XCircle,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusLabels = {
pending: "Pending",
processing: "Processing",
shipped: "Shipped",
delivered: "Delivered",
cancelled: "Cancelled",
};

const paymentLabels = {
pending: "Payment pending",
pending_verification: "Verification pending",
paid: "Paid",
failed: "Payment failed",
refunded: "Refunded",
};

const formatDate = (date) => {
if (!date) return "Date unavailable";

const parsedDate = new Date(date);

if (Number.isNaN(parsedDate.getTime())) {
return "Date unavailable";
}

return parsedDate.toLocaleDateString("en-US", {
month: "long",
day: "numeric",
year: "numeric",
});
};

const paymentMethodLabels = {
cod: "Cash on Delivery",
stripe: "Card / Stripe",
bkash: "bKash",
nagad: "Nagad",
};

export default function OrderDetailsPage() {
const params = useParams();
const id = params?.id;

const [order, setOrder] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
if (!id) return;

const loadOrder = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(`${API_URL}/api/orders/${id}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || "Failed to load order details."
      );
    }

    const backendOrder =
      data?.order ||
      data?.data?.order ||
      data?.data ||
      null;

    if (!backendOrder) {
      throw new Error("Order not found.");
    }

    setOrder(backendOrder);
  } catch (err) {
    setError(err.message || "Failed to load order details.");
    setOrder(null);
  } finally {
    setLoading(false);
  }
};

loadOrder();

}, [id]);

if (loading) {
return (
<> <Header />

    <main className="min-h-screen bg-[var(--background)]">
      <section className="container-main py-10 sm:py-14 lg:py-16">
        <div className="h-5 w-28 animate-pulse rounded bg-[#e9e9e4]" />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="h-[360px] animate-pulse rounded-[24px] bg-white" />
            <div className="h-[420px] animate-pulse rounded-[24px] bg-white" />
            <div className="h-[260px] animate-pulse rounded-[24px] bg-white" />
          </div>

          <div className="space-y-5">
            <div className="h-[270px] animate-pulse rounded-[24px] bg-[#111111]" />
            <div className="h-[100px] animate-pulse rounded-[24px] bg-white" />
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </>
);

}

if (!order) {
return (
<> <Header />

    <main className="min-h-[70vh] bg-[var(--background)]">
      <section className="container-main flex min-h-[70vh] items-center justify-center py-20">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Order
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
            Order not found
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">
            {error || "We could not find an order with this ID."}
          </p>

          <Link
            href="/account/orders"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-3.5 text-sm font-medium !text-white"
          >
            <ArrowLeft size={15} />
            Back to orders
          </Link>
        </div>
      </section>
    </main>

    <Footer />
  </>
);

}

const orderNumber = order.orderNumber || order._id;

const items = Array.isArray(order.items)
? order.items
: [];

const subtotal =
Number(order.subtotal) ||
items.reduce(
(total, item) =>
total +
Number(item.price || 0) * Number(item.quantity || 0),
0
);

const shipping = Number(order.shippingCost) || 0;
const discount = Number(order.discount) || 0;

const total =
Number(order.total) ||
subtotal + shipping - discount;

const status = statusLabels[order.orderStatus] || "Pending";
const payment =
paymentLabels[order.paymentStatus] || "Payment pending";

const paymentMethod =
paymentMethodLabels[order.paymentMethod] ||
order.paymentMethod ||
"Payment method unavailable";

const shippingAddress = order.shippingAddress || {};

return (
<> <Header />

  <main className="min-h-screen bg-[var(--background)]">
    <section className="container-main py-10 sm:py-14 lg:py-16">
      <Link
        href="/account/orders"
        className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
      >
        <ArrowLeft
          size={16}
          strokeWidth={1.8}
          className="transition-transform duration-300 group-hover:-translate-x-1"
        />

        Back to orders
      </Link>

      <div className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Order details
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
            {orderNumber}
          </h1>

          <p className="mt-3 text-sm text-[var(--muted)]">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <OrderStatusBadge status={order.orderStatus} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <OrderTimeline status={order.orderStatus} />

          <section className="rounded-[24px] bg-white p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecece7]">
                <Package size={18} strokeWidth={1.7} />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Items
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Products in this order
                </h2>
              </div>
            </div>

            <div className="mt-6 divide-y divide-[var(--border)]">
              {items.length > 0 ? (
                items.map((item, index) => {
                  const itemTotal =
                    Number(item.price || 0) *
                    Number(item.quantity || 0);

                  return (
                    <div
                      key={`${item.product || item._id || index}`}
                      className="flex gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#ecece7]">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name || "Product"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package
                              size={22}
                              strokeWidth={1.5}
                              className="text-[#999999]"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">
                          Product
                        </p>

                        <h3 className="mt-1 text-sm font-semibold sm:text-base">
                          {item.name || "Product"}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                          {item.selectedColor && (
                            <span>
                              Color: {item.selectedColor}
                            </span>
                          )}

                          {item.selectedSize && (
                            <span>
                              Size: {item.selectedSize}
                            </span>
                          )}

                          <span>
                            Qty: {item.quantity || 0}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold">
                          ${itemTotal.toFixed(2)}
                        </p>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                          $
                          {Number(item.price || 0).toFixed(2)}
                          {" "}each
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="py-5 text-sm text-[var(--muted)]">
                  No products found in this order.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[24px] bg-white p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecece7]">
                <MapPin size={18} strokeWidth={1.7} />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Delivery
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Shipping address
                </h2>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#f7f7f5] p-5">
              <p className="text-sm font-semibold">
                {shippingAddress.name ||
                  [
                    shippingAddress.firstName,
                    shippingAddress.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                  "Customer"}
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {shippingAddress.address ||
                  shippingAddress.line1 ||
                  "Address unavailable"}
                <br />
                {shippingAddress.city || ""}
                {shippingAddress.postalCode
                  ? ` ${shippingAddress.postalCode}`
                  : ""}
                <br />
                {shippingAddress.country || ""}
              </p>

              {shippingAddress.phone && (
                <p className="mt-3 text-xs text-[var(--muted)]">
                  {shippingAddress.phone}
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-5 lg:sticky lg:top-28">
          <section className="rounded-[24px] bg-[#111111] p-6 text-white sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Payment
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Order summary
            </h2>

            <div className="mt-6 space-y-4 border-b border-white/10 pb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-white/45">
                  Subtotal
                </span>

                <span>${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/45">
                    Discount
                  </span>

                  <span className="text-[#b9d88a]">
                    -${discount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-white/45">
                  Shipping
                </span>

                <span>
                  {shipping === 0
                    ? "Free"
                    : `$${shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-white/45">
                Total
              </span>

              <span className="text-2xl font-semibold">
                ${total.toFixed(2)}
              </span>
            </div>
          </section>

          <section className="rounded-[24px] bg-white p-6">
            <div className="flex items-start gap-3">
              <CreditCard
                size={18}
                strokeWidth={1.7}
                className="mt-0.5"
              />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Payment method
                </p>

                <p className="mt-1 text-sm font-medium">
                  {paymentMethod}
                </p>

                <p className="mt-2 text-xs text-[var(--muted)]">
                  {payment}
                </p>

                {order.paymentTransactionId && (
                  <p className="mt-2 break-all text-[11px] text-[var(--muted)]">
                    Transaction:{" "}
                    {order.paymentTransactionId}
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="rounded-[24px] border border-[var(--border)] bg-white p-6">
            <div className="flex gap-3">
              <Clock3
                size={18}
                strokeWidth={1.7}
                className="mt-0.5 shrink-0"
              />

              <p className="text-xs leading-5 text-[var(--muted)]">
                Your order status is updated automatically from the
                store backend. New tracking information will appear
                here when available.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </main>

  <Footer />
</>

);
}

function OrderStatusBadge({ status }) {
const styles = {
pending: "bg-[#f4efe1] text-[#80682c]",
processing: "bg-[#eef1e8] text-[#63734c]",
shipped: "bg-[#e9eef8] text-[#48628c]",
delivered: "bg-[#e6f3dd] text-[#48752f]",
cancelled: "bg-[#f4e4e4] text-[#8b3d3d]",
};

return (
<span
className={`inline-flex w-fit rounded-full px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        styles[status] || "bg-[#eeeeea] text-[#555555]"
      }`}
>
{statusLabels[status] || "Pending"} </span>
);
}

function OrderTimeline({ status }) {
const isCancelled = status === "cancelled";

if (isCancelled) {
return ( <section className="rounded-[24px] bg-white p-6 sm:p-7"> <div className="flex items-center gap-3"> <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e4e4]"> <XCircle
           size={18}
           strokeWidth={1.7}
           className="text-[#8b3d3d]"
         /> </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Order status
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          Order cancelled
        </h2>
      </div>
    </div>

    <p className="mt-6 text-sm leading-6 text-[var(--muted)]">
      This order has been cancelled. Any eligible payment
      refund or stock restoration is handled by the backend.
    </p>
  </section>
);

}

const steps = [
{
id: "placed",
label: "Order placed",
description: "Your order has been received.",
icon: Check,
completed: true,
},
{
id: "processing",
label: "Processing",
description: "Your order is being prepared.",
icon: Package,
completed: ["processing", "shipped", "delivered"].includes(
status
),
},
{
id: "shipped",
label: "Shipped",
description: "Your order is on the way.",
icon: Truck,
completed: ["shipped", "delivered"].includes(status),
},
{
id: "delivered",
label: "Delivered",
description: "Your order has arrived.",
icon: Check,
completed: status === "delivered",
},
];

return ( <section className="rounded-[24px] bg-white p-6 sm:p-7"> <div className="flex items-center gap-3"> <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecece7]"> <Truck size={18} strokeWidth={1.7} /> </div>


    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        Delivery progress
      </p>

      <h2 className="mt-1 text-xl font-semibold">
        Track your order
      </h2>
    </div>
  </div>

  <div className="mt-8 space-y-6">
    {steps.map((step, index) => {
      const Icon = step.icon;
      const isLast = index === steps.length - 1;

      return (
        <div
          key={step.id}
          className="relative flex gap-4"
        >
          {!isLast && (
            <span
              className={`absolute left-[19px] top-10 h-[calc(100%+8px)] w-px ${
                step.completed &&
                steps[index + 1]?.completed
                  ? "bg-[#111111]"
                  : "bg-[var(--border)]"
              }`}
            />
          )}

          <div
            className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
              step.completed
                ? "border-[#111111] bg-[#111111] !text-white"
                : "border-[var(--border)] bg-white text-[var(--muted)]"
            }`}
          >
            <Icon size={16} strokeWidth={1.8} />
          </div>

          <div className="pt-1">
            <h3
              className={`text-sm font-semibold ${
                step.completed
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {step.label}
            </h3>

            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              {step.description}
            </p>
          </div>
        </div>
      );
    })}
  </div>
</section>


);
}
