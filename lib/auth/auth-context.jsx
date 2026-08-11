"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { authApi } from "@/lib/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Guards against a stale result clobbering a newer one — e.g. the
  // bootstrap effect's /auth/me check is still in flight (two sequential
  // round trips: csrf, then me) when the user submits login, which resolves
  // first. Without this, the bootstrap check's "not logged in" result can
  // land after login's "logged in" result and silently overwrite it back to
  // null — login appears to succeed, the page navigates to the dashboard,
  // then the user gets bounced right back to /login. Every setter of `user`
  // bumps this ref first and stamps its own call, so a result only applies
  // if it's still the most recent thing that was asked for.
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
      await refetch();
      setIsLoading(false);
    })();
  }, [refetch]);

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    requestIdRef.current++;
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    requestIdRef.current++;
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
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
