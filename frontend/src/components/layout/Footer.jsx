import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import Logo from "../common/Logo";

const shopLinks = [
  { label: "All Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "Best Sellers", href: "/products?sort=best-selling" },
  { label: "Deals", href: "/products?discount=true" },
];

const customerLinks = [
  { label: "My Account", href: "/account" },
  { label: "My Orders", href: "/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Shipping & Delivery", href: "/shipping" },
  { label: "Returns & Refunds", href: "/returns" },
];

const companyLinks = [
  { label: "About AtoZ", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="container-main py-14 sm:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10">
          <div>
            <Logo />

            <p className="mt-6 max-w-sm text-sm leading-6 text-white/45">
              A modern marketplace for everyday products, thoughtful finds and
              everything in between.
            </p>

            <Link
              href="/products"
              className="group mt-7 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-medium !text-[#111111] transition hover:bg-[#dfff00]"
            >
              Start shopping

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight size={15} strokeWidth={2} />
              </span>
            </Link>

            <div className="mt-8 flex items-center gap-2">
            <SocialLink
            href="#"
            label="Facebook"
            icon={<FaFacebookF size={15} />}
            />

            <SocialLink
            href="#"
            label="Instagram"
            icon={<FaInstagram size={15} />}
            />

            <SocialLink
            href="#"
            label="Twitter"
            icon={<FaTwitter size={15} />}
            />

            <SocialLink
            href="#"
            label="YouTube"
            icon={<FaYoutube size={15} />}
            />
            </div>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />

          <FooterColumn title="Customer care" links={customerLinks} />

          <FooterColumn title="Company" links={companyLinks} />
        </div>

        <div className="mt-14 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-5 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} AtoZ. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-5">
              <span>Secure checkout</span>
              <span>Fast delivery</span>
              <span>Easy returns</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
        {title}
      </h3>

      <nav className="mt-5 flex flex-col items-start gap-3">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-sm text-white/70 transition hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function SocialLink({ href, label, icon }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/30 hover:bg-white hover:text-black"
    >
      {icon}
    </Link>
  );
}