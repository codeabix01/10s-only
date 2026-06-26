# 10s Only - Members-Only Underground Parties

**Live Production URLs (Post-Deployment)**
- **Frontend**: https://your-project.vercel.app
- **Backend**: https://your-project.railway.app
- **Payments**: Razorpay Live (rzp_live_T6ALQwvCJTt7dD)
- **Database**: MongoDB Atlas (tensonly cluster)

---

## 📁 Monorepo Structure

```
10s-only-full-project/
│
├── /frontend                 # Next.js 16.2.9 Frontend
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   │   ├── events/      # Event display & countdown timer
│   │   │   ├── payment/     # Razorpay payment modal
│   │   │   ├── dashboard/   # Member dashboard with notifications
│   │   │   ├── auth/        # Authentication components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── lib/             # Utilities & API clients
│   │   │   └── api-client.ts # HTTP client for backend API
│   │   └── hooks/           # Custom React hooks
│   ├── public/              # Static assets
│   ├── package.json
│   ├── tailwind.config.ts   # Tailwind CSS config (enhanced gradients)
│   ├── next.config.ts
│   └── tsconfig.json
│
├── /backend                  # Spring Boot 3.3.5 Backend
│   ├── src/main/java/com/tensonly/
│   │   ├── TensonlyApplication.java   # Main app
│   │   ├── config/
│   │   │   ├── SecurityConfig.java    # CORS & JWT security
│   │   │   ├── AppProperties.java     # Configuration properties
│   │   │   ├── MongoConfig.java       # MongoDB config
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── entity/          # JPA entities
│   │   │   ├── User.java
│   │   │   ├── Event.java
│   │   │   ├── Ticket.java  # With holderName field
│   │   │   └── Application.java
│   │   ├── repository/      # MongoDB repositories
│   │   ├── service/         # Business logic
│   │   │   ├── RazorpayService.java  # Payment handling
│   │   │   └── EventService.java
│   │   ├── controller/      # REST endpoints
│   │   │   ├── PaymentController.java  # /api/payments
│   │   │   ├── TicketController.java   # /api/tickets
│   │   │   ├── EventController.java    # /api/events
│   │   │   └── AuthController.java     # /api/auth
│   │   ├── dto/             # Data transfer objects
│   │   ├── security/        # JWT authentication
│   │   │   ├── JwtAuthFilter.java     # JWT token validation
│   │   │   └── SecurityUtil.java      # Extract user from context
│   │   └── exception/       # Custom exceptions
│   ├── src/main/resources/
│   │   └── application.yml  # Spring config (with CORS settings)
│   ├── pom.xml             # Maven dependencies
│   ├── Dockerfile          # Multi-stage Docker build
│   └── .env.production.example
│
├── /db                      # Database scripts
├── /scripts                 # Deployment scripts
│
├── /.github/                # GitHub configuration
├── docker-compose.yml       # Local dev environment
│
├── vercel.json             # Vercel deployment config
├── railway.json            # Railway deployment config
├── Procfile                # Railway Procfile
│
├── DEPLOYMENT.md           # Complete deployment guide
├── DEPLOYMENT-CHECKLIST.md # Quick checklist
├── README.md               # This file
└── package.json           # Root dependencies

```

---

## 🚀 Quick Start

### Local Development

#### Prerequisites
- Node.js 22+
- Java 21+
- Maven 3.9+
- MongoDB Atlas connection (or local MongoDB)

#### Setup

```bash
# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies (Maven auto-installs)

# Copy environment variables
cp .env.example .env.local
cp backend/.env.example backend/.env

# Update .env.local with your credentials
```

#### Run Locally

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
# Opens http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd backend
mvn spring-boot:run
# Server runs on http://localhost:8080
```

**Database:**
- MongoDB Atlas (already configured in `.env`)
- Or local MongoDB: `mongod` on port 27017

---

## 🎨 UI/UX Enhancements (NEW)

### Premium Color Grade System
- **Neon Palette**: Pink (#ff007a), Purple (#6800ff), Cyan (#00e5ff)
- **Premium Gradients**: Tailwind `gradient-neon-*` and `gradient-premium` classes
- **Enhanced Shadows**: `shadow-neon-pink`, `shadow-premium` for depth
- **Animations**: `pulse-glow`, `shimmer`, `float` for interactive elements

### Event Countdown Timer
- **Component**: `src/components/events/countdown-timer.tsx`
- **Features**: 
  - Real-time countdown (days, hours, minutes, seconds)
  - Compact mode for cards
  - Full mode for dashboard
  - Color-coded time units
- **Usage**: Tracks upcoming booked events

### Upcoming Event Notifications
- **Component**: `src/components/events/upcoming-event-notification.tsx`
- **Features**:
  - Shows events within 24 hours
  - Animated banner with gradient border
  - Dismissible notification
  - Integration with member dashboard
- **Triggers**: Automatically when user has upcoming events

### Updated Components
- **EventCard**: Enhanced with premium shadows and hover animations
- **MemberDashboard**: Integrated with upcoming event notification
- **PaymentModal**: Updated UI with better visual hierarchy

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16.2.9
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand (auth) + React Query (data fetching)
- **Auth**: Supabase OTP + Custom JWT
- **Animations**: Framer Motion
- **Payments**: Razorpay SDK (live)
- **HTTP Client**: Axios wrapper in `lib/api-client.ts`

### Backend
- **Framework**: Spring Boot 3.3.5
- **Language**: Java 21
- **Database**: MongoDB (Atlas)
- **ORM**: Spring Data MongoDB
- **Security**: JWT (HS256)
- **Payments**: Razorpay Java SDK
- **Build**: Maven 3.9+
- **Containerization**: Docker

### Deployment
- **Frontend**: Vercel (auto-scaling CDN)
- **Backend**: Railway (Docker-based)
- **Database**: MongoDB Atlas (cloud)
- **Secrets**: Environment variables (Vercel & Railway)

---

## 📦 Key Features

### Authentication
- **Email OTP** via Supabase
- **JWT Tokens** (backend-issued)
- **Auto User Creation** on first payment
- **Role-based Access** (User, Host, Admin)

### Events
- **Public Listing**: Browse all public events
- **Members-Only**: Filtered for logged-in members
- **Private Events**: Invite-only
- **Real-time Countdown**: Shows time to event start
- **Notifications**: "Event starting soon" alerts

### Payments
- **Razorpay Live Integration**: Real payment processing
- **Payment Verification**: Signature validation
- **Ticket Creation**: Auto-create on verified payment
- **Fallback User Lookup**: Email-based if user lookup fails
- **Auto User Creation**: Prevents ticket loss on payment

### Tickets
- **Purchase History**: View all booked events
- **Event Details**: Full event info on ticket
- **Holder Name**: Ticket booked under user's name
- **QR Code Ready**: For venue check-in

### User Dashboard
- **Profile**: Avatar, name, city, vibe alignment
- **Booked Events**: Upcoming and past events
- **Loyalty Tier**: Founding/Resident/Newcomer
- **Notifications**: Upcoming event alerts with countdown

---

## 🔐 Security

### Implemented
- JWT-based authentication (HS256)
- CORS configuration (specific origins only)
- Secure password handling via Supabase
- Razorpay signature verification
- MongoDB access via Atlas IP whitelist
- Environment variables for secrets (no hardcoding)

### CORS Setup
```yaml
# Backend configured to allow:
- Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
- Headers: Authorization, Content-Type, Accept, Origin
- Exposed: Authorization, Content-Type
- Credentials: true
- Max Age: 3600s
```

---

## 📡 API Endpoints

### Public Endpoints
```
GET  /api/events                  # List all public events
GET  /api/events/{id}             # Get event details
POST /api/auth/supabase/verify    # Verify OTP
POST /api/auth/supabase/sync      # Sync Supabase to backend
```

### Authenticated Endpoints
```
GET  /api/tickets/mine            # User's booked tickets
POST /api/payments/razorpay/order # Create payment order
POST /api/payments/razorpay/verify # Verify payment & create ticket
GET  /api/users/me                # Current user profile
```

### Admin Endpoints
```
GET  /api/admin/applications      # Applications management
GET  /api/admin/stats             # Platform statistics
```

---

## 🚀 Deployment

### Quick Deploy
1. **Frontend to Vercel**: 
   ```bash
   git push origin main
   # Auto-deploys to Vercel
   ```

2. **Backend to Railway**:
   ```bash
   git push origin main
   # Auto-builds and deploys to Railway
   ```

### Full Setup
See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step guide.

See [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) for quick reference.

### Environment Variables

**Frontend** (Vercel):
```env
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_T6ALQwvCJTt7dD
NEXT_PUBLIC_USE_MOCK=false
```

**Backend** (Railway):
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tensonly
APP_JWT_SECRET=your-secure-secret-min-256-bits
RAZORPAY_KEY_ID=rzp_live_T6ALQwvCJTt7dD
RAZORPAY_KEY_SECRET=your-secret-key
APP_CORS_ALLOWED_ORIGINS=https://your-vercel-frontend.vercel.app
SPRING_PROFILES_ACTIVE=prod
```

---

## 📝 Development Workflow

### Frontend Development
```bash
cd frontend
npm run dev              # Dev server + HMR
npm run build          # Production build
npm run lint           # ESLint
npm test               # Run tests (if configured)
```

### Backend Development
```bash
cd backend
mvn spring-boot:run    # Dev server with auto-reload
mvn clean package      # Production build
mvn test               # Run tests
mvn compile            # Compile only
```

### Testing Payments Locally
1. Use Razorpay test keys in `.env`
2. Test card: 4111 1111 1111 1111 (Visa)
3. Any CVV and expiry
4. Verify order creation and payment verification in logs

---

## 🐛 Troubleshooting

### Frontend Issues
- **"Cannot GET /events"**: Backend not running or wrong `NEXT_PUBLIC_API_URL`
- **"CORS error"**: Check `APP_CORS_ALLOWED_ORIGINS` on backend
- **Payment modal blank**: Razorpay key not set or invalid

### Backend Issues
- **"MongoDB connection refused"**: Check `MONGODB_URI` and network access in Atlas
- **"JWT validation failed"**: Ensure `APP_JWT_SECRET` matches both frontend and backend
- **"404 after payment"**: Backend logs should show error; check user lookup fallback

### Common Solutions
```bash
# Clear frontend build cache
rm -rf frontend/.next
npm run build

# Clear backend build cache
cd backend
mvn clean

# Restart services
pkill -f "npm run dev"
pkill -f "java"

# Check logs
tail -f backend/target/application.log
```

---

## 📚 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete production deployment guide
- [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) - Pre-flight checklist
- [Backend README](backend/README.md) - Backend-specific docs
- [Frontend README](frontend/README.md) - Frontend-specific docs (if exists)

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Railway Dashboard | https://railway.app/dashboard |
| MongoDB Atlas | https://cloud.mongodb.com |
| Razorpay Dashboard | https://dashboard.razorpay.com |
| Next.js Docs | https://nextjs.org/docs |
| Spring Boot Docs | https://spring.io/projects/spring-boot |

---

## 📄 License

Private project. All rights reserved.

---

## 👥 Team

**Project Lead**: Abhishek (Full-stack)

**Tech Stack Expertise**:
- Frontend: Next.js, React, Tailwind CSS
- Backend: Spring Boot, MongoDB
- DevOps: Vercel, Railway, Docker
- Payments: Razorpay

---

## 📞 Support

For issues or questions:
1. Check DEPLOYMENT.md
2. Review logs (Vercel/Railway/Local)
3. Check Razorpay dashboard for payment status
4. Review MongoDB Atlas for database issues

---

**Last Updated**: 2026-06-26  
**Deployment Status**: Ready for Production  
**Version**: 1.0.0
