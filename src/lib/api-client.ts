// ============================================================================
// 10s Only — API Client
// Production mode only: backend API URL is required.
// ============================================================================

import {
  ADMIN_STATS,
  APPLICATIONS,
  CITY_STATS,
  CONFESSIONS,
  CURRENT_USER,
  EVENTS,
  HOST_USER,
  HOST_VENUES,
  LEDGER,
  QUIZ_QUESTIONS,
  TICKETS,
  type QuizQuestion,
} from "./mock-data";
import { getEventCover } from "./event-covers";
import {
  HOST_APPLICATIONS,
  PENDING_EVENTS,
} from "./mock-data-extended";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { User as SupabaseAuthUser } from "@supabase/auth-js";
import type {
  AdminStats,
  Application,
  ApplicationAnswer,
  City,
  CityStat,
  ConfessionView,
  EventVibe,
  HostApplication,
  HostApplicationInput,
  HostVenue,
  LedgerEntry,
  ProposedEvent,
  RazorpayOrder,
  RazorpayPaymentRecord,
  RazorpayVerificationInput,
  RazorpayVerifyResponse,
  Ticket,
  User,
} from "./types";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").trim();
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";
export const USE_SUPABASE = !!SUPABASE_URL && !!SUPABASE_KEY;
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is required. Mock fallback is disabled in this build."
  );
}

const BASE_URL = API_URL.replace(/\/$/, "");

let supabaseClient: SupabaseClient | null = null;
function getSupabaseClient(): SupabaseClient | null {
  if (!USE_SUPABASE || typeof window === "undefined") return null;
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: "sb:auth",
      },
    });
  }
  return supabaseClient;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Deep-normalize string enums to lowercase. */
function normalizeEnums(input: unknown): unknown {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) return input.map(normalizeEnums);
  if (typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (typeof v === "string") {
        out[k] = /^[A-Z_]+$/.test(v) ? v.toLowerCase() : v;
      } else {
        out[k] = normalizeEnums(v);
      }
    }
    return out;
  }
  return input;
}

const VALID_VIBES: EventVibe[] = [
  "techno",
  "house",
  "drum-and-bass",
  "experimental",
  "hip-hop",
  "ambient",
];

const VALID_CITIES: City[] = [
  "mumbai",
  "delhi",
  "bangalore",
  "goa",
  "pune",
  "hyderabad",
];

function normalizeVibe(value: unknown): EventVibe {
  if (typeof value !== "string") return "techno";
  const normalized = value.toLowerCase().replace(/_/g, "-");
  if (normalized === "underground") return "techno";
  return VALID_VIBES.includes(normalized as EventVibe)
    ? (normalized as EventVibe)
    : "techno";
}

function normalizeVisibility(value: unknown): ProposedEvent["visibility"] {
  if (typeof value !== "string") return "members";
  const normalized = value.toLowerCase().replace(/_/g, "-");
  if (normalized === "members-only") return "members";
  if (normalized === "private") return "private";
  if (normalized === "public") return "public";
  return "members";
}

function normalizeCity(value: unknown): City {
  if (typeof value !== "string") return "mumbai";
  const normalized = value.toLowerCase();
  return VALID_CITIES.includes(normalized as City)
    ? (normalized as City)
    : "mumbai";
}

function resolveCover(
  rawCover: unknown,
  vibe: EventVibe,
  title: string,
  city: City
): string {
  if (typeof rawCover === "string") {
    const trimmed = rawCover.trim();
    if (trimmed && trimmed !== "undefined" && trimmed !== "null") {
      return trimmed;
    }
  }

  return getEventCover(vibe, title, city);
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function mapSupabaseUser(user: SupabaseAuthUser): User {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    typeof metadata.full_name === "string" && metadata.full_name
      ? metadata.full_name
      : user.email?.split("@")[0] ?? user.phone ?? "Guest";
  const handle =
    typeof metadata.handle === "string" && metadata.handle
      ? metadata.handle
      : name
          .toLowerCase()
          .replace(/\s+/g, ".")
          .replace(/[^a-z0-9._-]/g, "");
  const role =
    typeof metadata.role === "string" &&
    ["member", "host", "admin"].includes(metadata.role.toLowerCase())
      ? (metadata.role.toLowerCase() as User["role"])
      : "member";
  const city =
    typeof metadata.city === "string" && VALID_CITIES.includes(metadata.city as City)
      ? (metadata.city as City)
      : "mumbai";

  return {
    id: user.id,
    name,
    handle,
    email: user.email ?? "",
    phone: user.phone ?? undefined,
    avatar:
      typeof metadata.avatar === "string" && metadata.avatar
        ? metadata.avatar
        : "",
    role,
    city,
    bio: typeof metadata.bio === "string" ? metadata.bio : undefined,
    joinedAt: user.created_at ?? new Date().toISOString(),
    verified: true,
  };
}

function normalizeIdentifier(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }
  const normalized = trimmed.replace(/\s+/g, "");
  const digits = normalized.replace(/[^+\d]/g, "");
  if (digits.startsWith("00")) {
    return `+${digits.slice(2)}`;
  }
  return digits;
}

async function requestSupabaseOtp(identifier: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured");
  const normalized = normalizeIdentifier(identifier);
  if (!normalized.includes("@")) {
    throw new Error("Only email OTP is supported.");
  }
  const { error } = await client.auth.signInWithOtp({
    email: normalized,
    options: {
      shouldCreateUser: true,
    },
  });
  if (error) throw error;
}

async function verifySupabaseOtp(
  identifier: string,
  code: string
): Promise<{ user: User; token: string }> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured");
  const normalized = normalizeIdentifier(identifier);
  if (!normalized.includes("@")) {
    throw new Error("Only email OTP is supported.");
  }

  const { data, error } = await client.auth.verifyOtp({
    email: normalized,
    token: code,
    type: "email",
  });

  if (error) throw error;
  if (!data?.session || !data.user) {
    throw new Error("Login failed");
  }

  // Always sync to backend to get a backend JWT (contains MongoDB user ID).
  // Supabase tokens cannot be parsed by the backend JWT filter.
  if (API_URL) {
    try {
      const synced = await fetch(`${BASE_URL}/api/auth/supabase/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: data.user.email || data.user.phone || normalized,
          name:
            (data.user.user_metadata?.full_name as string) ||
            normalized.split("@")[0],
          avatarUrl: (data.user.user_metadata?.avatar_url as string) || "",
          city: (data.user.user_metadata?.city as string) || "mumbai",
        }),
      });
      if (synced.ok) {
        const json = await synced.json();
        return {
          token: json.token,
          user: normalizeEnums(json.user) as User,
        };
      }
    } catch {
      // Fall through to Supabase token (will fail on authenticated backend routes)
    }
  }

  return {
    token: data.session.access_token,
    user: mapSupabaseUser(data.user),
  };
}

async function signInWithGoogle(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured");
  await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/login`,
    },
  });
}

async function signOutSupabase(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

async function syncSupabaseSession(): Promise<{ user: User; token: string } | null> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured");
  const {
    data: { session },
    error,
  } = await client.auth.getSession();
  if (error) throw error;
  if (!session || !session.user) return null;
  const user = mapSupabaseUser(session.user);
  if (API_URL) {
    const synced = await fetch(`${BASE_URL}/api/auth/supabase/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailOrPhone: user.email || user.phone || session.user.email || session.user.phone || "",
        name: user.name,
        avatarUrl: user.avatar || "",
        city: user.city,
      }),
    });
    if (!synced.ok) {
      const text = await synced.text().catch(() => "");
      throw new Error(`Backend sync failed: ${text || synced.statusText}`);
    }
    const json = await synced.json();
    return {
      token: json.token,
      user: normalizeEnums(json.user) as User,
    };
  }
  return {
    token: session.access_token,
    user,
  };
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem("10s-only-auth");
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed?.token ?? parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function http<T>(
  path: string,
  options: RequestInit & { query?: Record<string, string | number | boolean | undefined> } = {}
): Promise<T> {
  const { query, ...init } = options;
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const token = getAuthToken();
  const headers = new Headers(init.headers as HeadersInit);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(url.toString(), {
    ...init,
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  const json = await res.json();
  return normalizeEnums(json) as T;
}

// ---------------------------------------------------------------------------
// In-memory mock mutables (so create/approve flows feel real)
// ---------------------------------------------------------------------------

let mockEvents: ProposedEvent[] = [...EVENTS];
let mockApplications: Application[] = [...APPLICATIONS];
let mockHostApplications: HostApplication[] = [...HOST_APPLICATIONS];
let mockPendingEvents: ProposedEvent[] = [...PENDING_EVENTS];
let mockTickets: Ticket[] = [...TICKETS];

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export const authApi = {
  async me(): Promise<User | null> {
    if (USE_SUPABASE) {
      const client = getSupabaseClient();
      if (!client) throw new Error("Supabase is not configured");
      const { data, error } = await client.auth.getUser();
      if (error) throw error;
      if (!data.user) return null;
      return mapSupabaseUser(data.user);
    }
    if (USE_MOCK) return delay(CURRENT_USER, 200);
    return http<User>("/api/auth/me");
  },

  async requestOtp(identifier: string): Promise<void> {
    if (USE_SUPABASE) return requestSupabaseOtp(identifier);
    if (USE_MOCK) return delay(undefined, 200);
    await http("/api/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ identifier }),
    });
  },

  async login(identifier: string, _code: string): Promise<{ user: User; token: string }> {
    if (USE_SUPABASE) {
      return verifySupabaseOtp(identifier, _code);
    }
    if (USE_MOCK) {
      const user =
        identifier.toLowerCase().includes("void") || identifier.toLowerCase().includes("host")
          ? HOST_USER
          : identifier.toLowerCase().includes("ops") || identifier.toLowerCase().includes("admin")
          ? {
              ...CURRENT_USER,
              role: "admin" as const,
              adminTitle: "Operations",
            }
          : CURRENT_USER;
      return delay({ user, token: `mock-token-${uid("tok")}` }, 400);
    }
    // Use OTP flow: request OTP then verify
    await http("/api/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ identifier }),
    });
    const res = await http<{ token: string; user: any }>("/api/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ identifier, code: _code }),
    });
    return {
      token: res.token,
      user: {
        ...res.user,
        role: (res.user.role?.toLowerCase() ?? "guest") as User["role"],
        isApproved: res.user.approved ?? res.user.isApproved ?? false,
      },
    };
  },
  async googleSignIn(): Promise<void> {
    if (USE_SUPABASE) {
      return signInWithGoogle();
    }
    throw new Error("Google Sign-In is only available with Supabase.");
  },
  async signOut(): Promise<void> {
    if (USE_SUPABASE) {
      await signOutSupabase();
    }
  },
  async syncSupabaseSession(): Promise<{ user: User; token: string } | null> {
    if (USE_SUPABASE) {
      return syncSupabaseSession();
    }
    return null;
  },

  async register(input: {
    name: string;
    handle: string;
    email: string;
    password: string;
    city: City;
  }): Promise<{ user: User; token: string }> {
    if (USE_MOCK) {
      const user: User = {
        id: uid("usr"),
        name: input.name,
        handle: input.handle,
        email: input.email,
        avatar: "",
        role: "member",
        city: input.city,
        joinedAt: new Date().toISOString(),
        verified: false,
      };
      return delay({ user, token: `mock-token-${uid("tok")}` }, 500);
    }
    return http("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

// ---------------------------------------------------------------------------
// Events API
// ---------------------------------------------------------------------------

export interface EventCreateInput {
  hostId: string;
  hostName: string;
  title: string;
  vibe: EventVibe;
  city: City;
  venue: string;
  address: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  price: number;
  description: string;
  lineup?: string;
  visibility: ProposedEvent["visibility"];
}

// Maps backend event field names to frontend ProposedEvent field names
function mapEvent(raw: any): ProposedEvent {
  const title = raw.title ?? "";
  const vibe = normalizeVibe(raw.vibe);
  const city = normalizeCity(raw.city);

  return {
    id: String(raw.id),
    hostId: String(raw.hostId ?? raw.host?.id ?? ""),
    hostName: raw.hostName ?? raw.host?.name ?? "",
    title,
    vibe,
    city,
    venue: raw.venueName ?? raw.venue ?? "",
    address: raw.venueAddress ?? raw.address ?? "",
    startsAt: raw.startAt ?? raw.startsAt ?? "",
    endsAt: raw.endAt ?? raw.endsAt ?? "",
    capacity: raw.venueCapacity ?? raw.capacity ?? 0,
    price: raw.ticketPrice ?? raw.price ?? 0,
    description: raw.description ?? "",
    lineup: Array.isArray(raw.lineup) ? raw.lineup.join(" · ") : (raw.lineup ?? ""),
    cover: resolveCover(raw.coverImage ?? raw.cover ?? "", vibe, title, city),
    visibility: normalizeVisibility(raw.visibility),
    status: (raw.status?.toLowerCase()?.replace(/_/g, "") ?? "listed") as ProposedEvent["status"],
    createdAt: raw.createdAt ?? new Date().toISOString(),
    ticketsSold: raw.ticketsSold ?? 0,
    rejectionReason: raw.rejectionReason,
  };
}

function mapAdminStats(raw: any): AdminStats {
  return {
    totalMembers: toNumber(raw?.totalMembers),
    totalHosts: toNumber(raw?.totalHosts),
    totalEvents: toNumber(raw?.totalEvents),
    pendingApplications: toNumber(raw?.pendingApplications),
    pendingEvents: toNumber(raw?.pendingEvents),
    totalRevenue: toNumber(raw?.totalRevenue),
    ticketsSold: toNumber(raw?.ticketsSold ?? raw?.totalTicketsSold),
    avgAlignment: toNumber(raw?.avgAlignment),
  };
}

function mapHostApplication(raw: any): HostApplication {
  const collectiveName =
    (typeof raw?.collectiveName === "string" && raw.collectiveName) ||
    (typeof raw?.crewName === "string" && raw.crewName) ||
    "Host collective";
  const bio =
    (typeof raw?.bio === "string" && raw.bio) ||
    (typeof raw?.whyHost === "string" && raw.whyHost) ||
    "";
  const sampleLineup = Array.isArray(raw?.sampleLineup)
    ? raw.sampleLineup.filter((v: unknown): v is string => typeof v === "string" && v.length > 0)
    : [];
  const portfolio =
    sampleLineup.length > 0
      ? sampleLineup
      : typeof raw?.pastEvents === "string" && raw.pastEvents.trim()
      ? [raw.pastEvents.trim()]
      : [];

  const socialLinks: HostApplication["socialLinks"] = [];
  if (typeof raw?.instagram === "string" && raw.instagram.trim()) {
    socialLinks.push({ label: "Instagram", url: raw.instagram.trim() });
  }
  if (typeof raw?.soundcloud === "string" && raw.soundcloud.trim()) {
    socialLinks.push({ label: "SoundCloud", url: raw.soundcloud.trim() });
  }

  const submittedAt =
    typeof raw?.submittedAt === "string" && raw.submittedAt
      ? raw.submittedAt
      : new Date().toISOString();
  const userName =
    (typeof raw?.userName === "string" && raw.userName) || collectiveName;
  const userEmail = typeof raw?.userEmail === "string" ? raw.userEmail : "";
  const userHandle =
    (userEmail.split("@")[0] || userName)
      .replace(/[^a-z0-9._-]/gi, "")
      .toLowerCase() || "host";

  const normalizedStatus =
    raw?.status === "interview" ? "revision" : raw?.status;

  return {
    id: String(raw?.id ?? ""),
    userId: String(raw?.userId ?? ""),
    user: {
      id: String(raw?.userId ?? ""),
      name: userName,
      handle: userHandle,
      email: userEmail,
      avatar: "",
      role: "member",
      city: normalizeCity(raw?.city),
      joinedAt: submittedAt,
      verified: false,
    },
    collectiveName,
    bio,
    city: normalizeCity(raw?.city),
    portfolio,
    socialLinks,
    status: (typeof normalizedStatus === "string"
      ? normalizedStatus
      : "pending") as HostApplication["status"],
    submittedAt,
    reviewedAt: raw?.reviewedAt,
    reviewerNote: raw?.reviewerNote ?? raw?.reviewerNotes,
  };
}

export const eventsApi = {
  async list(filters?: {
    city?: City;
    vibe?: EventVibe;
    visibility?: ProposedEvent["visibility"];
  }): Promise<ProposedEvent[]> {
    if (USE_MOCK) {
      let result = mockEvents.filter((e) => e.status === "live" || e.status === "soldout");
      if (filters?.city) result = result.filter((e) => e.city === filters.city);
      if (filters?.vibe) result = result.filter((e) => e.vibe === filters.vibe);
      if (filters?.visibility)
        result = result.filter((e) => e.visibility === filters.visibility);
      return delay(result, 300);
    }
    return http<any[]>("/api/events", { query: filters }).then(arr => arr.map(mapEvent));
  },

  async get(id: string): Promise<ProposedEvent> {
    if (USE_MOCK) {
      const found =
        mockEvents.find((e) => e.id === id) ||
        mockPendingEvents.find((e) => e.id === id);
      if (!found) throw new Error("Event not found");
      return delay(found, 200);
    }
    return http<any>(`/api/events/${id}`).then(mapEvent);
  },

  async create(input: EventCreateInput): Promise<ProposedEvent> {
    if (USE_MOCK) {
      const event: ProposedEvent = {
        id: uid("evt"),
        ...input,
        cover: "", // frontend generates via getEventCover
        status: "draft", // new events always start as draft
        createdAt: new Date().toISOString(),
        ticketsSold: 0,
      };
      mockPendingEvents = [event, ...mockPendingEvents];
      return delay(event, 500);
    }
    return http<ProposedEvent>("/api/events", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async pending(): Promise<ProposedEvent[]> {
    if (USE_MOCK) {
      return delay(mockPendingEvents, 300);
    }
    return http<ProposedEvent[]>("/api/events/pending");
  },

  async approveEvent(id: string): Promise<ProposedEvent> {
    if (USE_MOCK) {
      const idx = mockPendingEvents.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error("Pending event not found");
      const [event] = mockPendingEvents.splice(idx, 1);
      const approved: ProposedEvent = {
        ...event,
        status: "live",
        rejectionReason: undefined,
      };
      mockEvents = [approved, ...mockEvents];
      return delay(approved, 400);
    }
    return http<ProposedEvent>(`/api/events/${id}/approve`, { method: "POST" });
  },

  async rejectEvent(id: string, reason: string): Promise<ProposedEvent> {
    if (USE_MOCK) {
      const idx = mockPendingEvents.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error("Pending event not found");
      const event = mockPendingEvents[idx];
      const rejected: ProposedEvent = {
        ...event,
        status: "cancelled",
        rejectionReason: reason,
      };
      mockPendingEvents[idx] = rejected;
      return delay(rejected, 400);
    }
    return http<ProposedEvent>(`/api/events/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async byHost(hostId: string): Promise<ProposedEvent[]> {
    if (USE_MOCK) {
      const all = [...mockEvents, ...mockPendingEvents];
      return delay(
        all.filter((e) => e.hostId === hostId),
        300
      );
    }
    return http<ProposedEvent[]>(`/api/events/by-host/${hostId}`);
  },
};

// ---------------------------------------------------------------------------
// Applications API (member vetting)
// ---------------------------------------------------------------------------

export const applicationsApi = {
  async submit(input: {
    userId: string;
    answers: ApplicationAnswer[];
  }): Promise<Application> {
    if (USE_MOCK) {
      const app: Application = {
        id: uid("app"),
        userId: input.userId,
        user: CURRENT_USER,
        status: "pending",
        answers: input.answers,
        vibeAlignment: 80,
        submittedAt: new Date().toISOString(),
      };
      mockApplications = [app, ...mockApplications];
      return delay(app, 500);
    }
    return http<Application>("/api/applications", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async list(): Promise<Application[]> {
    if (USE_MOCK) return delay(mockApplications, 300);
    return http<Application[]>("/api/applications");
  },

  async mine(userId: string): Promise<Application | null> {
    if (USE_MOCK) {
      const found = mockApplications.find((a) => a.userId === userId) || null;
      return delay(found, 200);
    }
    return http<Application | null>(`/api/applications/mine/${userId}`);
  },

  async review(id: string, decision: "approved" | "rejected" | "waitlisted", note?: string): Promise<Application> {
    if (USE_MOCK) {
      const idx = mockApplications.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error("Application not found");
      const updated: Application = {
        ...mockApplications[idx],
        status: decision,
        reviewedAt: new Date().toISOString(),
        reviewerNote: note,
      };
      mockApplications[idx] = updated;
      return delay(updated, 400);
    }
    return http<Application>(`/api/applications/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ decision, note }),
    });
  },
};

// ---------------------------------------------------------------------------
// Quiz API
// ---------------------------------------------------------------------------

export const quizApi = {
  async questions(): Promise<QuizQuestion[]> {
    if (USE_MOCK) return delay(QUIZ_QUESTIONS, 200);
    return http<QuizQuestion[]>("/api/quiz/questions");
  },

  async submit(answers: ApplicationAnswer[]): Promise<{ vibeAlignment: number; dominantVibe: EventVibe }> {
    if (USE_MOCK) {
      // Compute dominant vibe from answer weights
      const weights: Record<string, number> = {};
      for (const ans of answers) {
        const q = QUIZ_QUESTIONS.find((qq) => qq.id === ans.questionId);
        const opt = q?.options.find((o) => o.id === ans.optionId);
        if (!opt) continue;
        for (const [vibe, w] of Object.entries(opt.vibeWeights)) {
          weights[vibe] = (weights[vibe] || 0) + (w as number);
        }
      }
      let dominantVibe: EventVibe = "techno";
      let max = -1;
      for (const [v, w] of Object.entries(weights)) {
        if (w > max) {
          max = w;
          dominantVibe = v as EventVibe;
        }
      }
      const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
      const alignment = Math.min(98, Math.round((max / total) * 100 + 25));
      return delay({ vibeAlignment: alignment, dominantVibe }, 600);
    }
    return http("/api/quiz/submit", {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },
};

// ---------------------------------------------------------------------------
// Razorpay API
// ---------------------------------------------------------------------------

export const razorpayApi = {
  async createOrder(input: {
    eventId: string;
    userId: string;
    amount: number; // INR rupees
  }): Promise<RazorpayOrder> {
    if (USE_MOCK) {
      const order: RazorpayOrder = {
        id: uid("order"),
        entity: "order",
        amount: Math.round(input.amount * 100),
        amount_paid: 0,
        amount_due: Math.round(input.amount * 100),
        currency: "INR",
        receipt: `rcpt_${input.eventId}_${Date.now()}`,
        status: "created",
        notes: { eventId: input.eventId, userId: input.userId },
        created_at: Math.floor(Date.now() / 1000),
      };
      return delay(order, 500);
    }
    return http<RazorpayOrder>("/api/payments/razorpay/order", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async verify(input: RazorpayVerificationInput): Promise<RazorpayVerifyResponse> {
    if (USE_MOCK) {
      // In mock mode, we trust the client and "capture" the payment.
      const payment: RazorpayPaymentRecord = {
        id: uid("pay"),
        orderId: input.razorpay_order_id,
        paymentId: input.razorpay_payment_id,
        signature: input.razorpay_signature,
        amount: 0, // filled by caller context elsewhere
        currency: "INR",
        status: "captured",
        createdAt: new Date().toISOString(),
      };
      return delay(
        {
          ...payment,
          ticketId: uid("tkt"),
          verifiedAt: new Date().toISOString(),
        },
        600
      );
    }
    return http<RazorpayVerifyResponse>("/api/payments/razorpay/verify", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

// ---------------------------------------------------------------------------
// Host API (venues + roster)
// ---------------------------------------------------------------------------

export const hostApi = {
  async venues(hostId: string): Promise<HostVenue[]> {
    if (USE_MOCK) {
      return delay(
        HOST_VENUES.filter((v) => v.hostId === hostId),
        300
      );
    }
    return http<HostVenue[]>(`/api/host/${hostId}/venues`);
  },

  async ledger(): Promise<LedgerEntry[]> {
    if (USE_MOCK) return delay(LEDGER, 300);
    return http<LedgerEntry[]>("/api/host/ledger");
  },
};

// ---------------------------------------------------------------------------
// Tickets API
// ---------------------------------------------------------------------------

export const ticketsApi = {
  async mine(userId: string): Promise<Ticket[]> {
    if (USE_MOCK) {
      return delay(
        mockTickets.filter((t) => t.userId === userId),
        300
      );
    }
    const raw = await http<any[]>("/api/tickets/mine");
    return raw.map((t) => ({
      id: String(t.id ?? ""),
      eventId: String(t.eventId ?? ""),
      event: t.event ? mapEvent(t.event) : ({} as ProposedEvent),
      userId: String(t.userId ?? ""),
      holderName: t.holderName ?? "",
      qrCode: t.qrCode ?? t.ticketCode ?? "",
      status: (t.status?.toLowerCase?.() ?? "confirmed") as Ticket["status"],
      purchasedAt: t.purchasedAt ?? new Date().toISOString(),
      orderId: t.orderId ?? "",
      amount: typeof t.amountPaid === "number" ? t.amountPaid : Number(t.amountPaid ?? 0),
    }));
  },

  async create(input: {
    eventId: string;
    userId: string;
    holderName: string;
    orderId: string;
    amount: number;
  }): Promise<Ticket> {
    if (USE_MOCK) {
      const event =
        mockEvents.find((e) => e.id === input.eventId) || mockPendingEvents[0];
      const ticket: Ticket = {
        id: uid("tkt"),
        eventId: input.eventId,
        event: event,
        userId: input.userId,
        holderName: input.holderName,
        qrCode: `10SONLY-TKT-${input.eventId.slice(-4).toUpperCase()}-${uid("x").toUpperCase()}`,
        status: "confirmed",
        purchasedAt: new Date().toISOString(),
        orderId: input.orderId,
        amount: input.amount,
      };
      mockTickets = [ticket, ...mockTickets];
      // bump ticketsSold
      mockEvents = mockEvents.map((e) =>
        e.id === input.eventId ? { ...e, ticketsSold: e.ticketsSold + 1 } : e
      );
      return delay(ticket, 500);
    }
    return http<Ticket>("/api/tickets", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------

export const adminApi = {
  async stats(): Promise<AdminStats> {
    if (USE_MOCK) return delay(ADMIN_STATS, 300);
    return http<any>("/api/admin/stats").then(mapAdminStats);
  },

  async cityStats(): Promise<CityStat[]> {
    if (USE_MOCK) return delay(CITY_STATS, 300);
    return http<CityStat[]>("/api/admin/city-stats");
  },

  async ledger(): Promise<LedgerEntry[]> {
    if (USE_MOCK) return delay(LEDGER, 300);
    return http<LedgerEntry[]>("/api/admin/ledger");
  },

  async applications(): Promise<Application[]> {
    if (USE_MOCK) return delay(mockApplications, 300);
    return http<Application[]>("/api/admin/applications");
  },
};

// ---------------------------------------------------------------------------
// Confessions API
// ---------------------------------------------------------------------------

export const confessionsApi = {
  async list(): Promise<ConfessionView[]> {
    if (USE_MOCK) return delay(CONFESSIONS, 300);
    return http<ConfessionView[]>("/api/confessions");
  },

  async create(input: { body: string; vibe: EventVibe; city: City }): Promise<ConfessionView> {
    if (USE_MOCK) {
      const conf: ConfessionView = {
        id: uid("conf"),
        body: input.body,
        vibe: input.vibe,
        city: input.city,
        createdAt: new Date().toISOString(),
        hearts: 0,
        flagged: false,
      };
      return delay(conf, 400);
    }
    return http<ConfessionView>("/api/confessions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async heart(id: string): Promise<ConfessionView> {
    if (USE_MOCK) {
      return delay(
        {
          ...CONFESSIONS[0],
          id,
          hearts: CONFESSIONS[0].hearts + 1,
        },
        200
      );
    }
    return http<ConfessionView>(`/api/confessions/${id}/heart`, { method: "POST" });
  },
};

// ---------------------------------------------------------------------------
// Host Application API
// ---------------------------------------------------------------------------

export const hostAppApi = {
  async submit(input: HostApplicationInput, user: User): Promise<HostApplication> {
    if (USE_MOCK) {
      const app: HostApplication = {
        id: uid("host_app"),
        userId: user.id,
        user,
        collectiveName: input.collectiveName,
        bio: input.bio,
        city: input.city,
        portfolio: input.portfolio,
        socialLinks: input.socialLinks,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      mockHostApplications = [app, ...mockHostApplications];
      return delay(app, 600);
    }
    const instagram = input.socialLinks.find((s) => /insta/i.test(s.label))?.url;
    const soundcloud = input.socialLinks.find((s) => /soundcloud/i.test(s.label))?.url;
    return http<any>("/api/host-applications", {
      method: "POST",
      body: JSON.stringify({
        crewName: input.collectiveName,
        city: input.city,
        bio: input.bio,
        pastEvents: input.portfolio.join(" • "),
        instagram,
        soundcloud,
        whyHost: input.bio,
        sampleLineup: input.portfolio,
      }),
    }).then(mapHostApplication);
  },

  async mine(userId: string): Promise<HostApplication | null> {
    if (USE_MOCK) {
      const found =
        mockHostApplications.find((a) => a.userId === userId) || null;
      return delay(found, 200);
    }
    return http<any[]>("/api/host-applications/mine").then((apps) => {
      const found = apps.find((a) => String(a?.userId ?? "") === userId);
      return found ? mapHostApplication(found) : null;
    });
  },

  async list(): Promise<HostApplication[]> {
    if (USE_MOCK) return delay(mockHostApplications, 300);
    return http<any[]>("/api/host-applications").then((apps) =>
      apps.map(mapHostApplication)
    );
  },

  async review(
    id: string,
    decision: "approved" | "rejected" | "revision",
    note?: string
  ): Promise<HostApplication> {
    if (USE_MOCK) {
      const idx = mockHostApplications.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error("Host application not found");
      const updated: HostApplication = {
        ...mockHostApplications[idx],
        status: decision,
        reviewedAt: new Date().toISOString(),
        reviewerNote: note,
      };
      mockHostApplications[idx] = updated;
      // When approved, upgrade the applicant user's role to host.
      if (decision === "approved") {
        // Note: callers should also persist this via authStore.updateUser.
        if (updated.userId === CURRENT_USER.id) {
          CURRENT_USER.role = "host";
          CURRENT_USER.hostCollective = updated.collectiveName;
          CURRENT_USER.verified = true;
        }
      }
      return delay(updated, 500);
    }
    const normalizedDecision = decision === "revision" ? "interview" : decision;
    return http<any>(`/api/host-applications/${id}/review`, {
      method: "POST",
      body: JSON.stringify({
        status: normalizedDecision,
        reviewerNotes: note,
        decision,
        note,
      }),
    }).then(mapHostApplication);
  },
};

// ---------------------------------------------------------------------------
// Barrel
// ---------------------------------------------------------------------------

// Named exports are already defined on each API object above.
