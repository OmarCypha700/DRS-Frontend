"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { authApi } from "@/lib/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Two layers, because a slow backend (PythonAnywhere in particular) makes
  // both timing windows realistic, not just theoretical:
  //
  // 1. authSettledByUserActionRef — an explicit login/register is a more
  //    authoritative, more recent signal of truth than the passive boot-time
  //    session check below, full stop. Once it's happened, that background
  //    check must never be allowed to start applying its own result at all
  //    — not "only if it's not stale", but not at all. Without this: the
  //    bootstrap effect does two sequential round trips (csrf, then me); if
  //    login finishes *during* that first await, the effect would still go
  //    on to fire its own fresh /auth/me check afterward, and that check can
  //    fail for reasons that have nothing to do with whether login just
  //    succeeded — silently overwriting the logged-in state back to null.
  //    The user sees "Redirecting…" forever: `user` flips to null right as
  //    the redirect effect was about to fire off the back of it.
  // 2. requestIdRef — covers the narrower window where the bootstrap's own
  //    /auth/me call had *already gone out* right before login completed,
  //    so layer 1's check ran too early to catch it. Every setter of `user`
  //    bumps this first and stamps its own call, so a result only applies
  //    if it's still the most recent thing that was asked for.
  const authSettledByUserActionRef = useRef(false);
  const requestIdRef = useRef(0);

  const refetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      const { data } = await authApi.me();
      if (requestIdRef.current === requestId) setUser(data);
      return data;
    } catch {
      if (requestIdRef.current === requestId) setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      await authApi.bootstrapCsrf().catch(() => {});
      if (!authSettledByUserActionRef.current) {
        await refetch();
      }
      setIsLoading(false);
    })();
  }, [refetch]);

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    authSettledByUserActionRef.current = true;
    requestIdRef.current++;
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    authSettledByUserActionRef.current = true;
    requestIdRef.current++;
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    authSettledByUserActionRef.current = true;
    requestIdRef.current++;
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refetch, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
