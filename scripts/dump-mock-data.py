#!/usr/bin/env python3
"""
10s Only — MongoDB Atlas Data Dump Script
==========================================

This script dumps all mock/demo data into your MongoDB Atlas cluster.

HOW TO RUN (on your local machine):
  1. Install Python 3.10+
  2. pip install pymongo certifi
  3. python3 dump-mock-data.py

The script will:
  - Connect to your MongoDB Atlas cluster
  - Drop existing collections (if any)
  - Insert 32 documents across 8 collections
  - Verify the data was written

Collections populated:
  - users (3): member, host, admin
  - events (6): BLACKLIGHT, Sunrise Garage, Subterranean, Velvet Hours, AFRO RHYTHMS, STATIC
  - applications (5): 2 approved, 2 pending, 1 rejected
  - host_venues (6): venues across 5 cities
  - ledger (7): ticket sales, fees, payouts, refunds
  - confessions (3): anonymous event confessions
  - tickets (1): confirmed ticket for Aria
  - host_applications (3): 2 pending, 1 approved

After running this, start the Spring Boot backend and it will read from the same database.
"""
import pymongo
import os
import sys
import uuid
from datetime import datetime, timezone, timedelta

try:
    import certifi
    TLS_CA_FILE = certifi.where()
except ImportError:
    TLS_CA_FILE = None

# Read MongoDB URI from environment to avoid committing credentials.
MONGO_URI = os.getenv("MONGODB_URI", "").strip()

if not MONGO_URI:
    print("❌ Missing MONGODB_URI environment variable.")
    print("Set it before running, for example:")
    print("  export MONGODB_URI='mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority'")
    sys.exit(1)

print("=" * 60)
print("  10s Only — MongoDB Atlas Data Dump")
print("=" * 60)
print("\nConnecting to MongoDB Atlas using MONGODB_URI from environment...\n")

try:
    client_kwargs = {"serverSelectionTimeoutMS": 15000}
    if TLS_CA_FILE is not None:
        client_kwargs["tlsCAFile"] = TLS_CA_FILE
    CLIENT = pymongo.MongoClient(MONGO_URI, **client_kwargs)
    CLIENT.admin.command('ping')
    print("✅ Connected to MongoDB Atlas!\n")
except Exception as e:
    print("❌ Failed to connect: {}".format(e))
    if TLS_CA_FILE is None:
        print("\nHint: install certifi with `pip install certifi` to provide a local CA bundle for SSL verification.")
    sys.exit(1)

DB = CLIENT.tensonly

# Drop existing data
print("Dropping existing collections...")
for col_name in ["users", "events", "applications", "host_venues", "ledger",
                  "confessions", "tickets", "host_applications"]:
    DB[col_name].drop()
    print(f"  Dropped {col_name}")

now = datetime.now(timezone.utc)
def iso(days_offset=0, hours=0):
    return now + timedelta(days=days_offset, hours=hours)

# ========== USERS ==========
print("\n--- Seeding USERS ---")
users = [
    {
        "_id": str(uuid.uuid4()),
        "emailOrPhone": "aria.mehta@10sonly.club",
        "passwordHash": "$2a$10$demoBcryptHashPlaceholderAriaMehta1234567890123",
        "name": "Aria Mehta",
        "role": "MEMBER",
        "approved": True,
        "bio": "Brand strategist. Berlin-relocated. Lives for warehouse techno and 4am finishes.",
        "avatarUrl": None,
        "city": "mumbai",
        "instagram": "@aria.in.transit",
        "linkedin": None,
        "occupation": "Brand strategist",
        "age": 26,
        "gender": "FEMALE",
        "loyaltyPoints": 1240,
        "attendedCount": 14,
        "hostSince": None,
        "createdAt": iso(-60),
    },
    {
        "_id": str(uuid.uuid4()),
        "emailOrPhone": "bookings@voidcollective.in",
        "passwordHash": "$2a$10$demoBcryptHashPlaceholderVoidCollective1234567",
        "name": "VOID Collective",
        "role": "HOST",
        "approved": True,
        "bio": "Curators of warehouse techno across Mumbai and Pune. Six years deep.",
        "avatarUrl": None,
        "city": "mumbai",
        "instagram": "@void.collective",
        "linkedin": None,
        "occupation": "Event host",
        "age": None,
        "gender": None,
        "loyaltyPoints": 0,
        "attendedCount": 0,
        "hostSince": iso(-365 * 6),
        "createdAt": iso(-365 * 6),
    },
    {
        "_id": str(uuid.uuid4()),
        "emailOrPhone": "ops@10sonly.club",
        "passwordHash": "$2a$10$demoBcryptHashPlaceholderAdminOps999999999999",
        "name": "Operations",
        "role": "ADMIN",
        "approved": True,
        "bio": "Platform operations team.",
        "avatarUrl": None,
        "city": "mumbai",
        "instagram": None,
        "linkedin": None,
        "occupation": "Admin",
        "age": None,
        "gender": None,
        "loyaltyPoints": 0,
        "attendedCount": 0,
        "hostSince": None,
        "createdAt": iso(-730),
    },
]
DB.users.insert_many(users)
member_id = users[0]["_id"]
host_id = users[1]["_id"]
admin_id = users[2]["_id"]
print(f"  ✅ Inserted {len(users)} users")

# ========== EVENTS ==========
print("\n--- Seeding EVENTS ---")
events = [
    {
        "_id": str(uuid.uuid4()),
        "title": "BLACKLIGHT // Warehousing the Void",
        "vibe": "TECHNO",
        "city": "mumbai",
        "venueName": "Todi Mill Vaults",
        "venueAddress": "Mathuradas Mill Compound, Lower Parel, Mumbai",
        "venueCapacity": 320,
        "startAt": iso(3),
        "endAt": iso(3, 7),
        "ticketPrice": 2500,
        "totalTickets": 280,
        "ticketsSold": 187,
        "revenue": 467500,
        "description": "Six hours of peak-time industrial techno under a 40k blacklight rig. Sound by VOID Acoustics. Strict door policy — confirmed members only. Phones sealed at entry.",
        "lineup": ["DEKKT (Live)", "AVA", "RIAN S", "NEBULA B2B KAEL"],
        "coverImage": None,
        "visibility": "MEMBERS_ONLY",
        "status": "LIVE",
        "hostId": host_id,
        "hostName": "VOID Collective",
        "createdAt": iso(-14),
    },
    {
        "_id": str(uuid.uuid4()),
        "title": "Sunrise Garage // Beach Edition",
        "vibe": "HOUSE",
        "city": "goa",
        "venueName": "Coco Beach Shack",
        "venueAddress": "Candolim, Goa",
        "venueCapacity": 180,
        "startAt": iso(9),
        "endAt": iso(9, 5),
        "ticketPrice": 1800,
        "totalTickets": 160,
        "ticketsSold": 142,
        "revenue": 255600,
        "description": "UK garage, broken beat, and 2-step from 4am til sunrise on the sand. Light breakfast included. Limited capacity — intimacy first.",
        "lineup": ["JEMMA HART", "SUNDAY ROAST B2B OCEANIC", "KOA"],
        "coverImage": None,
        "visibility": "PUBLIC",
        "status": "LIVE",
        "hostId": host_id,
        "hostName": "VOID Collective",
        "createdAt": iso(-7),
    },
    {
        "_id": str(uuid.uuid4()),
        "title": "Subterranean // Drum & Bass Night",
        "vibe": "UNDERGROUND",
        "city": "bangalore",
        "venueName": "CounterCulture Vault",
        "venueAddress": "Whitefield, Bangalore",
        "venueCapacity": 240,
        "startAt": iso(14),
        "endAt": iso(14, 8),
        "ticketPrice": 2200,
        "totalTickets": 220,
        "ticketsSold": 220,
        "revenue": 484000,
        "description": "Liquid, neurofunk and jungle across two rooms. Sub-bass calibrated to 30Hz. No phones beyond the cloakroom. Photography by invite only.",
        "lineup": ["OSPREY", "MIG-29", "KHUSHI B2B AARYA", "RIFT"],
        "coverImage": None,
        "visibility": "MEMBERS_ONLY",
        "status": "LIVE",
        "hostId": host_id,
        "hostName": "VOID Collective",
        "createdAt": iso(-21),
    },
    {
        "_id": str(uuid.uuid4()),
        "title": "Velvet Hours // Disco Revival",
        "vibe": "RETRO",
        "city": "delhi",
        "venueName": "Kitty Su Lounge",
        "venueAddress": "Aerocity, New Delhi",
        "venueCapacity": 200,
        "startAt": iso(18),
        "endAt": iso(18, 6),
        "ticketPrice": 3000,
        "totalTickets": 180,
        "ticketsSold": 156,
        "revenue": 468000,
        "description": "Italo, nu-disco and boogie on a custom Funktion-One stack. Mirrored floor. Champagne wall. Dress to impress — door turns away athleisure.",
        "lineup": ["PRINCE LADYBUG", "SOFIA KOLESNIK", "THE GROOVE COMMISSION"],
        "coverImage": None,
        "visibility": "INVITE_ONLY",
        "status": "LIVE",
        "hostId": host_id,
        "hostName": "VOID Collective",
        "createdAt": iso(-10),
    },
    {
        "_id": str(uuid.uuid4()),
        "title": "AFRO RHYTHMS // Roots & Resistance",
        "vibe": "AFRO",
        "city": "pune",
        "venueName": "High Spirits Underground",
        "venueAddress": "Koregaon Park, Pune",
        "venueCapacity": 260,
        "startAt": iso(22),
        "endAt": iso(22, 7),
        "ticketPrice": 2000,
        "totalTickets": 240,
        "ticketsSold": 198,
        "revenue": 396000,
        "description": "Afro-house, amapiano, and gqom all night long. Live percussion from the Sahel. Hand-painted visuals by Studio Bandra. A celebration of the diasporic dancefloor.",
        "lineup": ["DJUNA", "KOFI MENSAH B2B LIORA", "TENDAI", "RAS K"],
        "coverImage": None,
        "visibility": "MEMBERS_ONLY",
        "status": "LIVE",
        "hostId": host_id,
        "hostName": "VOID Collective",
        "createdAt": iso(-5),
    },
    {
        "_id": str(uuid.uuid4()),
        "title": "STATIC // Experimental Sound Bath",
        "vibe": "EXPERIMENTAL",
        "city": "mumbai",
        "venueName": "Goa Salon 41",
        "venueAddress": "Bandra West, Mumbai",
        "venueCapacity": 80,
        "startAt": iso(28),
        "endAt": iso(28, 4),
        "ticketPrice": 3500,
        "totalTickets": 70,
        "ticketsSold": 64,
        "revenue": 224000,
        "description": "A four-hour durational piece — modular synths, field recordings, and live coding. No conversation from 11pm to 3am. Headphones optional. Bring a mat.",
        "lineup": ["RIVERA", "ENSEMBLE NULL", "ANA T."],
        "coverImage": None,
        "visibility": "INVITE_ONLY",
        "status": "LIVE",
        "hostId": host_id,
        "hostName": "VOID Collective",
        "createdAt": iso(-3),
    },
]
DB.events.insert_many(events)
print(f"  ✅ Inserted {len(events)} events")
for e in events:
    print(f"     - {e['title']} | {e['vibe']} | {e['city']} | ₹{e['ticketPrice']}")

# ========== APPLICATIONS ==========
print("\n--- Seeding APPLICATIONS ---")
applications = [
    {
        "_id": str(uuid.uuid4()),
        "fullName": "Aria Mehta",
        "emailOrPhone": "aria.meh@gmail.com",
        "age": 26,
        "gender": "FEMALE",
        "city": "mumbai",
        "instagram": "@aria.in.transit",
        "linkedin": None,
        "occupation": "Brand strategist",
        "whyJoin": "I moved back from Berlin last year and the Mumbai scene feels too safe. I miss the warehouse chaos and the 6am phone-free zones. Looking for a crew that takes the music seriously.",
        "favoriteVibe": "TECHNO",
        "referralCode": None,
        "quizAnswersJson": '{"q1":0,"q2":1,"q3":0,"q4":0,"q5":0}',
        "quizScore": 92,
        "status": "APPROVED",
        "submittedAt": iso(-12),
        "reviewedAt": iso(-9),
        "reviewerNotes": "Berlin-relocated. Strong social signal. Approved.",
        "reviewerId": admin_id,
    },
    {
        "_id": str(uuid.uuid4()),
        "fullName": "Karan Iyer",
        "emailOrPhone": "karan.iyer@protonmail.com",
        "age": 31,
        "gender": "MALE",
        "city": "bangalore",
        "instagram": "@lowpass.karan",
        "linkedin": None,
        "occupation": "Sound engineer",
        "whyJoin": "I run a small studio in Indiranagar and DJ on weekends. I want to play in front of people who actually listen. Your DnB nights are exactly what I'm looking for.",
        "favoriteVibe": "UNDERGROUND",
        "referralCode": None,
        "quizAnswersJson": '{"q1":2,"q2":2,"q3":0,"q4":0,"q5":0}',
        "quizScore": 88,
        "status": "APPROVED",
        "submittedAt": iso(-15),
        "reviewedAt": iso(-11),
        "reviewerNotes": "Industry adjacent. Approve + invite to host mix submission.",
        "reviewerId": admin_id,
    },
    {
        "_id": str(uuid.uuid4()),
        "fullName": "Tara Singh",
        "emailOrPhone": "+919876543210",
        "age": 24,
        "gender": "NON_BINARY",
        "city": "goa",
        "instagram": "@tara.freq",
        "linkedin": None,
        "occupation": "Visual artist",
        "whyJoin": "I paint murals at festival sites and live for sunrise sets. I want to be in rooms where people take care of each other and the music comes first. Always.",
        "favoriteVibe": "HOUSE",
        "referralCode": None,
        "quizAnswersJson": '{"q1":1,"q2":3,"q3":1,"q4":1,"q5":1}',
        "quizScore": 79,
        "status": "PENDING",
        "submittedAt": iso(-2),
        "reviewedAt": None,
        "reviewerNotes": None,
        "reviewerId": None,
    },
    {
        "_id": str(uuid.uuid4()),
        "fullName": "Dev Raghunathan",
        "emailOrPhone": "dev.r@outlook.com",
        "age": 29,
        "gender": "MALE",
        "city": "delhi",
        "instagram": None,
        "linkedin": None,
        "occupation": "Investment banker",
        "whyJoin": "Looking to network with interesting people in a cool setting. Big fan of EDM festivals.",
        "favoriteVibe": "HOUSE",
        "referralCode": None,
        "quizAnswersJson": '{"q1":1,"q2":0,"q3":2,"q4":3,"q5":1}',
        "quizScore": 41,
        "status": "REJECTED",
        "submittedAt": iso(-8),
        "reviewedAt": iso(-7),
        "reviewerNotes": "Misaligned vibe. Reject.",
        "reviewerId": admin_id,
    },
    {
        "_id": str(uuid.uuid4()),
        "fullName": "Noor Khan",
        "emailOrPhone": "noor.khan@gmail.com",
        "age": 27,
        "gender": "FEMALE",
        "city": "pune",
        "instagram": "@noor.on.loop",
        "linkedin": None,
        "occupation": "Architect",
        "whyJoin": "I design spaces and I am obsessed with the architecture of a good night — the door, the cloakroom, the moment the second room opens. I want to be a part of that craft.",
        "favoriteVibe": "AFRO",
        "referralCode": None,
        "quizAnswersJson": '{"q1":3,"q2":2,"q3":3,"q4":3,"q5":2}',
        "quizScore": 84,
        "status": "PENDING",
        "submittedAt": iso(-1),
        "reviewedAt": None,
        "reviewerNotes": None,
        "reviewerId": None,
    },
]
DB.applications.insert_many(applications)
print(f"  ✅ Inserted {len(applications)} applications")

# ========== HOST VENUES ==========
print("\n--- Seeding HOST_VENUES ---")
venues = [
    {"_id": str(uuid.uuid4()), "name": "Todi Mill Vaults", "city": "mumbai", "address": "Mathuradas Mill Compound, Lower Parel", "capacity": 320, "pastEventsCount": 14, "rating": 4.9},
    {"_id": str(uuid.uuid4()), "name": "Coco Beach Shack", "city": "goa", "address": "Candolim Beach Road", "capacity": 180, "pastEventsCount": 8, "rating": 4.7},
    {"_id": str(uuid.uuid4()), "name": "CounterCulture Vault", "city": "bangalore", "address": "Whitefield Main Road", "capacity": 240, "pastEventsCount": 22, "rating": 4.8},
    {"_id": str(uuid.uuid4()), "name": "Kitty Su Lounge", "city": "delhi", "address": "Aerocity", "capacity": 200, "pastEventsCount": 11, "rating": 4.6},
    {"_id": str(uuid.uuid4()), "name": "High Spirits Underground", "city": "pune", "address": "Koregaon Park", "capacity": 260, "pastEventsCount": 18, "rating": 4.7},
    {"_id": str(uuid.uuid4()), "name": "Goa Salon 41", "city": "mumbai", "address": "Bandra West", "capacity": 80, "pastEventsCount": 6, "rating": 4.9},
]
DB.host_venues.insert_many(venues)
print(f"  ✅ Inserted {len(venues)} venues")

# ========== LEDGER ==========
print("\n--- Seeding LEDGER ---")
ledger = [
    {"_id": str(uuid.uuid4()), "eventId": events[0]["_id"], "eventTitle": events[0]["title"], "type": "TICKET_SALE", "amount": 2500, "currency": "INR", "description": "Ticket #T-1894 sold", "timestamp": iso(0, -1)},
    {"_id": str(uuid.uuid4()), "eventId": events[0]["_id"], "eventTitle": events[0]["title"], "type": "TICKET_SALE", "amount": 2500, "currency": "INR", "description": "Ticket #T-1893 sold", "timestamp": iso(0, -2)},
    {"_id": str(uuid.uuid4()), "eventId": events[1]["_id"], "eventTitle": events[1]["title"], "type": "TICKET_SALE", "amount": 1800, "currency": "INR", "description": "Ticket #T-1422 sold", "timestamp": iso(0, -3)},
    {"_id": str(uuid.uuid4()), "eventId": events[0]["_id"], "eventTitle": events[0]["title"], "type": "PLATFORM_FEE", "amount": -125, "currency": "INR", "description": "Platform fee (5%)", "timestamp": iso(0, -4)},
    {"_id": str(uuid.uuid4()), "eventId": events[2]["_id"], "eventTitle": events[2]["title"], "type": "PAYOUT", "amount": -480000, "currency": "INR", "description": "Payout to VOID Collective", "timestamp": iso(-2)},
    {"_id": str(uuid.uuid4()), "eventId": events[1]["_id"], "eventTitle": events[1]["title"], "type": "REFUND", "amount": -1800, "currency": "INR", "description": "Refund to T-1389 (medical)", "timestamp": iso(-3)},
    {"_id": str(uuid.uuid4()), "eventId": events[4]["_id"], "eventTitle": events[4]["title"], "type": "TICKET_SALE", "amount": 2000, "currency": "INR", "description": "Ticket #T-0199 sold", "timestamp": iso(0, -5)},
]
DB.ledger.insert_many(ledger)
print(f"  ✅ Inserted {len(ledger)} ledger entries")

# ========== CONFESSIONS ==========
print("\n--- Seeding CONFESSIONS ---")
confessions = [
    {"_id": str(uuid.uuid4()), "eventId": events[0]["_id"], "anonymousName": "stranger-in-black", "message": "Lost my friends at 3am. Found myself at the speaker. Best decision of the night.", "likes": 47, "createdAt": iso(0, -2)},
    {"_id": str(uuid.uuid4()), "eventId": events[0]["_id"], "anonymousName": "neon-witness", "message": "The lighting rig during the DEKKT live set was unreal. Whoever designed that — I see you.", "likes": 89, "createdAt": iso(0, -3)},
    {"_id": str(uuid.uuid4()), "eventId": events[0]["_id"], "anonymousName": "phone-in-cloak", "message": "First time I've been to a phone-free party. Did not miss it once.", "likes": 134, "createdAt": iso(0, -4)},
]
DB.confessions.insert_many(confessions)
print(f"  ✅ Inserted {len(confessions)} confessions")

# ========== TICKETS ==========
print("\n--- Seeding TICKETS ---")
tickets = [
    {
        "_id": str(uuid.uuid4()),
        "ticketCode": "T-1894",
        "eventId": events[0]["_id"],
        "userId": member_id,
        "orderId": "order_existing_1894",
        "paymentId": "pay_existing_1894",
        "status": "CONFIRMED",
        "amountPaid": 2500,
        "currency": "INR",
        "qrCode": f"10sonly|T-1894|{events[0]['_id']}",
        "purchasedAt": iso(0, -1),
        "checkedInAt": None,
    },
]
DB.tickets.insert_many(tickets)
print(f"  ✅ Inserted {len(tickets)} tickets")

# ========== HOST APPLICATIONS ==========
print("\n--- Seeding HOST_APPLICATIONS ---")
host_apps = [
    {
        "_id": str(uuid.uuid4()),
        "userId": member_id,
        "userName": "Aria Mehta",
        "userEmail": "aria.mehta@10sonly.club",
        "crewName": "Neon Cathedral Collective",
        "city": "mumbai",
        "bio": "We've been throwing warehouse techno nights in Bombay for 2 years. Looking to scale up with proper infrastructure.",
        "pastEvents": 8,
        "instagram": "@neon.cathedral",
        "soundcloud": "neon-cathedral",
        "whyHost": "We want to bring international techno acts to Mumbai that wouldn't otherwise play here. Our last 4 nights sold out within 48 hours.",
        "sampleLineup": "DEKKT (Live) · AVA · RIAN S",
        "status": "PENDING",
        "submittedAt": iso(-2),
        "reviewedAt": None,
        "reviewerNotes": None,
    },
    {
        "_id": str(uuid.uuid4()),
        "userId": str(uuid.uuid4()),
        "userName": "Karan Iyer",
        "userEmail": "karan.iyer@protonmail.com",
        "crewName": "Lowpass",
        "city": "bangalore",
        "bio": "Sound engineer turned promoter. Specialize in drum & bass and jungle.",
        "pastEvents": 12,
        "instagram": "@lowpass.bangalore",
        "soundcloud": "lowpass-blr",
        "whyHost": "Bangalore needs a proper DnB night that isn't in a mall club. I have the venue contacts and the artist network.",
        "sampleLineup": "OSPREY · MIG-29 · KHUSHI B2B AARYA",
        "status": "PENDING",
        "submittedAt": iso(-5),
        "reviewedAt": None,
        "reviewerNotes": None,
    },
    {
        "_id": str(uuid.uuid4()),
        "userId": str(uuid.uuid4()),
        "userName": "Tara Singh",
        "userEmail": "tara.freq@gmail.com",
        "crewName": "Sunrise Society",
        "city": "goa",
        "bio": "Visual artist and promoter. Beach-side sunrise sets, garage and 2-step.",
        "pastEvents": 6,
        "instagram": "@tara.freq",
        "soundcloud": "",
        "whyHost": "Goa's party scene is fragmented. We want to create a members-only community for people who actually care about the music.",
        "sampleLineup": "JEMMA HART · SUNDAY ROAST B2B OCEANIC",
        "status": "APPROVED",
        "submittedAt": iso(-14),
        "reviewedAt": iso(-10),
        "reviewerNotes": "Strong track record. Approved — welcome aboard.",
    },
]
DB.host_applications.insert_many(host_apps)
print(f"  ✅ Inserted {len(host_apps)} host applications")

# ========== VERIFY ==========
print("\n" + "=" * 60)
print("  ✅ DUMP COMPLETE — Verifying data...")
print("=" * 60)
total = 0
for col_name in ["users", "events", "applications", "host_venues", "ledger",
                  "confessions", "tickets", "host_applications"]:
    count = DB[col_name].count_documents({})
    total += count
    print(f"  {col_name:25s} {count:3d} documents")
print(f"  {'TOTAL':25s} {total:3d} documents")
print("=" * 60)

print("""
✅ Done! Your MongoDB Atlas 'tensonly' database is populated.

Demo logins (OTP: 000000):
  Member: aria.mehta@10sonly.club
  Host:   bookings@voidcollective.in
  Admin:  ops@10sonly.club

Next: Start the Spring Boot backend — it will read from this database.
  cd backend && mvn spring-boot:run
""")
