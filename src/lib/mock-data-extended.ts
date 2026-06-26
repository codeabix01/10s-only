// ============================================================================
// 10s Only — Extended Mock Data (host applications + pending events)
// ============================================================================

import { getAvatar } from "./avatars";
import { getEventCover } from "./event-covers";
import { CURRENT_USER } from "./mock-data";
import type {
  HostApplication,
  ProposedEvent,
  User,
} from "./types";

// ---------------------------------------------------------------------------
// Extra users for host applications
// ---------------------------------------------------------------------------

const HOST_APPLICANT_USERS: User[] = [
  {
    id: "usr_pulse_collective",
    name: "Pulse Collective",
    handle: "pulsecollective",
    email: "hello@pulsecollective.in",
    avatar: getAvatar("Pulse Collective"),
    role: "member",
    city: "delhi",
    bio: "House & disco curators. Three residents, one rooftop, endless groove.",
    joinedAt: "2024-11-02T20:00:00.000Z",
    verified: false,
  },
  {
    id: "usr_low_freq",
    name: "Low Frequency",
    handle: "lowfreq",
    email: "bookings@lowfreq.in",
    avatar: getAvatar("Low Frequency"),
    role: "member",
    city: "hyderabad",
    bio: "Bass music night. DnB, jungle, and the occasional half-time surprise.",
    joinedAt: "2025-01-15T19:00:00.000Z",
    verified: false,
  },
];

// ---------------------------------------------------------------------------
// Host applications
// ---------------------------------------------------------------------------

export const HOST_APPLICATIONS: HostApplication[] = [
  {
    id: "host_app_aria",
    userId: "usr_aria_mehta",
    user: CURRENT_USER,
    collectiveName: "STROBE BUREAU",
    bio: "Aria + two ex-residents from Mumbai's warehouse circuit. We curate small-room techno with a no-phones, no-photos policy.",
    city: "mumbai",
    portfolio: [
      "Loft Series — 6 invite-only loft nights, 2024",
      "Subterrain guest curation — 3 B2B slots",
      "Design lead for VOID Collective artwork (12 months)",
    ],
    socialLinks: [
      { label: "Instagram", url: "https://instagram.com/strobe.bureau" },
      { label: "SoundCloud", url: "https://soundcloud.com/strobe-bureau" },
    ],
    status: "pending",
    submittedAt: "2025-06-20T11:30:00.000Z",
  },
  {
    id: "host_app_pulse",
    userId: "usr_pulse_collective",
    user: HOST_APPLICANT_USERS[0],
    collectiveName: "Pulse Collective",
    bio: "House & disco curators based in Delhi. Three residents, one rooftop, endless groove. Looking to scale to ticketed nights.",
    city: "delhi",
    portfolio: [
      "Rooftop Rituals — 4 private sessions, 2024",
      "Guest mix series — 12 episodes",
      "Hauz Khas residency — 3 months",
    ],
    socialLinks: [
      { label: "Instagram", url: "https://instagram.com/pulsecollective" },
      { label: "Mixcloud", url: "https://mixcloud.com/pulsecollective" },
    ],
    status: "pending",
    submittedAt: "2025-06-22T16:45:00.000Z",
  },
  {
    id: "host_app_lowfreq",
    userId: "usr_low_freq",
    user: HOST_APPLICANT_USERS[1],
    collectiveName: "Low Frequency",
    bio: "Bass music night out of Hyderabad. DnB, jungle, and the occasional half-time surprise. Hungry for a proper ticketed home.",
    city: "hyderabad",
    portfolio: [
      "Bass Lab — 5 free-entry nights, 2024",
      "Guest selector — Jungle Frequency 006",
      "Hyderabad DnB map — co-author",
    ],
    socialLinks: [
      { label: "Instagram", url: "https://instagram.com/lowfreq.in" },
      { label: "Bandcamp", url: "https://lowfreq.bandcamp.com" },
    ],
    status: "revision",
    submittedAt: "2025-05-28T10:00:00.000Z",
    reviewedAt: "2025-06-05T15:30:00.000Z",
    reviewerNote: "Great energy, but we need proof of a 150+ capacity venue before approval. Please resubmit with a confirmed venue letter.",
  },
];

// ---------------------------------------------------------------------------
// Pending events (drafts awaiting admin approval)
// ---------------------------------------------------------------------------

export const PENDING_EVENTS: ProposedEvent[] = [
  {
    id: "evt_pending_subterra_018",
    hostId: "usr_void_collective",
    hostName: "VOID Collective",
    title: "BUNKER 018 — Closing Night",
    vibe: "techno",
    city: "mumbai",
    venue: "Subterrain Bunker",
    address: "Lower Parel, Mumbai",
    startsAt: "2025-08-30T22:00:00.000Z",
    endsAt: "2025-08-31T06:00:00.000Z",
    capacity: 220,
    price: 2000,
    description:
      "Season finale at the bunker. Harder, faster, one room, no phones. Last one out kills the strobe.",
    lineup: "VOID · PARALLAX · RHEA K · [closer TBA]",
    cover: getEventCover("techno", "BUNKER 018 — Closing Night", "mumbai"),
    visibility: "members",
    status: "draft",
    createdAt: "2025-06-25T09:00:00.000Z",
    ticketsSold: 0,
  },
  {
    id: "evt_pending_crypt",
    hostId: "usr_void_collective",
    hostName: "VOID Collective",
    title: "CRYPT — Late Night Hip-Hop",
    vibe: "hip-hop",
    city: "delhi",
    venue: "Basement 0",
    address: "Hauz Khas, Delhi",
    startsAt: "2025-09-06T21:00:00.000Z",
    endsAt: "2025-09-07T02:00:00.000Z",
    capacity: 150,
    price: 1200,
    description:
      "Producer battle, three featured MCs, open cypher till close. Bring bars, leave egos.",
    lineup: "ANANYA I · THE CIPHER COUNCIL · open mic",
    cover: getEventCover("hip-hop", "CRYPT — Late Night Hip-Hop", "delhi"),
    visibility: "members",
    status: "pending",
    createdAt: "2025-06-26T13:30:00.000Z",
    ticketsSold: 0,
  },
];
