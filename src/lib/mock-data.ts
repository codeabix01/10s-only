// ============================================================================
// 10s Only — Mock Data
// ============================================================================

import { getAvatar } from "./avatars";
import { getEventCover, getVibeColor } from "./event-covers";
import type {
  AdminStats,
  Application,
  ApplicationAnswer,
  City,
  CityStat,
  ConfessionView,
  EventVibe,
  HostVenue,
  LedgerEntry,
  ProposedEvent,
  Ticket,
  User,
} from "./types";

// Re-export so consumers can import from one place
export { getVibeColor };

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const CITY_LABELS: Record<City, string> = {
  mumbai: "Mumbai",
  delhi: "Delhi",
  bangalore: "Bangalore",
  goa: "Goa",
  pune: "Pune",
  hyderabad: "Hyderabad",
};

export const VIBE_LABELS: Record<EventVibe, string> = {
  techno: "Techno",
  house: "House",
  "drum-and-bass": "Drum & Bass",
  experimental: "Experimental",
  "hip-hop": "Hip-Hop",
  ambient: "Ambient",
};

// ---------------------------------------------------------------------------
// Vetting Quiz
// ---------------------------------------------------------------------------

export interface QuizQuestion {
  id: string;
  prompt: string;
  hint?: string;
  options: {
    id: string;
    label: string;
    vibeWeights: Partial<Record<EventVibe, number>>;
  }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "It's 2 AM. The bass just dropped. Where are you?",
    hint: "Pick the energy that calls to you.",
    options: [
      { id: "a", label: "Lost in the strobe, fists up, four-on-the-floor", vibeWeights: { techno: 3 } },
      { id: "b", label: "Gliding through a soulful, groovy haze", vibeWeights: { house: 3 } },
      { id: "c", label: "Skanking through a breakbeat jungle", vibeWeights: { "drum-and-bass": 3 } },
      { id: "d", label: "Floating in a fog of modular drones", vibeWeights: { experimental: 3, ambient: 1 } },
    ],
  },
  {
    id: "q2",
    prompt: "Your ideal venue is…",
    options: [
      { id: "a", label: "A concrete bunker with one red light", vibeWeights: { techno: 3, experimental: 1 } },
      { id: "b", label: "A rooftop with warm string lights", vibeWeights: { house: 3 } },
      { id: "c", label: "A warehouse with a 20k rig", vibeWeights: { "drum-and-bass": 3, techno: 1 } },
      { id: "d", label: "A planetarium, lying on the floor", vibeWeights: { ambient: 3 } },
    ],
  },
  {
    id: "q3",
    prompt: "Which line-up makes you text the group chat?",
    options: [
      { id: "a", label: "Three unnamed DJs, B2B till sunrise", vibeWeights: { techno: 3 } },
      { id: "b", label: "A groove-heavy resident + a disco selector", vibeWeights: { house: 3 } },
      { id: "c", label: "A neurofunk headliner + local MCs", vibeWeights: { "drum-and-bass": 3 } },
      { id: "d", label: "A live modular + tabla collaboration", vibeWeights: { experimental: 3, ambient: 1 } },
    ],
  },
  {
    id: "q4",
    prompt: "Your party superpower is…",
    options: [
      { id: "a", label: "Out-dancing everyone till the lights come on", vibeWeights: { techno: 2, house: 1 } },
      { id: "b", label: "Knowing every lyric to every bootleg", vibeWeights: { "hip-hop": 3 } },
      { id: "c", label: "Reading the room and shifting the tempo", vibeWeights: { house: 2, "drum-and-bass": 1 } },
      { id: "d", label: "Finding the one chill corner and holding court", vibeWeights: { ambient: 3 } },
    ],
  },
  {
    id: "q5",
    prompt: "Pick a city, pick a vibe.",
    options: [
      { id: "a", label: "Mumbai · warehouse techno", vibeWeights: { techno: 2 } },
      { id: "b", label: "Goa · beachside house", vibeWeights: { house: 2 } },
      { id: "c", label: "Delhi · underground hip-hop cypher", vibeWeights: { "hip-hop": 2 } },
      { id: "d", label: "Bangalore · experimental sound bath", vibeWeights: { experimental: 2, ambient: 1 } },
    ],
  },
];

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const CURRENT_USER: User = {
  id: "usr_aria_mehta",
  name: "Aria Mehta",
  handle: "aria.m",
  email: "aria.mehta@10sonly.club",
  phone: "+91 98200 11223",
  avatar: getAvatar("Aria Mehta"),
  role: "member",
  city: "mumbai",
  bio: "Designer by day, strobe-chaser by night. Here for the 4 AM moments.",
  joinedAt: "2024-09-12T18:30:00.000Z",
  verified: true,
  vibeAlignment: 87,
};

export const HOST_USER: User = {
  id: "usr_void_collective",
  name: "VOID Collective",
  handle: "voidcollective",
  email: "bookings@voidcollective.in",
  phone: "+91 90040 55667",
  avatar: getAvatar("VOID Collective"),
  role: "host",
  city: "mumbai",
  bio: "Underground techno collective. We build bunkers and break curfews.",
  joinedAt: "2023-03-04T20:00:00.000Z",
  verified: true,
  hostCollective: "VOID Collective",
};

export const ADMIN_USER: User = {
  id: "usr_admin_ops",
  name: "Operations",
  handle: "ops",
  email: "ops@10sonly.club",
  avatar: getAvatar("Operations"),
  role: "admin",
  city: "mumbai",
  bio: "Keeping the lights (dimly) on.",
  joinedAt: "2023-01-01T00:00:00.000Z",
  verified: true,
  adminTitle: "Head of Operations",
};

const APPLICANT_USERS: User[] = [
  {
    id: "usr_kabir_rao",
    name: "Kabir Rao",
    handle: "kabir.rao",
    email: "kabir.rao@example.com",
    avatar: getAvatar("Kabir Rao"),
    role: "member",
    city: "bangalore",
    bio: "Photographer, vinyl hoarder, DnB lifer.",
    joinedAt: "2025-01-22T10:15:00.000Z",
    verified: false,
  },
  {
    id: "usr_ananya_iyer",
    name: "Ananya Iyer",
    handle: "ananya.i",
    email: "ananya.iyer@example.com",
    avatar: getAvatar("Ananya Iyer"),
    role: "member",
    city: "delhi",
    bio: "Hip-hop head, writes for a music zine.",
    joinedAt: "2025-02-03T14:45:00.000Z",
    verified: false,
  },
  {
    id: "usr_dev_singh",
    name: "Dev Singh",
    handle: "dev.s",
    email: "dev.singh@example.com",
    avatar: getAvatar("Dev Singh"),
    role: "member",
    city: "goa",
    bio: "Beach bars and basslines.",
    joinedAt: "2025-02-18T09:00:00.000Z",
    verified: false,
  },
  {
    id: "usr_meera_nair",
    name: "Meera Nair",
    handle: "meera.n",
    email: "meera.nair@example.com",
    avatar: getAvatar("Meera Nair"),
    role: "member",
    city: "pune",
    bio: "Ambient curator. Candles optional.",
    joinedAt: "2025-03-01T11:30:00.000Z",
    verified: false,
  },
];

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

function buildAnswers(qIndices: number[]): ApplicationAnswer[] {
  return qIndices.map((qi, idx) => ({
    questionId: QUIZ_QUESTIONS[idx].id,
    optionId: QUIZ_QUESTIONS[idx].options[qi].id,
  }));
}

export const APPLICATIONS: Application[] = [
  {
    id: "app_kabir",
    userId: "usr_kabir_rao",
    user: APPLICANT_USERS[0],
    status: "pending",
    answers: buildAnswers([2, 2, 2, 2, 0]),
    vibeAlignment: 92,
    submittedAt: "2025-06-01T13:20:00.000Z",
  },
  {
    id: "app_ananya",
    userId: "usr_ananya_iyer",
    user: APPLICANT_USERS[1],
    status: "pending",
    answers: buildAnswers([3, 1, 2, 1, 2]),
    vibeAlignment: 78,
    submittedAt: "2025-06-05T08:10:00.000Z",
  },
  {
    id: "app_dev",
    userId: "usr_dev_singh",
    user: APPLICANT_USERS[2],
    status: "waitlisted",
    answers: buildAnswers([1, 1, 1, 2, 1]),
    vibeAlignment: 64,
    submittedAt: "2025-05-20T19:45:00.000Z",
    reviewedAt: "2025-05-28T12:00:00.000Z",
    reviewerNote: "Solid energy, but vibe alignment is borderline. Holding for next batch.",
  },
  {
    id: "app_meera",
    userId: "usr_meera_nair",
    user: APPLICANT_USERS[3],
    status: "approved",
    answers: buildAnswers([3, 3, 3, 3, 3]),
    vibeAlignment: 95,
    submittedAt: "2025-04-15T10:00:00.000Z",
    reviewedAt: "2025-04-18T16:00:00.000Z",
    reviewerNote: "Perfect fit for the ambient curation track.",
  },
  {
    id: "app_aria",
    userId: "usr_aria_mehta",
    user: CURRENT_USER,
    status: "approved",
    answers: buildAnswers([0, 0, 0, 0, 0]),
    vibeAlignment: 87,
    submittedAt: "2024-09-10T12:00:00.000Z",
    reviewedAt: "2024-09-12T18:30:00.000Z",
    reviewerNote: "Strong techno alignment. Welcome in.",
  },
];

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const EVENTS: ProposedEvent[] = [
  {
    id: "evt_void_017",
    hostId: "usr_void_collective",
    hostName: "VOID Collective",
    title: "BUNKER 017 — All Night Long",
    vibe: "techno",
    city: "mumbai",
    venue: "Subterrain Bunker",
    address: "Lower Parel, Mumbai",
    startsAt: "2025-07-12T22:00:00.000Z",
    endsAt: "2025-07-13T06:00:00.000Z",
    capacity: 220,
    price: 1800,
    description:
      "Eight hours, one room, no phones. A bunker built for the purest techno heads in the city. Strobe warning.",
    lineup: "VOID b2b PARALLAX · RHEA K · [unnamed closer]",
    cover: getEventCover("techno", "BUNKER 017 — All Night Long", "mumbai"),
    visibility: "members",
    status: "live",
    createdAt: "2025-06-10T12:00:00.000Z",
    ticketsSold: 168,
  },
  {
    id: "evt_halo_003",
    hostId: "usr_void_collective",
    hostName: "VOID Collective",
    title: "HALO — Rooftop House Sessions",
    vibe: "house",
    city: "goa",
    venue: "Halo Rooftop",
    address: "Anjuna, Goa",
    startsAt: "2025-07-19T17:00:00.000Z",
    endsAt: "2025-07-19T23:30:00.000Z",
    capacity: 180,
    price: 1500,
    description:
      "Golden hour grooves on a Goan rooftop. Disco, deep, and soulful house till the stars come out.",
    lineup: "SOL · MAYA R · resident AARYA",
    cover: getEventCover("house", "HALO — Rooftop House Sessions", "goa"),
    visibility: "public",
    status: "live",
    createdAt: "2025-06-12T09:00:00.000Z",
    ticketsSold: 142,
  },
  {
    id: "evt_jungle_009",
    hostId: "usr_void_collective",
    hostName: "VOID Collective",
    title: "JUNGLE FREQUENCY 009",
    vibe: "drum-and-bass",
    city: "bangalore",
    venue: "Frequency Warehouse",
    address: "Whitefield, Bangalore",
    startsAt: "2025-07-26T21:00:00.000Z",
    endsAt: "2025-07-27T03:00:00.000Z",
    capacity: 300,
    price: 1600,
    description:
      "A 20k rig, a fog machine that doesn't quit, and the sharpest DnB selectors in the south.",
    lineup: "NEURO M · KABIR R · MC VYBES",
    cover: getEventCover("drum-and-bass", "JUNGLE FREQUENCY 009", "bangalore"),
    visibility: "members",
    status: "live",
    createdAt: "2025-06-15T11:00:00.000Z",
    ticketsSold: 287,
  },
  {
    id: "evt_signal_002",
    hostId: "usr_void_collective",
    hostName: "VOID Collective",
    title: "SIGNAL//NOISE — Modular Sound Bath",
    vibe: "experimental",
    city: "bangalore",
    venue: "Planetarium Floor",
    address: "Indiranagar, Bangalore",
    startsAt: "2025-08-02T19:00:00.000Z",
    endsAt: "2025-08-02T22:00:00.000Z",
    capacity: 120,
    price: 1200,
    description:
      "Lie down. Look up. Three live modular synths score the cosmos. Headphones discouraged.",
    lineup: "ASTER · FIELD/REC · SPECIAL GUEST",
    cover: getEventCover("experimental", "SIGNAL//NOISE — Modular Sound Bath", "bangalore"),
    visibility: "private",
    status: "live",
    createdAt: "2025-06-18T15:00:00.000Z",
    ticketsSold: 64,
  },
  {
    id: "evt_cipher_004",
    hostId: "usr_void_collective",
    hostName: "VOID Collective",
    title: "CIPHER NIGHTS — Underground Hip-Hop",
    vibe: "hip-hop",
    city: "delhi",
    venue: "Basement 0",
    address: "Hauz Khas, Delhi",
    startsAt: "2025-08-09T20:00:00.000Z",
    endsAt: "2025-08-10T01:00:00.000Z",
    capacity: 150,
    price: 1000,
    description:
      "Open cypher, three featured MCs, and a producer battle. Bring bars.",
    lineup: "ANANYA I · PROD BY K · THE CIPHER COUNCIL",
    cover: getEventCover("hip-hop", "CIPHER NIGHTS — Underground Hip-Hop", "delhi"),
    visibility: "members",
    status: "live",
    createdAt: "2025-06-20T13:00:00.000Z",
    ticketsSold: 98,
  },
  {
    id: "evt_drift_001",
    hostId: "usr_void_collective",
    hostName: "VOID Collective",
    title: "DRIFT — Ambient All-Nighter",
    vibe: "ambient",
    city: "pune",
    venue: "The Still Room",
    address: "Koregaon Park, Pune",
    startsAt: "2025-08-16T23:00:00.000Z",
    endsAt: "2025-08-17T06:00:00.000Z",
    capacity: 90,
    price: 1400,
    description:
      "Six hours of drone, tape loops, and field recordings. No talking after midnight.",
    lineup: "MEERA N · SLOW CHURCH · DAWN SET",
    cover: getEventCover("ambient", "DRIFT — Ambient All-Nighter", "pune"),
    visibility: "members",
    status: "soldout",
    createdAt: "2025-06-22T10:00:00.000Z",
    ticketsSold: 90,
  },
];

// ---------------------------------------------------------------------------
// Host venues
// ---------------------------------------------------------------------------

export const HOST_VENUES: HostVenue[] = [
  {
    id: "ven_subterrain",
    hostId: "usr_void_collective",
    name: "Subterrain Bunker",
    city: "mumbai",
    address: "Lower Parel, Mumbai",
    capacity: 220,
    amenities: ["Funktion-One rig", "Strobe rig", "Coat check", "No-phone policy"],
    photo: getEventCover("techno", "Subterrain Bunker", "mumbai"),
    verified: true,
  },
  {
    id: "ven_halo",
    hostId: "usr_void_collective",
    name: "Halo Rooftop",
    city: "goa",
    address: "Anjuna, Goa",
    capacity: 180,
    amenities: ["Open sky", "Sunset deck", "Cocktail bar", "Vinyl only"],
    photo: getEventCover("house", "Halo Rooftop", "goa"),
    verified: true,
  },
  {
    id: "ven_frequency",
    hostId: "usr_void_collective",
    name: "Frequency Warehouse",
    city: "bangalore",
    address: "Whitefield, Bangalore",
    capacity: 300,
    amenities: ["20k rig", "Fog system", "Laser grid", "Late licence"],
    photo: getEventCover("drum-and-bass", "Frequency Warehouse", "bangalore"),
    verified: true,
  },
  {
    id: "ven_planetarium",
    hostId: "usr_void_collective",
    name: "Planetarium Floor",
    city: "bangalore",
    address: "Indiranagar, Bangalore",
    capacity: 120,
    amenities: ["Dome projection", "Surround sound", "Floor cushions", "Tea service"],
    photo: getEventCover("experimental", "Planetarium Floor", "bangalore"),
    verified: false,
  },
  {
    id: "ven_basement0",
    hostId: "usr_void_collective",
    name: "Basement 0",
    city: "delhi",
    address: "Hauz Khas, Delhi",
    capacity: 150,
    amenities: ["Live PA", "Turntables", "Cypher circle", "Late bar"],
    photo: getEventCover("hip-hop", "Basement 0", "delhi"),
    verified: true,
  },
  {
    id: "ven_stillroom",
    hostId: "usr_void_collective",
    name: "The Still Room",
    city: "pune",
    address: "Koregaon Park, Pune",
    capacity: 90,
    amenities: ["Quad speakers", "Tape loops", "No-talking zone", "Herbal tea bar"],
    photo: getEventCover("ambient", "The Still Room", "pune"),
    verified: true,
  },
];

// ---------------------------------------------------------------------------
// Ledger
// ---------------------------------------------------------------------------

export const LEDGER: LedgerEntry[] = [
  {
    id: "led_001",
    date: "2025-06-12",
    description: "Ticket sales — BUNKER 017 (168 × ₹1,800)",
    type: "revenue",
    amount: 302400,
    eventId: "evt_void_017",
    reference: "RAZ-PAY-88412",
  },
  {
    id: "led_002",
    date: "2025-06-13",
    description: "Payout — VOID Collective (BUNKER 017, 70%)",
    type: "payout",
    amount: 211680,
    eventId: "evt_void_017",
    reference: "PO-2025-06-001",
  },
  {
    id: "led_003",
    date: "2025-06-14",
    description: "Ticket sales — HALO 003 (142 × ₹1,500)",
    type: "revenue",
    amount: 213000,
    eventId: "evt_halo_003",
    reference: "RAZ-PAY-88455",
  },
  {
    id: "led_004",
    date: "2025-06-15",
    description: "Refund — HALO 003 (2 tickets)",
    type: "refund",
    amount: 3000,
    eventId: "evt_halo_003",
    reference: "RF-2025-06-009",
  },
  {
    id: "led_005",
    date: "2025-06-16",
    description: "Platform fee collection (3% across live events)",
    type: "revenue",
    amount: 15482,
    reference: "FEE-2025-06",
  },
  {
    id: "led_006",
    date: "2025-06-17",
    description: "Expense — Strobe rig rental (BUNKER 017)",
    type: "expense",
    amount: 18000,
    eventId: "evt_void_017",
    reference: "EXP-2025-06-014",
  },
  {
    id: "led_007",
    date: "2025-06-18",
    description: "Ticket sales — JUNGLE FREQUENCY 009 (287 × ₹1,600)",
    type: "revenue",
    amount: 459200,
    eventId: "evt_jungle_009",
    reference: "RAZ-PAY-88521",
  },
];

// ---------------------------------------------------------------------------
// Confessions
// ---------------------------------------------------------------------------

export const CONFESSIONS: ConfessionView[] = [
  {
    id: "conf_001",
    body: "Someone proposed at BUNKER 017 in the middle of a 138 BPM drop. She said yes. We all cried in strobe light. Iconic.",
    vibe: "techno",
    city: "mumbai",
    createdAt: "2025-07-13T07:12:00.000Z",
    hearts: 312,
    flagged: false,
  },
  {
    id: "conf_002",
    body: "Lost my phone, my friends, and my inhibitions at HALO. Found all three at sunrise. Goa does that to you.",
    vibe: "house",
    city: "goa",
    createdAt: "2025-07-19T23:48:00.000Z",
    hearts: 188,
    flagged: false,
  },
  {
    id: "conf_003",
    body: "The MC at JUNGLE FREQUENCY freestyled my name into a neurofunk drop. I will never recover. Thank you.",
    vibe: "drum-and-bass",
    city: "bangalore",
    createdAt: "2025-07-27T03:22:00.000Z",
    hearts: 247,
    flagged: false,
  },
];

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------

export const TICKETS: Ticket[] = [
  {
    id: "tkt_aria_017",
    eventId: "evt_void_017",
    event: EVENTS[0],
    userId: "usr_aria_mehta",
    holderName: "Aria Mehta",
    qrCode: "10SONLY-TKT-017-ARIA-7X9K2",
    status: "confirmed",
    purchasedAt: "2025-06-11T14:22:00.000Z",
    orderId: "order_88412ARIA",
    amount: 1800,
    seat: "GA — Strobe Zone",
  },
];

// ---------------------------------------------------------------------------
// Admin dashboard
// ---------------------------------------------------------------------------

export const ADMIN_STATS: AdminStats = {
  totalMembers: 1842,
  totalHosts: 14,
  totalEvents: 47,
  pendingApplications: 23,
  pendingEvents: 5,
  totalRevenue: 2840310,
  ticketsSold: 1984,
  avgAlignment: 81,
};

export const CITY_STATS: CityStat[] = [
  { city: "mumbai", events: 14, members: 612, revenue: 1184000 },
  { city: "goa", events: 9, members: 287, revenue: 540300 },
  { city: "bangalore", events: 11, members: 481, revenue: 612400 },
  { city: "delhi", events: 7, members: 298, revenue: 312800 },
  { city: "pune", events: 4, members: 102, revenue: 124600 },
  { city: "hyderabad", events: 2, members: 62, revenue: 66210 },
];
