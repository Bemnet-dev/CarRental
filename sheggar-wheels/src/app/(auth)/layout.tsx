import { Navbar } from "@/components/Navbar";

/**
 * Auth routes keep the global navigation but intentionally drop the marketing
 * footer so the sign-in / sign-up screen stays a single focused surface.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
