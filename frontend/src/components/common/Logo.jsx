import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2"
      aria-label="AtoZ home"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--dark)] text-sm font-bold text-white">
        A
      </span>

      <span className="text-xl font-semibold tracking-[-0.05em]">
        AtoZ
      </span>
    </Link>
  );
}