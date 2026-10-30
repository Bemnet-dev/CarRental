"use client";

import * as React from "react";

import { getSession } from "@/lib/auth";
import {
  DATA_CHANGED_EVENT,
  loadDashboardData,
  normalizeSession,
  type DashboardData,
  type Session,
} from "@/lib/dashboard";

type DashboardContextValue = {
  session: Session;
  data: DashboardData;
  refresh: () => void;
  refreshSession: () => void;
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
    loadDashboardData(initialSession),
  );

  const refresh = React.useCallback(() => {
    setData(loadDashboardData(session));
  }, [session]);

  const refreshSession = React.useCallback(() => {
    const next = normalizeSession(getSession());
    if (next) setSession(next);
  }, []);

  React.useEffect(() => {
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
