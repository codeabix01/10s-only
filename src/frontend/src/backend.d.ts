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
export interface UserSignUpInput {
    bio?: string;
    emailOrPhone: string;
    city?: string;
    password: string;
    name: string;
    profilePhoto?: string;
    instagramHandle?: string;
    gender?: Gender;
}
export interface UserSessionResult {
    token: string;
    user: UserProfile;
}
export interface UserLoginInput {
    emailOrPhone: string;
    password: string;
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
export interface ConfessionView {
    id: bigint;
    createdAt: bigint;
    text: string;
    approved: boolean;
}
export interface ApplicationView {
    id: bigint;
    status: ApplicationStatus;
    plusOne?: boolean;
    applicantPrincipal?: Principal;
    name: string;
    instagramHandle: string;
    submittedAt: bigint;
    email: string;
    qrToken?: string;
    inviteCode: string;
    phone: string;
    photos: Array<ExternalBlob>;
}
export type UserId = bigint;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface UpdateProfileInput {
    bio?: string;
    city?: string;
    name?: string;
    profilePhoto?: string;
    instagramHandle?: string;
    gender?: Gender;
}
export interface GalleryUpload {
    id: GalleryUploadId;
    uploaderPrincipal: Principal;
    approved: boolean;
    caption?: string;
    photo: ExternalBlob;
    uploadedAt: bigint;
}
export type GalleryUploadId = string;
export interface ApplicationInput {
    plusOne?: boolean;
    name: string;
    instagramHandle: string;
    email: string;
    inviteCode: string;
    phone: string;
    photos: Array<ExternalBlob>;
}
export interface AdminStats {
    total: bigint;
    pending: bigint;
    approved: bigint;
    rejected: bigint;
}
export interface QuizOption {
    id: bigint;
    text: string;
}
export type ApplicationId = bigint;
export interface AdminConfessionView {
    id: bigint;
    createdAt: bigint;
    text: string;
    submittedBy?: string;
    approved: boolean;
}
export interface UserProfile {
    id: UserId;
    bio?: string;
    emailOrPhone: string;
    city?: string;
    name: string;
    createdAt: bigint;
    profilePhoto?: string;
    instagramHandle?: string;
    linkedApplicationId?: string;
    gender?: Gender;
    profileCompleted?: boolean;
}
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
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
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
    adminApproveConfession(id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminApproveGalleryPhoto(id: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminDeleteConfession(id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminGetAllGalleryPhotos(): Promise<Array<GalleryUpload>>;
    adminListConfessions(): Promise<Array<AdminConfessionView>>;
    adminRejectGalleryPhoto(id: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    approveApplication(id: ApplicationId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    broadcastToApprovedGuests(subject: string, message: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteUser(emailOrPhone: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAdminStats(): Promise<AdminStats>;
    getApplicationStatus(id: ApplicationId): Promise<[ApplicationStatus, string | null] | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyQuizResult(applicationId: ApplicationId): Promise<GuestQuizResult | null>;
    getPublicGalleryPhotos(): Promise<Array<GalleryUpload>>;
    getQuizQuestions(): Promise<Array<QuizQuestion>>;
    getQuizResultTypes(): Promise<Array<QuizResult>>;
    getRegisteredUsers(): Promise<Array<UserProfile>>;
    getTotalUserCount(): Promise<bigint>;
    getUserApplicationStatus(token: string): Promise<{
        __kind__: "ok";
        ok: ApplicationView;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getUserProfile(token: string): Promise<{
        __kind__: "ok";
        ok: UserProfile;
    } | {
        __kind__: "err";
        err: string;
    }>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    linkApplicationToUser(token: string, applicationId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    listAdmins(): Promise<Array<Principal>>;
    listApplications(): Promise<Array<ApplicationView>>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    listConfessions(sessionToken: string | null): Promise<Array<ConfessionView>>;
    listInviteCodes(): Promise<Array<string>>;
    login(input: UserLoginInput): Promise<{
        __kind__: "ok";
        ok: UserSessionResult;
    } | {
        __kind__: "err";
        err: string;
    }>;
    logout(token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
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
    signUp(input: UserSignUpInput): Promise<{
        __kind__: "ok";
        ok: UserProfile;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitApplication(input: ApplicationInput): Promise<ApplicationId>;
    submitConfession(text: string, sessionToken: string | null): Promise<bigint>;
    submitQuizResult(applicationId: ApplicationId, resultType: string): Promise<void>;
    updateUserProfile(token: string, input: UpdateProfileInput): Promise<{
        __kind__: "ok";
        ok: UserProfile;
    } | {
        __kind__: "err";
        err: string;
    }>;
    uploadGalleryPhoto(photo: ExternalBlob, caption: string | null, sessionToken: string | null): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    verifySession(token: string): Promise<{
        __kind__: "ok";
        ok: UserProfile;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
