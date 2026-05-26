import type {
  AdminStats,
  ApplicationId,
  ApplicationInput,
  ApplicationView,
  ConfessionView,
  Gender,
  GuestQuizResult,
  QuizQuestion,
  QuizResult,
  UpdateProfileInput,
  UserApprovalInfo,
  UserProfile,
} from "@/backend";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type {
  ApplicationView,
  ConfessionView,
  Gender,
  GuestQuizResult,
  QuizQuestion,
  QuizResult,
  AdminStats,
  UserApprovalInfo,
  ApplicationId,
  ApplicationInput,
  UpdateProfileInput,
  UserProfile,
};

export interface NavItem {
  label: string;
  href: string;
  protected?: boolean;
  adminOnly?: boolean;
}
