import { type ApplicationView, createActor } from "@/backend";
import type { UserProfile } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useEffect, useRef, useState } from "react";

export type { UserProfile };

const SESSION_KEY = "userSessionToken";

// Guard to prevent verifySession from re-running after logout
let verifyGuard = false;

export interface UserAuthState {
  userProfile: UserProfile | null;
  sessionToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface UserAuthActions {
  signUp: (
    name: string,
    emailOrPhone: string,
    password: string,
  ) => Promise<void>;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserApplicationStatus: () => Promise<
    { __kind__: "ok"; ok: ApplicationView } | { __kind__: "err"; err: string }
  >;
  clearError: () => void;
}

export type UseUserAuthReturn = UserAuthState & UserAuthActions;

let globalState: UserAuthState = {
  userProfile: null,
  sessionToken: null,
  isLoading: true,
  error: null,
};

const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

function setGlobal(patch: Partial<UserAuthState>) {
  globalState = { ...globalState, ...patch };
  notify();
}

export function useUserAuth(): UseUserAuthReturn {
  const { actor, isFetching } = useActor(createActor);
  const [, rerender] = useState(0);
  const actorRef = useRef(actor);
  actorRef.current = actor;

  useEffect(() => {
    const fn = () => rerender((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  // Restore session on mount / when actor becomes available — runs ONCE only
  useEffect(() => {
    if (verifyGuard) return;
    if (isFetching || !actor) return;
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) {
      setGlobal({ isLoading: false });
      return;
    }
    if (globalState.userProfile) {
      setGlobal({ isLoading: false });
      return;
    }
    verifyGuard = true;
    setGlobal({ isLoading: true });
    actor
      .verifySession(stored)
      .then((res) => {
        if (res.__kind__ === "ok") {
          setGlobal({
            userProfile: res.ok,
            sessionToken: stored,
            isLoading: false,
            error: null,
          });
        } else {
          localStorage.removeItem(SESSION_KEY);
          setGlobal({
            userProfile: null,
            sessionToken: null,
            isLoading: false,
            error: null,
          });
        }
      })
      .catch(() => {
        localStorage.removeItem(SESSION_KEY);
        setGlobal({
          userProfile: null,
          sessionToken: null,
          isLoading: false,
          error: null,
        });
      });
  }, [actor, isFetching]);

  const signUp = useCallback(
    async (name: string, emailOrPhone: string, password: string) => {
      const a = actorRef.current;
      if (!a) throw new Error("Connecting to backend...");
      setGlobal({ isLoading: true, error: null });
      try {
        const res = await a.signUp({ name, emailOrPhone, password });
        if (res.__kind__ === "err") throw new Error(res.err);
        // After signup, auto-login to get session token
        const loginRes = await a.login({ emailOrPhone, password });
        if (loginRes.__kind__ === "err") throw new Error(loginRes.err);
        const { token, user } = loginRes.ok;
        localStorage.setItem(SESSION_KEY, token);
        setGlobal({
          userProfile: user,
          sessionToken: token,
          isLoading: false,
          error: null,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Sign up failed";
        setGlobal({ isLoading: false, error: msg });
        throw e;
      }
    },
    [],
  );

  const login = useCallback(async (emailOrPhone: string, password: string) => {
    const a = actorRef.current;
    if (!a) throw new Error("Connecting to backend...");
    setGlobal({ isLoading: true, error: null });
    try {
      const res = await a.login({ emailOrPhone, password });
      if (res.__kind__ === "err") throw new Error(res.err);
      const { token, user } = res.ok;
      localStorage.setItem(SESSION_KEY, token);
      setGlobal({
        userProfile: user,
        sessionToken: token,
        isLoading: false,
        error: null,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Login failed";
      setGlobal({ isLoading: false, error: msg });
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    const a = actorRef.current;
    const token = globalState.sessionToken;
    // Set guard BEFORE any async work so verifySession becomes a no-op
    verifyGuard = true;
    localStorage.removeItem(SESSION_KEY);
    setGlobal({
      userProfile: null,
      sessionToken: null,
      isLoading: false,
      error: null,
    });
    if (a && token) {
      try {
        await a.logout(token);
      } catch {
        /* best effort */
      }
    }
  }, []);

  const getUserApplicationStatus = useCallback(async () => {
    const a = actorRef.current;
    const token = globalState.sessionToken;
    if (!a) throw new Error("Not connected");
    if (!token) throw new Error("Not logged in");
    return a.getUserApplicationStatus(token);
  }, []);

  const clearError = useCallback(() => {
    setGlobal({ error: null });
  }, []);

  return {
    ...globalState,
    signUp,
    login,
    logout,
    getUserApplicationStatus,
    clearError,
  };
}
