import {
  Headphones,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Fast delivery",
    description: "Quick and reliable delivery to your doorstep.",
  },
  {
    icon: ShieldCheck,
    title: "Secure payment",
    description: "Your payment information stays protected.",
  },
  {
    icon: RefreshCcw,
    title: "Easy returns",
    description: "Simple returns when something is not right.",
  },
  {
    icon: Headphones,
    title: "Helpful support",
    description: "We are here whenever you need assistance.",
  },
];

export default function Benefits() {
  return (
    <section className="container-main section-space-sm">
      <div className="border-y border-[var(--border)] py-12 lg:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="flex items-start gap-4 lg:block"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ecece7]">
                  <Icon size={19} strokeWidth={1.7} />
                </div>

                <div className="mt-0 lg:mt-5">
                  <h3 className="text-sm font-semibold tracking-[-0.02em]">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 max-w-xs text-xs leading-5 text-[var(--muted)]">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}