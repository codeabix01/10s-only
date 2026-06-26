# Configuration Files Reference

Quick reference for all configuration files in the 10s Only monorepo.

---

## Root Level Configuration Files

### `vercel.json` - Vercel Deployment Config
**Purpose**: Configures how Vercel builds and deploys the frontend

**Key Settings**:
- `buildCommand`: Runs `cd frontend && npm run build`
- `outputDirectory`: Points to `frontend/.next`
- Environment variables referenced via `@variable_name`
- Security headers configured (X-Content-Type-Options, etc.)
- Region: blr1 (Bangalore - for low latency in India)

**When to Update**:
- If build process changes
- If deployment region needs to change
- If new headers are required

---

### `railway.json` - Railway Deployment Config
**Purpose**: Configures how Railway builds and deploys the backend

**Key Settings**:
- `builder`: Set to `dockerfile` for container builds
- `startCommand`: Runs the Spring Boot JAR

**Alternative**: Procfile (simpler, also supported)

**When to Update**:
- If start command changes
- If build process changes

---

### `Procfile` - Railway Process File
**Purpose**: Simple way to tell Railway how to run the backend

**Content**: `web: cd backend && java -jar target/tensonly-0.0.1-SNAPSHOT.jar`

**Notes**:
- This is simpler than `railway.json` for basic deployments
- Railway auto-reads this if present
- Alternative to `railway.json`

---

### `.env.production.example` - Frontend Production Secrets Template
**Purpose**: Template for frontend environment variables in production

**Variables**:
- `NEXT_PUBLIC_API_URL`: Backend API base URL (Vercel needs this)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Live Razorpay public key
- `NEXT_PUBLIC_USE_MOCK`: Feature flag (must be false in prod)

**How to Use**:
1. Copy to Vercel Environment Variables
2. Never commit `.env.production` (only `.env.production.example`)

---

### `backend/.env.production.example` - Backend Production Secrets Template
**Purpose**: Template for backend environment variables in production

**Variables**:
- `MONGODB_URI`: Database connection string
- `APP_JWT_SECRET`: JWT signing secret (256+ bits)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`: Payment gateway credentials
- `APP_CORS_ALLOWED_ORIGINS`: Comma-separated list of frontend URLs
- `SPRING_PROFILES_ACTIVE`: Set to `prod`

**How to Use**:
1. Set on Railway as environment variables
2. Never commit `.env.production` (only `.env.production.example`)
3. Use strong random secrets (generate with `openssl rand -base64 32`)

---

## Frontend Configuration Files

### `frontend/package.json` - Dependencies & Scripts
**Build Scripts**:
- `npm run dev`: Development server (hot reload)
- `npm run build`: Production build
- `npm run lint`: ESLint validation

**Dependencies**:
- `next`: Framework
- `@tanstack/react-query`: Data fetching
- `zustand`: State management
- `framer-motion`: Animations
- `tailwindcss`: Styling
- `@supabase/supabase-js`: Auth
- `razorpay`: Payment SDK

---

### `frontend/tailwind.config.ts` - Tailwind CSS Configuration
**Custom Extensions** (UPDATED with premium grades):
- **Colors**:
  - `neon.*`: Pink, Purple, Cyan, Lime, Orange
  - `premium.*`: Dark shades for depth
  
- **Background Images**:
  - `gradient-neon-*`: Pre-built gradient utilities
  - `gradient-premium`: Main brand gradient
  
- **Box Shadows**:
  - `shadow-neon-*`: Neon glow effects
  - `shadow-premium`: Subtle premium shadow
  
- **Animations**:
  - `pulse-glow`: Pulsing glow effect
  - `shimmer`: Shimmer animation
  - `float`: Floating animation

**Usage in Components**:
```tsx
<div className="bg-gradient-premium shadow-neon-pink">
  Premium card with pink glow
</div>
```

---

### `frontend/next.config.ts` - Next.js Configuration
**Purpose**: Configure Next.js build and runtime behavior

**Key Settings**:
- Image optimization
- API routes configuration
- Build optimizations
- Environment variables

---

### `frontend/tsconfig.json` - TypeScript Configuration
**Purpose**: TypeScript compiler settings

**Key Settings**:
- `target`: ES2020
- `lib`: Include DOM types
- `strict`: Type checking mode
- `paths`: Path aliases (`@/lib`, `@/components`)

---

## Backend Configuration Files

### `backend/pom.xml` - Maven Configuration
**Purpose**: Maven build configuration and dependency management

**Key Sections**:
- `<dependencies>`: All JAR dependencies
  - Spring Boot starters
  - JWT (jjwt 0.12.6)
  - Razorpay Java SDK
  - MongoDB driver
  
- `<properties>`: Version constants
  - Java version: 21
  - Spring Boot: 3.3.5
  
- `<plugins>`: Build plugins
  - Spring Boot Maven plugin
  - Compiler plugin

**Commands**:
```bash
mvn clean                    # Clean build artifacts
mvn compile                  # Compile only
mvn package                  # Create JAR
mvn spring-boot:run         # Run locally
mvn test                    # Run tests
mvn clean package -DskipTests  # Production build
```

---

### `backend/Dockerfile` - Backend Container Image
**Purpose**: Build Docker image for the backend

**Multi-Stage Build**:
1. **Builder Stage**: Compiles with Maven (includes build dependencies)
2. **Runtime Stage**: Runs with JRE only (smaller, faster)

**Output**: Docker image that runs `java -jar app.jar`

**Usage**: Railway auto-runs this when deploying

---

### `backend/src/main/resources/application.yml` - Spring Boot Configuration
**Purpose**: Spring Boot application settings

**Key Sections**:

#### Spring Data MongoDB
```yaml
spring:
  data:
    mongodb:
      uri: ${MONGODB_URI}           # From environment
      auto-index-creation: false     # Index management
      ssl:
        enabled: true               # Use SSL for Atlas
```

#### Server Configuration
```yaml
server:
  port: 8080                       # Listen port
```

#### Application Settings
```yaml
app:
  jwt:
    secret: ${APP_JWT_SECRET}      # From environment (256+ bits)
    expiration-ms: 86400000        # 24 hours
  razorpay:
    key-id: ${RAZORPAY_KEY_ID}
    key-secret: ${RAZORPAY_KEY_SECRET}
  cors:
    allowed-origins: ${APP_CORS_ALLOWED_ORIGINS}  # NEW: From environment
  auth:
    admin-emails: ops@10sonly.club  # Admin email list
```

#### Management (Actuator)
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info        # Health check endpoints
```

**Environment Variables Used**:
- `MONGODB_URI` - Database connection
- `APP_JWT_SECRET` - JWT signing key
- `RAZORPAY_KEY_ID` - Payment gateway
- `RAZORPAY_KEY_SECRET` - Payment gateway
- `APP_CORS_ALLOWED_ORIGINS` - Frontend URLs
- `SPRING_PROFILES_ACTIVE` - Profile (dev/prod)

---

### `backend/src/main/java/com/tensonly/config/AppProperties.java` - Configuration Properties
**Purpose**: Java record to hold application configuration

**Records**:
```java
@ConfigurationProperties(prefix = "app")
public record AppProperties(
    Jwt jwt,
    Razorpay razorpay,
    Cors cors,          // NEW: CORS configuration
    Otp otp,
    Auth auth
)
```

**Usage**: Injected into Spring components via `@Autowired AppProperties`

---

### `backend/src/main/java/com/tensonly/config/SecurityConfig.java` - Security & CORS Configuration
**Purpose**: Configure Spring Security and CORS

**Key Features** (UPDATED):
- **CORS Configuration**:
  - Parses comma-separated origins from `app.cors.allowed-origins`
  - Allows all necessary HTTP methods
  - Sets security headers
  - Caches preflight for 1 hour

- **Security Filter Chain**:
  - JWT authentication
  - Stateless sessions
  - Authorization rules
  - Exception handling

**Public Endpoints** (No auth required):
- `/api/events`
- `/api/events/{id}`
- `/api/auth/supabase/*`
- `/actuator/health`

**Protected Endpoints** (JWT required):
- `/api/tickets/*`
- `/api/payments/*`
- `/api/users/me`

---

## Environment Variable Files

### `.env` - Local Development
**Location**: Root directory (git-ignored)

**Purpose**: Local development configuration

**Typical Content**:
```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY
NEXT_PUBLIC_USE_MOCK=false

# Backend
MONGODB_URI=mongodb://localhost:27017/tensonly
APP_JWT_SECRET=local-dev-secret-not-secure
RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY
RAZORPAY_KEY_SECRET=test_secret
APP_CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### `.env.example` - Template for `.env`
**Purpose**: Template showing what env vars are needed

**Usage**: 
```bash
cp .env.example .env  # Create local .env
# Then edit .env with your credentials
```

---

## Docker Compose Files

### `docker-compose.yml` - Local Development Stack
**Purpose**: Run entire app locally with Docker

**Services** (optional, mainly for reference):
- Frontend: Next.js on port 3000
- Backend: Spring Boot on port 8080
- MongoDB: Database on port 27017

**Usage**:
```bash
docker-compose up -d    # Start all services
docker-compose logs -f  # View logs
docker-compose down     # Stop services
```

---

## Documentation Files

### `DEPLOYMENT.md` - Complete Deployment Guide
**Content**:
- Step-by-step Vercel setup
- Step-by-step Railway setup
- CORS configuration
- Post-deployment verification
- Troubleshooting

**When to Read**: Before deploying to production

---

### `DEPLOYMENT-CHECKLIST.md` - Quick Reference Checklist
**Content**:
- Pre-deployment checklist
- Vercel deployment steps
- Railway deployment steps
- Integration testing
- Security verification

**When to Use**: Quick reference during deployment

---

### `MONOREPO-README.md` - Complete Project Overview
**Content**:
- Project structure
- Quick start guide
- Technology stack
- API endpoints
- Deployment overview

**When to Read**: Project onboarding, general reference

---

### This File - `CONFIGURATION-REFERENCE.md`
**Purpose**: Detailed explanation of each config file

**When to Use**: Understanding what each configuration file does and when to update it

---

## Configuration Best Practices

### ✅ DO

- Store secrets in environment variables
- Use example files as templates (`.env.example`, `.env.production.example`)
- Keep deployment configs in git (vercel.json, railway.json)
- Document required environment variables
- Use strong, random secrets (min 256 bits for JWT)
- Regenerate secrets for each environment

### ❌ DON'T

- Commit `.env` files to git
- Hardcode API keys or secrets
- Use test credentials in production
- Commit private SSH keys
- Use the same secret across environments
- Push Razorpay secret to git

---

## Configuration Deployment Flow

```
Local Development
    ↓
.env (local secrets)
application.yml (local database)
    ↓
vercel.json (build config)
railway.json (build config)
    ↓
Vercel Environment Variables (frontend secrets)
Railway Environment Variables (backend secrets)
    ↓
Production
```

---

## Common Configuration Changes

### Add New Environment Variable

1. **Frontend**:
   - Add to `.env.production.example`
   - Add to `frontend/next.config.ts` if needed
   - Set in Vercel dashboard

2. **Backend**:
   - Add to `backend/.env.production.example`
   - Add to `backend/src/main/resources/application.yml`
   - Update `AppProperties.java` if needed
   - Set in Railway dashboard
   - Redeploy

### Change Build Command

1. **Frontend**: Update `buildCommand` in `vercel.json`
2. **Backend**: Update `<build>` section in `pom.xml` or build command in Railway

### Update CORS Origins

1. Update `APP_CORS_ALLOWED_ORIGINS` in:
   - `backend/.env.production.example`
   - Railway environment variables
2. Redeploy backend

### Change Port or Server Settings

1. Update `backend/src/main/resources/application.yml`
2. Or override with environment variable: `SERVER_PORT=8080`

---

## Verification Commands

```bash
# Verify frontend build
cd frontend && npm run build

# Verify backend build
cd backend && mvn clean package -DskipTests

# Verify CORS headers
curl -v http://localhost:8080/api/events \
  -H "Origin: http://localhost:3000"

# Verify JWT is working
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:8080/api/tickets/mine

# Check MongoDB connection
mongo $MONGODB_URI --eval "db.adminCommand('ping')"
```

---

**Last Updated**: 2026-06-26  
**Configuration Version**: 1.0.0
