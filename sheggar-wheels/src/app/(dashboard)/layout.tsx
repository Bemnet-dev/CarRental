import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { toAppSession } from "@/lib/app-session";
import { auth } from "@/lib/auth";

// Session validation reads cookies/headers on every request.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cookieStore, requestHeaders] = await Promise.all([
    cookies(),
    headers(),
  ]);
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  const session = await auth.api.getSession({ headers: requestHeaders });
  const appSession = toAppSession(session);

  if (!appSession) {
    redirect("/signin?next=%2Fdashboard");
  }

  // The admin plugin blocks banned users at session creation. This covers a
  // session that was already alive when the account was banned.
  if (session?.user.banned) {
    redirect("/signin?suspended=1");
  }

  return (
    <DashboardShell defaultOpen={defaultOpen} initialSession={appSession}>
      {children}
    </DashboardShell>
  );
}
