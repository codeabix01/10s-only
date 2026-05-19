import { createActor } from "@/backend";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { identity, loginStatus, login, clear } = useInternetIdentity();
  const { actor } = useActor(createActor);

  const isConnected = loginStatus === "success" && identity !== undefined;
  const principal = isConnected ? identity?.getPrincipal() : null;

  const { data: isAdmin = false } = useQuery({
    queryKey: ["isCallerAdmin", principal?.toString()],
    queryFn: async () => {
      if (!actor || !isConnected) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && isConnected,
  });

  const { data: isApproved = false } = useQuery({
    queryKey: ["isCallerApproved", principal?.toString()],
    queryFn: async () => {
      if (!actor || !isConnected) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && isConnected,
  });

  return {
    identity,
    principal,
    isConnected,
    isAdmin,
    isApproved,
    loginStatus,
    login,
    logout: clear,
  };
}
