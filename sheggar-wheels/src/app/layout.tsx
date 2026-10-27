import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sheggar Wheels",
  description: "Car rental marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
        <footer className="bg-gray-800 text-white mt-12 py-8 text-center">
          <p>&copy; 2026 Sheggar Wheels. All rights reserved. | Demo data</p>
        </footer>
      </body>
    </html>
  );
}
