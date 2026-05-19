import { createActor } from "@/backend";
import type { ApplicationInput } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export function useApprovedPhotos() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["approvedPhotos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getApprovedPhotos();
    },
    enabled: !!actor && !isFetching,
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

export function useConfessions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["confessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listConfessions();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useSubmitConfession() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("No actor");
      return actor.submitConfession(text);
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
