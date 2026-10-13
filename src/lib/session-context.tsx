"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { SessionUser } from "./auth-validation";

type SessionState = {
  user: SessionUser | null;
  updating: boolean;
  setUser: (user: SessionUser | null) => void;
  beginUpdate: (user: SessionUser) => ((confirmed?: SessionUser) => void) | null;
};
const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setConfirmedUser] = useState<SessionUser | null>(null);
  const [optimisticUser, setOptimisticUser] = useState<SessionUser | null>(null);
  const [updating, setUpdating] = useState(false);
  const revision = useRef(0);
  const operation = useRef<number | null>(null);

  const setUser = useCallback((next: SessionUser | null) => {
    revision.current++;
    operation.current = null;
    setConfirmedUser(next); setOptimisticUser(null); setUpdating(false);
  }, []);

  const beginUpdate = useCallback((next: SessionUser) => {
    if (operation.current !== null) return null;
    const id = ++revision.current;
    operation.current = id;
    setOptimisticUser(next); setUpdating(true);
    return (confirmed?: SessionUser) => {
      if (operation.current !== id) return;
      operation.current = null;
      if (confirmed) setConfirmedUser(confirmed);
      setOptimisticUser(null); setUpdating(false);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const atStart = revision.current;
    void fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) }).then(async response => {
      const body = await response.json();
      if (controller.signal.aborted || revision.current !== atStart) return;
      if (response.status === 401 || body.user === null) { setConfirmedUser(null); return; }
      if (response.ok && typeof body.user?.id === "string" && typeof body.user?.name === "string" && typeof body.user?.email === "string") setConfirmedUser({ id: body.user.id, name: body.user.name, email: body.user.email });
    }).catch(() => { /* Protected server pages still verify the cookie independently. */ });
    return () => controller.abort();
  }, []);

  return <SessionContext value={{ user: optimisticUser ?? user, updating, setUser, beginUpdate }}>{children}</SessionContext>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("SessionProvider is required");
  return context;
}
