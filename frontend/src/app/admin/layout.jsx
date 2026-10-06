"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader onMenuClick={() => setMobileOpen(true)} />

          <main className="flex-1">{children}</main>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation"
          />

          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-white">
            <div className="flex h-20 items-center justify-between border-b border-[var(--border)] px-6">
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-semibold tracking-[-0.05em] text-[#111111]"
              >
                AtoZ
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0ec]"
                aria-label="Close navigation"
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="overflow-y-auto p-4">
              <AdminMobileNav
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </aside>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
}

function AdminMobileNav({ onNavigate }) {
  const items = [
    ["Overview", "/admin"],
    ["Products", "/admin/products"],
    ["Categories", "/admin/categories"],
    ["Orders", "/admin/orders"],
    ["Customers", "/admin/customers"],
    ["Reviews", "/admin/reviews"],
    ["Coupons", "/admin/coupons"],
    ["Analytics", "/admin/analytics"],
    ["Hero Settings", "/admin/dashboard/hero"],
    ["Settings", "/admin/settings"],
  ];

  return (
    <nav className="space-y-1">
      {items.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className="block rounded-xl px-3 py-3 text-sm text-[#555] transition hover:bg-[#f4f4f1] hover:text-[#111111]"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}