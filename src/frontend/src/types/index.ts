import type {
  AdminStats,
  ApplicationId,
  ApplicationInput,
  ApplicationView,
  Confession,
  GuestQuizResult,
  QuizQuestion,
  QuizResult,
  UserApprovalInfo,
} from "@/backend";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type {
  ApplicationView,
  Confession,
  GuestQuizResult,
  QuizQuestion,
  QuizResult,
  AdminStats,
  UserApprovalInfo,
  ApplicationId,
  ApplicationInput,
};

export interface NavItem {
  label: string;
  href: string;
  protected?: boolean;
  adminOnly?: boolean;
}
