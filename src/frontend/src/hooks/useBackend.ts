import { ExternalBlob, createActor } from "@/backend";
import type { ApplicationInput } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export function useUpdateUserProfile() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      input,
    }: { token: string; input: import("@/backend").UpdateProfileInput }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.updateUserProfile(token, input);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registeredUsers"] });
    },
  });
}

export function useGetRegisteredUsers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["registeredUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRegisteredUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApplicationStatus(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["applicationStatus", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getApplicationStatus(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useSubmitApplication() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ApplicationInput) => {
      if (!actor) throw new Error("No actor");
      return actor.submitApplication(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applicationStatus"] });
    },
  });
}

export function useListApplications() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["listApplications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminStats() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAdminStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveApplication() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.approveApplication(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listApplications"] });
      qc.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function useRejectApplication() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.rejectApplication(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listApplications"] });
      qc.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function useGalleryPhotos() {
  const { actor } = useActor(createActor);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchPhotos = useCallback(async () => {
    if (!actor) return;
    try {
      setLoading(true);
      const result = await (actor as any).getPublicGalleryPhotos();
      setPhotos(result as any[]);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [actor]);
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);
  return { photos, loading, error, refetch: fetchPhotos };
}

export function useAdminGalleryPhotos() {
  const { actor } = useActor(createActor);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchPhotos = useCallback(async () => {
    if (!actor) return;
    try {
      setLoading(true);
      const result = await (actor as any).adminGetAllGalleryPhotos();
      setPhotos(result as any[]);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [actor]);
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);
  return { photos, loading, error, refetch: fetchPhotos };
}

export async function doUploadGalleryPhoto(
  actor: any,
  file: File,
  caption?: string,
  sessionToken?: string | null,
) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const blob = ExternalBlob.fromBytes(bytes);
  return (actor as any).uploadGalleryPhoto(
    blob,
    caption || null,
    sessionToken || null,
  );
}

export async function doAdminApproveGalleryPhoto(actor: any, id: string) {
  return (actor as any).adminApproveGalleryPhoto(id);
}

export async function doAdminRejectGalleryPhoto(actor: any, id: string) {
  return (actor as any).adminRejectGalleryPhoto(id);
}
export async function doAdminDeleteConfession(actor: any, id: bigint) {
  return (actor as any).adminDeleteConfession(id);
}

export async function doAdminApproveConfession(actor: any, id: bigint) {
  return (actor as any).adminApproveConfession(id);
}

export function useAdminListConfessions() {
  const { actor, isFetching } = useActor(createActor);
  const [confessions, setConfessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchConfessions = useCallback(async () => {
    if (!actor) return;
    try {
      setLoading(true);
      const result = await (actor as any).adminListConfessions();
      setConfessions(result as any[]);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [actor]);
  useEffect(() => {
    if (!isFetching) fetchConfessions();
  }, [fetchConfessions, isFetching]);
  return { confessions, loading, error, refetch: fetchConfessions };
}

export function useDeleteUser() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).deleteUser(email);
      if (result && result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registeredUsers"] });
      qc.invalidateQueries({ queryKey: ["totalUserCount"] });
    },
  });
}

export function useQuizQuestions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["quizQuestions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuizQuestions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useQuizResultTypes() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["quizResultTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuizResultTypes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyQuizResult(applicationId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["myQuizResult", applicationId?.toString()],
    queryFn: async () => {
      if (!actor || applicationId === null) return null;
      return actor.getMyQuizResult(applicationId);
    },
    enabled: !!actor && !isFetching && applicationId !== null,
  });
}

export function useSubmitQuizResult() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      resultType,
    }: { applicationId: bigint; resultType: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitQuizResult(applicationId, resultType);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myQuizResult"] });
    },
  });
}

export function useConfessions(sessionToken?: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["confessions", sessionToken ?? ""],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listConfessions(sessionToken || null);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useSubmitConfession(sessionToken?: string | null) {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).submitConfession(text, sessionToken || null);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["confessions"] });
    },
  });
}

export function useInviteCodes() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["inviteCodes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listInviteCodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddInviteCode() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("No actor");
      return actor.addInviteCode(code);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inviteCodes"] });
    },
  });
}
export function useListAdmins() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["listAdmins"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAdmins();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAdmin() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.addAdmin(principal);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listAdmins"] });
    },
  });
}

export function useRemoveAdmin() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.removeAdmin(principal);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listAdmins"] });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["listApprovals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}
export function useResendApprovalEmail() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.resendApprovalEmail(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
  });
}

export function useTotalUserCount() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["totalUserCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return (
        actor as unknown as { getTotalUserCount(): Promise<bigint> }
      ).getTotalUserCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBroadcastToApprovedGuests() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      subject,
      message,
    }: { subject: string; message: string }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.broadcastToApprovedGuests(subject, message);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok as bigint;
    },
  });
}
