"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, UserRole } from "./types";

interface AuthState {
  user: User | null;
  token: string | null;
  setSession: (user: User, token: string) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setSession: (user, token) => set({ user, token }),
      updateUser: (patch) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...patch } });
      },
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "10s-only-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// ---------------------------------------------------------------------------
// Selector hook
// ---------------------------------------------------------------------------

export interface UseAuth {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isMember: boolean;
  isApproved: boolean; // member vetting approved
  isHost: boolean;
  isAdmin: boolean;
  hasRole: (role: UserRole) => boolean;
  setSession: (user: User, token: string) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
}

export function useAuth(): UseAuth {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);

  const isAuthenticated = !!user && !!token;
  const role = user?.role;

  return {
    user,
    token,
    isAuthenticated,
    isMember: role === "member" || role === "host" || role === "admin",
    // A member is "approved" when verified OR role was elevated beyond raw applicant
    isApproved:
      !!user &&
      (user.verified === true || role === "host" || role === "admin"),
    isHost: role === "host" || role === "admin",
    isAdmin: role === "admin",
    hasRole: (r) => role === r,
    setSession,
    updateUser,
    logout,
  };
}

export { useAuthStore };
