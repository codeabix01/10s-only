import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface QuizQuestion {
    id: bigint;
    text: string;
    options: Array<QuizOption>;
}
export interface QuizResult {
    description: string;
    resultType: string;
}
export interface Confession {
    id: bigint;
    createdAt: bigint;
    text: string;
}
export interface ApplicationView {
    id: bigint;
    status: ApplicationStatus;
    plusOne?: boolean;
    applicationId: string;
    name: string;
    instagramHandle: string;
    submittedAt: bigint;
    email: string;
    qrToken?: string;
    inviteCode: string;
    phone: string;
    photos: Array<ExternalBlob>;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface AdminStats {
    total: bigint;
    pending: bigint;
    approved: bigint;
    rejected: bigint;
}
export interface ApplicationInput {
    plusOne?: boolean;
    name: string;
    instagramHandle: string;
    email: string;
    inviteCode: string;
    phone: string;
    photos: Array<ExternalBlob>;
}
export interface QuizOption {
    id: bigint;
    text: string;
}
export type ApplicationId = bigint;
export interface GuestQuizResult {
    applicationId: bigint;
    takenAt: bigint;
    resultType: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAdmin(principal: Principal): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addInviteCode(code: string): Promise<void>;
    approveApplication(id: ApplicationId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    broadcastToApprovedGuests(subject: string, message: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAdminStats(): Promise<AdminStats>;
    getApplicationStatus(id: ApplicationId): Promise<[ApplicationStatus, string | null] | null>;
    getApprovedPhotos(): Promise<Array<ExternalBlob>>;
    getCallerUserRole(): Promise<UserRole>;
    getMyQuizResult(applicationId: ApplicationId): Promise<GuestQuizResult | null>;
    getQuizQuestions(): Promise<Array<QuizQuestion>>;
    getQuizResultTypes(): Promise<Array<QuizResult>>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listAdmins(): Promise<Array<Principal>>;
    listApplications(): Promise<Array<ApplicationView>>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    listConfessions(): Promise<Array<Confession>>;
    listInviteCodes(): Promise<Array<string>>;
    rejectApplication(id: ApplicationId): Promise<void>;
    removeAdmin(principal: Principal): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    requestApproval(): Promise<void>;
    resendApprovalEmail(id: ApplicationId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    submitApplication(input: ApplicationInput): Promise<ApplicationId>;
    submitConfession(text: string): Promise<bigint>;
    submitQuizResult(applicationId: ApplicationId, resultType: string): Promise<void>;
}
