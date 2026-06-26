# 10s Only — Exclusive Underground Party Platform

> Members-only underground party platform with Razorpay payments. Built with Next.js 16 + Spring Boot 3 + MongoDB Atlas.

## ✨ Features

- **Dark neon glassmorphism** design (neon pink #FF007A + purple #6800FF + cyan on black)
- **Member journey**: Browse events → Apply to join → Get approved → Book tickets via Razorpay
- **Host journey**: Member applies to become host → Admin approves → Host creates events → Admin approves events
- **Admin console**: Approve members, hosts, and events. Platform stats, city health, payment records.
- **Razorpay Standard Checkout**: Real payment integration with HMAC-SHA256 signature verification
- **MongoDB Atlas**: Cloud database, no local DB setup needed
- **JWT auth**: OTP-based login, 7-day tokens, role-based access (member/host/admin)
- **8 routes**: Home, Events, Event Detail, Apply, Login, Member Dashboard, Host Portal, Admin Console, Become Host

## 🚀 Quick Start

### Option A — Frontend only (mock mode, no backend)
```bash
npm install && npm run dev
# → http://localhost:3000
```
Demo logins: Click "Sign in" → use Member/Host/Admin demo buttons (OTP: 000000)

### Option B — Full stack with Spring Boot + MongoDB
```bash
# 1. Create backend env from example
cp backend/.env.example backend/.env
# Fill RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and MongoDB URI in backend/.env

# 2. Start backend
cd backend
mvn spring-boot:run
# → http://localhost:8080 (connects to MongoDB Atlas automatically)

# 3. Wire frontend to backend
echo 'NEXT_PUBLIC_API_URL=http://localhost:8080' >> .env.local
npm run dev

# 4. Test Razorpay payment
# Login as Member → Events → Reserve → Pay ₹2,230
# Use test card: 4111 1111 1111 1111, any future expiry, any CVV
```

### Option C — Docker Compose
```bash
docker compose up --build
# → frontend: http://localhost:3000
# → backend: http://localhost:8080
```

## 🔑 Credentials

### Razorpay (Test Mode)
- Key ID: `rzp_test_YOUR_KEY_ID`
- Key Secret: `your-razorpay-secret` (backend only, never expose to frontend)

### MongoDB Atlas
- URI: `mongodb+srv://username:password@cluster.mongodb.net/tensonly`
- Database: `tensonly`

### Demo Logins (OTP: 000000)
- Member: `you@10sonly.club`
- Host: `host@voidcollective.club`
- Admin: `admin@10sonly.club`

## 📁 Structure
```
├── src/                    # Next.js 16 frontend
│   ├── app/                # 9 routes (App Router)
│   ├── components/         # 25+ components (site, events, auth, payment, host, admin, dashboard)
│   └── lib/                # Types, mock data, API client, auth store, Razorpay hook
├── backend/                # Java Spring Boot 3 (MongoDB)
│   └── src/main/java/com/tensonly/
│       ├── entity/         # 9 @Document entities + 10 enums
│       ├── repository/     # 9 MongoRepository interfaces
│       ├── controller/     # 11 REST controllers
│       ├── service/        # 6 services (Auth, OTP, Event, Application, HostApp, Razorpay)
│       ├── security/       # JWT + SecurityConfig
│       └── config/         # AppProperties, DataSeeder, GlobalExceptionHandler
├── docker-compose.yml
├── backend/.env            # Razorpay + MongoDB credentials
└── .env.local              # Frontend env (Razorpay key ID)
```

## 🔌 API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/otp/request | Public | Request OTP |
| POST | /api/auth/otp/verify | Public | Verify OTP → JWT |
| GET | /api/events | Public | List events |
| GET | /api/events/{id} | Public | Event detail |
| POST | /api/applications | Public | Submit membership application |
| POST | /api/payments/razorpay/order | Auth | Create Razorpay order |
| POST | /api/payments/razorpay/verify | Auth | Verify payment signature |
| POST | /api/events | Host/Admin | Create event (draft status) |
| GET | /api/events/host | Host/Admin | Host's events |
| POST | /api/host-applications | Auth | Apply to become host |
| GET | /api/admin/stats | Admin | Platform stats |
| GET | /api/admin/events/pending | Admin | Events pending approval |
| POST | /api/admin/events/{id}/approve | Admin | Approve event |
| POST | /api/host-applications/{id}/review | Admin | Approve/reject host application |

## 🛡️ Security
- HMAC-SHA256 signature verification (constant-time compare)
- Idempotent payment capture (duplicate orders rejected)
- KEY_SECRET never exposed to frontend
- JWT with role-based access control
- CORS configured for allowed origins only

## 📝 License
MIT — build on it, ship it, throw your own parties.
