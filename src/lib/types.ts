// ============================================================================
// 10s Only — Domain Types
// ============================================================================

export type ID = string;

// ---------------------------------------------------------------------------
// User & Roles
// ---------------------------------------------------------------------------

export type UserRole = "member" | "host" | "admin";

export interface User {
  id: ID;
  name: string;
  handle: string;
  email: string;
  phone?: string;
  avatar: string; // data URI / URL
  role: UserRole;
  city: City;
  bio?: string;
  joinedAt: string; // ISO date
  verified: boolean;
  // member vetting
  vibeAlignment?: number; // 0-100 alignment score, set after quiz
  rejectionReason?: string;
  // host specific
  hostCollective?: string;
  // admin specific
  adminTitle?: string;
}

// ---------------------------------------------------------------------------
// Membership Applications (vetting)
// ---------------------------------------------------------------------------

export type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "waitlisted";

export interface ApplicationAnswer {
  questionId: string;
  optionId: string;
}

export interface Application {
  id: ID;
  userId: ID;
  user?: User;
  status: ApplicationStatus;
  answers: ApplicationAnswer[];
  vibeAlignment: number;
  submittedAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type EventStatus =
  | "draft"
  | "pending"
  | "live"
  | "soldout"
  | "ended"
  | "cancelled";

export type EventVisibility = "public" | "members" | "private";

export type EventVibe =
  | "techno"
  | "house"
  | "drum-and-bass"
  | "experimental"
  | "hip-hop"
  | "ambient";

export type City =
  | "mumbai"
  | "delhi"
  | "bangalore"
  | "goa"
  | "pune"
  | "hyderabad";

export interface ProposedEvent {
  id: ID;
  hostId: ID;
  hostName: string;
  title: string;
  vibe: EventVibe;
  city: City;
  venue: string;
  address: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
  capacity: number;
  price: number; // INR
  description: string;
  lineup?: string;
  cover: string; // data URI
  visibility: EventVisibility;
  status: EventStatus;
  createdAt: string;
  ticketsSold: number;
  rejectionReason?: string;
  distanceKm?: number;
  latitude?: number;
  longitude?: number;
}

// ---------------------------------------------------------------------------
// Tickets & Payments
// ---------------------------------------------------------------------------

export interface Ticket {
  id: ID;
  eventId: ID;
  event: ProposedEvent;
  userId: ID;
  holderName: string;
  qrCode: string; // data URI / payload
  status: "confirmed" | "checked-in" | "refunded" | "cancelled";
  purchasedAt: string;
  orderId: ID;
  amount: number;
  seat?: string;
}

export interface RazorpayOrder {
  id: ID;
  entity: "order";
  amount: number; // paise
  amount_paid: number;
  amount_due: number;
  currency: "INR";
  receipt: string;
  status: "created" | "attempted" | "paid";
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayVerificationInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  eventId: string;
  amount: number;
  currency: "INR";
}

export interface RazorpayPaymentRecord {
  id: ID;
  orderId: ID;
  paymentId: string;
  signature: string;
  amount: number;
  currency: "INR";
  status: "captured" | "failed";
  method?: string;
  createdAt: string;
}

export interface RazorpayVerifyResponse {
  id: ID;
  orderId: ID;
  paymentId: string;
  signature: string;
  amount: number;
  currency: "INR";
  status: "captured" | "failed";
  ticketId?: string;
  verifiedAt: string;
}

// ---------------------------------------------------------------------------
// Hosts & Venues
// ---------------------------------------------------------------------------

export type HostApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revision";

export interface HostVenue {
  id: ID;
  hostId: ID;
  name: string;
  city: City;
  address: string;
  capacity: number;
  amenities: string[];
  photo: string; // data URI
  verified: boolean;
}

export interface HostApplication {
  id: ID;
  userId: ID;
  user: User;
  collectiveName: string;
  bio: string;
  city: City;
  portfolio: string[];
  socialLinks: { label: string; url: string }[];
  status: HostApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
}

export interface HostApplicationInput {
  collectiveName: string;
  bio: string;
  city: City;
  portfolio: string[];
  socialLinks: { label: string; url: string }[];
}

// ---------------------------------------------------------------------------
// Ledger & Admin
// ---------------------------------------------------------------------------

export interface LedgerEntry {
  id: ID;
  date: string;
  description: string;
  type: "revenue" | "refund" | "payout" | "expense";
  amount: number; // INR
  eventId?: ID;
  reference?: string;
}

export interface AdminStats {
  totalMembers: number;
  totalHosts: number;
  totalEvents: number;
  pendingApplications: number;
  pendingEvents: number;
  totalRevenue: number;
  ticketsSold: number;
  avgAlignment: number;
}

export interface CityStat {
  city: City;
  events: number;
  members: number;
  revenue: number;
}

// ---------------------------------------------------------------------------
// Confessions (anonymous)
// ---------------------------------------------------------------------------

export interface ConfessionView {
  id: ID;
  body: string;
  vibe: EventVibe;
  city: City;
  createdAt: string;
  hearts: number;
  flagged: boolean;
}
