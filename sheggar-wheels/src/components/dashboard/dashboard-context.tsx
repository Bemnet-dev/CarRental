"use client";

import * as React from "react";

import { toDirectoryUser } from "@/lib/app-session";
import { authClient } from "@/lib/auth-client";
import {
  DATA_CHANGED_EVENT,
  emptyDashboardData,
  loadDashboardData,
  syncDirectoryUsers,
  type DashboardData,
  type Session,
} from "@/lib/dashboard";
import { getSession } from "@/lib/session";
import { initData } from "@/lib/storage";

type DirectoryStatus = "idle" | "loading" | "error";

type DashboardContextValue = {
  session: Session;
  data: DashboardData;
  refresh: () => void;
  refreshSession: () => Promise<void>;
  /** Re-reads the authoritative user list from Better Auth (admins only). */
  refreshDirectory: () => Promise<void>;
  directoryStatus: DirectoryStatus;
  directoryError: string | null;
};

const DashboardContext = React.createContext<DashboardContextValue | null>(
  null,
);

export function DashboardProvider({
  initialSession,
  children,
}: {
  initialSession: Session;
  children: React.ReactNode;
}) {
  const [session, setSession] = React.useState(initialSession);
  const [data, setData] = React.useState(() =>
    emptyDashboardData(initialSession),
  );
  const [directoryStatus, setDirectoryStatus] =
    React.useState<DirectoryStatus>("idle");
  const [directoryError, setDirectoryError] = React.useState<string | null>(
    null,
  );

  const refresh = React.useCallback(() => {
    setData(loadDashboardData(session));
  }, [session]);

  const refreshSession = React.useCallback(async () => {
    const next = await getSession();
    if (next) setSession(next);
  }, []);

  const refreshDirectory = React.useCallback(async () => {
    // Only admins can call the Better Auth admin API.
    if (session.role !== "admin") return;

    setDirectoryStatus("loading");
    setDirectoryError(null);

    const { data: result, error } = await authClient.admin.listUsers({
      query: {
        limit: 200,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
    });

    if (error) {
      setDirectoryStatus("error");
      setDirectoryError(
        error.message || "Could not load users from Better Auth.",
      );
      return;
    }

    syncDirectoryUsers((result?.users ?? []).map(toDirectoryUser));
    setDirectoryStatus("idle");
  }, [session.role]);

  React.useEffect(() => {
    // Seed the demo directory before the first read, then keep it in sync.
    initData();
    refresh();
    void refreshDirectory();

    const handleChange = () => refresh();
    window.addEventListener(DATA_CHANGED_EVENT, handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener(DATA_CHANGED_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, [refresh, refreshDirectory]);

  const value = React.useMemo(
    () => ({
      session,
      data,
      refresh,
      refreshSession,
      refreshDirectory,
      directoryStatus,
      directoryError,
    }),
    [
      session,
      data,
      refresh,
      refreshSession,
      refreshDirectory,
      directoryStatus,
      directoryError,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider.");
  }
  return context;
}
