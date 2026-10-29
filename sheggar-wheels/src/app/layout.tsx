import type { Metadata } from "next";
import Link from "next/link";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sheggar Wheels — Car rental in Addis Ababa",
  description:
    "Rent cars directly from verified owners across Addis Ababa. Transparent daily rates, flexible pick-up, no middlemen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={roboto.variable}>
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
      </body>
    </html>
  );
}
