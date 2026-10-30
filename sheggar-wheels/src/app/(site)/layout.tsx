import Link from "next/link";

import { Navbar } from "@/components/Navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <footer className="bg-ink text-sand/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ember text-sm font-bold text-ink">
                SW
              </span>
              <span className="text-lg font-semibold tracking-tight text-sand">
                Sheggar Wheels
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-sand/50">
              Peer-to-peer car rental for Addis Ababa. Owned locally, driven
              freely.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <Link href="/cars" className="transition-colors hover:text-ember">
              Browse cars
            </Link>
            <Link href="/signup" className="transition-colors hover:text-ember">
              List your car
            </Link>
            <Link href="/signin" className="transition-colors hover:text-ember">
              Sign in
            </Link>
          </nav>
          <p className="text-xs text-sand/55">
            &copy; 2026 Sheggar Wheels. Demo data.
          </p>
        </div>
      </footer>
    </>
  );
}
