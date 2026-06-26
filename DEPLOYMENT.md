# 10s Only - Monorepo Deployment Guide

Complete guide for deploying the 10s Only platform across Vercel (Frontend) and Railway (Backend).

## Project Structure

```
10s-only-full-project/
├── /frontend/          # Next.js frontend
├── /backend/           # Spring Boot backend
├── vercel.json         # Vercel deployment config
├── Procfile            # Railway deployment config
├── railway.json        # Alternative Railway config
└── DEPLOYMENT.md       # This file
```

---

## Prerequisites

Before starting deployment, ensure you have:

1. **GitHub Repository** - Project pushed to GitHub (required for both Vercel and Railway)
2. **Vercel Account** - Free at https://vercel.com
3. **Railway Account** - Free tier available at https://railway.app
4. **MongoDB Atlas Cluster** - For database (already set up)
5. **Razorpay Live Credentials** - Already configured
6. **Environment Secrets** - Keep these secure, never commit to git

---

## Part 1: Frontend Deployment (Vercel)

### Step 1: Connect Repository to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"New Project"** or **"Add New"** → **Project**
3. Select **"Import Git Repository"**
4. Search for `10s-only-full-project` and click **Import**
5. Select your GitHub account and authorize Vercel

### Step 2: Configure Build Settings

In the **Configure Project** screen:

1. **Project Name**: `10s-only-frontend` (or your preferred name)
2. **Framework Preset**: Should auto-detect as **Next.js**
3. **Build Command**: Leave default or verify it's:
   ```bash
   cd frontend && npm run build
   ```
4. **Output Directory**: Should auto-fill with `.next`
5. **Install Command**: Default is fine

### Step 3: Add Environment Variables

Before deployment, add these secrets in **Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-backend-url.railway.app` | Get this after Railway deployment |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_T6ALQwvCJTt7dD` | Public key (safe to expose) |
| `NEXT_PUBLIC_USE_MOCK` | `false` | Must be false for production |

**To add variables:**
1. Click **"Environment Variables"** section
2. Add each variable and select scope (**Production, Preview, Development**)
3. For frontend, use **Production** scope

### Step 4: Deploy

Click **"Deploy"** button. Vercel will:
- Clone the repository
- Run build command: `cd frontend && npm run build`
- Deploy to Vercel CDN

**Deployment URL**: Your frontend will be live at `https://<project-name>.vercel.app`

Save this URL for configuring the backend CORS.

### Step 5: Redeploy with Backend URL

After Railway backend is deployed (see Part 2):

1. Go to your Vercel project settings
2. Update `NEXT_PUBLIC_API_URL` with your Railway backend URL
3. Click **"Redeploy"** or push a new commit to trigger redeploy

---

## Part 2: Backend Deployment (Railway)

### Step 1: Connect Repository to Railway

1. Go to [https://railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your GitHub account and authorize Railway
4. Find and select `10s-only-full-project` repository
5. Click **"Deploy Now"**

Railway will auto-detect and create services for:
- **Frontend** (Node.js) - We'll disable this
- **Backend** (Spring Boot/Java) - We'll configure this

### Step 2: Configure Backend Service

1. In your Railway project dashboard, find the **backend** service (or Java service)
2. Click on it to open service settings

### Step 3: Update Deployment Configuration

In the Railway dashboard, update the start command:

**Service Settings** → **Build & Deploy**:
- **Build Command**: 
  ```bash
  cd backend && mvn clean package -DskipTests
  ```
- **Start Command**:
  ```bash
  cd backend && java -jar target/tensonly-0.0.1-SNAPSHOT.jar
  ```

Alternatively, if you've set up `railway.json`, Railway should auto-detect it.

### Step 4: Add Environment Variables

In Railway dashboard, go to **Variables** and add these secrets:

| Variable | Value | Notes |
|----------|-------|-------|
| `MONGODB_URI` | Your Atlas URI | `mongodb+srv://user:pass@cluster.mongodb.net/tensonly...` |
| `APP_JWT_SECRET` | Your secure secret | Generate: `openssl rand -base64 32` |
| `RAZORPAY_KEY_ID` | `rzp_live_T6ALQwvCJTt7dD` | Live key ID |
| `RAZORPAY_KEY_SECRET` | Your secret key | Keep this secret! |
| `APP_CORS_ALLOWED_ORIGINS` | Your Vercel URL | `https://your-project.vercel.app` |
| `SPRING_PROFILES_ACTIVE` | `prod` | Production profile |
| `SERVER_PORT` | `8080` | Default Railway port |

**To add variables:**
1. Click **"Variables"** tab
2. Click **"New Variable"**
3. Enter key and value
4. Railway will auto-redeploy with new variables

### Step 5: Access Backend

Your Railway backend will be live at a URL like:
```
https://tensonly-backend-prod.railway.app
```

Get the exact URL from Railway dashboard:
- **Service** → **Settings** → **Domain**
- Or from the **Deployments** log

Copy this URL to use in Vercel frontend deployment.

### Step 6: Remove Frontend Service (Optional)

If Railway created a frontend service, you can remove it since we're using Vercel:

1. In Railway project, find the **frontend** service
2. Click **Settings** → **Remove Service**

---

## Part 3: Configure CORS Between Vercel and Railway

### Frontend Side (Already Done)

The Vercel frontend will call:
```typescript
NEXT_PUBLIC_API_URL = "https://your-railway-backend-url.railway.app"
```

### Backend Side (Already Configured)

The Spring Boot backend `SecurityConfig.java` handles CORS automatically:
- Reads `APP_CORS_ALLOWED_ORIGINS` environment variable
- Allows all requests from Vercel frontend
- Allows all necessary headers and methods

**Verify CORS is working:**
```bash
curl -H "Origin: https://your-vercel-url.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS https://your-railway-backend-url.railway.app/api/events -v
```

You should see these response headers:
```
Access-Control-Allow-Origin: https://your-vercel-url.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
```

---

## Part 4: Post-Deployment Verification

### 1. Check Frontend

```bash
curl https://your-project.vercel.app/api/events
# Should show a redirect to backend API
```

Or open in browser:
- https://your-project.vercel.app/events
- Login with test credentials
- Try purchasing a ticket

### 2. Check Backend Health

```bash
curl https://your-railway-backend-url.railway.app/actuator/health
# Should return: {"status":"UP"}
```

### 3. Check API Endpoints

```bash
# List all public events
curl https://your-railway-backend-url.railway.app/api/events

# Create a payment order (authenticated)
curl -X POST https://your-railway-backend-url.railway.app/api/payments/razorpay/order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId":"...", "quantity":1}'
```

### 4. Monitor Logs

**Vercel:**
- Dashboard → Your Project → **Deployments**
- Click on latest deployment → **Runtime Logs**

**Railway:**
- Dashboard → Your Project → **Backend Service**
- Click **Logs** tab to view real-time logs

---

## Troubleshooting

### Frontend Can't Connect to Backend

**Symptoms:** 404 or CORS errors in browser console

**Solution:**
1. Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
2. Check backend is running: `curl https://backend-url/actuator/health`
3. Verify `APP_CORS_ALLOWED_ORIGINS` on backend includes your Vercel domain
4. Redeploy backend after updating CORS

### Payment Verification Fails

**Symptoms:** Payment debited but ticket not created

**Solution:**
1. Verify `APP_JWT_SECRET` matches between local and Railway
2. Check MongoDB connection: Verify `MONGODB_URI` is correct
3. View logs: Railway dashboard → Backend Service → Logs
4. Check Razorpay credentials are correct and live keys

### Database Connection Issues

**Symptoms:** "MongoDB connection refused" or timeout errors

**Solution:**
1. Verify MongoDB Atlas cluster is running
2. Check connection string: `MONGODB_URI`
3. Verify IP whitelist in Atlas allows Railway:
   - MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` for Railway (less secure) or Railway's IP range
   - Or use SRV connection string with authentication

### Backend Won't Start on Railway

**Symptoms:** Build succeeds but deployment fails

**Solution:**
1. Check build command succeeds locally: `cd backend && mvn clean package -DskipTests`
2. Verify all environment variables are set
3. Check logs in Railway for error details
4. Ensure Java version is compatible (Spring Boot 3.3.5 requires Java 21+)

---

## Environment Variables Summary

### Frontend (.env.production on Vercel)

```env
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_T6ALQwvCJTt7dD
NEXT_PUBLIC_USE_MOCK=false
```

### Backend (Environment Variables on Railway)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tensonly?retryWrites=true&w=majority
APP_JWT_SECRET=your-secure-jwt-secret-min-256-bits
RAZORPAY_KEY_ID=rzp_live_T6ALQwvCJTt7dD
RAZORPAY_KEY_SECRET=your-razorpay-secret
APP_CORS_ALLOWED_ORIGINS=https://your-project.vercel.app
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
```

---

## Security Checklist

- [ ] All secrets are stored as environment variables (not in code)
- [ ] Razorpay secret key is never committed to GitHub
- [ ] JWT secret is strong (min 32 characters, random)
- [ ] MongoDB IP whitelist is configured appropriately
- [ ] CORS origins don't include `*` (specific Vercel domain only)
- [ ] Frontend uses `https://` URLs (no `http://`)
- [ ] Backend logs don't expose sensitive information

---

## Updating After Deployment

### Deploy Frontend Changes

```bash
git push origin main
# Vercel auto-detects push to GitHub
# Automatically redeploys frontend
# Check: Vercel Dashboard → Deployments
```

### Deploy Backend Changes

```bash
git push origin main
# Railway auto-detects push
# Triggers build: cd backend && mvn clean package
# Automatically redeploys backend
# Check: Railway Dashboard → Deployments
```

### Update Environment Variables

**On Vercel:**
1. Dashboard → Settings → Environment Variables
2. Update and save
3. Click **"Redeploy"** or wait for next git push

**On Railway:**
1. Dashboard → Variables
2. Update and save
3. Railway auto-redeploys (usually within 1-2 minutes)

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Next.js Deployment**: https://nextjs.org/learn/basics/deploying-nextjs-app
- **Spring Boot on Railway**: https://docs.railway.app/guides/java
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/

---

## Next Steps

1. Deploy frontend to Vercel
2. Deploy backend to Railway
3. Update CORS configuration on backend with Vercel URL
4. Test end-to-end: Login → Browse Events → Book Ticket → Verify in Dashboard
5. Monitor logs for any errors
6. Set up error tracking (optional): Sentry, LogRocket, etc.

---

**Last Updated:** 2026-06-26
**Deployment Configuration Version:** 1.0.0
