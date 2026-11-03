"use client";

import * as React from "react";

import {
  DATA_CHANGED_EVENT,
  emptyDashboardData,
  loadDashboardData,
  type DashboardData,
  type Session,
} from "@/lib/dashboard";
import { getSession } from "@/lib/session";
import { initData } from "@/lib/storage";

type DashboardContextValue = {
  session: Session;
  data: DashboardData;
  refresh: () => void;
  refreshSession: () => Promise<void>;
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

  const refresh = React.useCallback(() => {
    setData(loadDashboardData(session));
  }, [session]);

  const refreshSession = React.useCallback(async () => {
    const next = await getSession();
    if (next) setSession(next);
  }, []);

  React.useEffect(() => {
    // Seed the demo directory before the first read, then keep it in sync.
    initData();
    refresh();

    const handleChange = () => refresh();
    window.addEventListener(DATA_CHANGED_EVENT, handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener(DATA_CHANGED_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, [refresh]);

  const value = React.useMemo(
    () => ({ session, data, refresh, refreshSession }),
    [session, data, refresh, refreshSession],
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
