# 🚀 Deployment Checklist

Quick reference for deploying 10s Only to production.

## Pre-Deployment (Local Verification)

- [ ] All code committed to GitHub (no pending changes)
- [ ] Backend compiles: `mvn clean compile` ✓
- [ ] Frontend builds: `npm run build` (in /frontend)
- [ ] Tests pass: `npm test` and `mvn test`
- [ ] Environment variables are set locally
- [ ] Live credentials verified (Razorpay, MongoDB)
- [ ] CORS settings configured in `backend/src/main/resources/application.yml`

## Vercel Deployment (Frontend)

### Account Setup
- [ ] Vercel account created at https://vercel.com
- [ ] GitHub repository connected to Vercel

### Configuration
- [ ] Project created on Vercel with name `10s-only-frontend`
- [ ] Build command verified: `cd frontend && npm run build`
- [ ] Output directory confirmed: `frontend/.next`
- [ ] Environment variables added:
  - [ ] `NEXT_PUBLIC_API_URL` (set to placeholder initially)
  - [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_T6ALQwvCJTt7dD`
  - [ ] `NEXT_PUBLIC_USE_MOCK=false`

### Deployment
- [ ] Initial deployment triggered
- [ ] Deployment succeeded (check Deployments tab)
- [ ] Frontend URL obtained: `https://______.vercel.app`
- [ ] Initial test: Open frontend URL in browser

## Railway Deployment (Backend)

### Account Setup
- [ ] Railway account created at https://railway.app
- [ ] GitHub repository connected to Railway

### Service Configuration
- [ ] Backend service created
- [ ] Build command set: `cd backend && mvn clean package -DskipTests`
- [ ] Start command set: `cd backend && java -jar target/tensonly-0.0.1-SNAPSHOT.jar`

### Environment Variables (in Railway)
- [ ] `MONGODB_URI` = Your MongoDB Atlas connection string
- [ ] `APP_JWT_SECRET` = Secure random secret (min 256 bits)
- [ ] `RAZORPAY_KEY_ID` = Live key ID
- [ ] `RAZORPAY_KEY_SECRET` = Live secret (keep safe!)
- [ ] `APP_CORS_ALLOWED_ORIGINS` = Vercel frontend URL from above
- [ ] `SPRING_PROFILES_ACTIVE=prod`
- [ ] `SERVER_PORT=8080`

### Deployment
- [ ] Deployment triggered
- [ ] Build succeeded (check logs)
- [ ] Service running (health check passed)
- [ ] Backend URL obtained from Railway domain
- [ ] Health check: `curl https://backend-url/actuator/health`

## Post-Deployment Configuration

### Update Vercel with Backend URL
- [ ] Go to Vercel project → Settings → Environment Variables
- [ ] Update `NEXT_PUBLIC_API_URL` with Railway backend URL
- [ ] Click "Redeploy" to trigger new deployment
- [ ] Wait for deployment to complete

### Verify CORS Configuration
- [ ] CORS preflight test:
  ```bash
  curl -X OPTIONS https://backend-url/api/events \
    -H "Origin: https://vercel-frontend-url" \
    -H "Access-Control-Request-Method: GET" -v
  ```
- [ ] Should see `Access-Control-Allow-Origin` header in response

## Integration Testing

### Frontend
- [ ] Open https://frontend-url in browser
- [ ] Homepage loads without errors
- [ ] Navigation works
- [ ] No console errors (F12 → Console)

### Backend
- [ ] Events endpoint responds: `curl https://backend-url/api/events`
- [ ] Health endpoint responds: `curl https://backend-url/actuator/health`

### Full Flow
- [ ] Login flow works
- [ ] Can view events from backend
- [ ] Payment modal opens
- [ ] Razorpay integration loads
- [ ] Test payment can be created
- [ ] Ticket appears in dashboard after payment

## Monitoring & Alerts

### Logging Setup
- [ ] Vercel logs accessible from Dashboard → Deployments
- [ ] Railway logs accessible from Dashboard → Logs
- [ ] Check logs for any errors or warnings

### Optional: Error Tracking
- [ ] (Optional) Set up Sentry for error monitoring
- [ ] (Optional) Set up analytics (e.g., Posthog)
- [ ] (Optional) Set up monitoring (e.g., Uptime Robot)

## Rollback Procedure

### If Frontend Breaks
1. Go to Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click "..." → "Rollback to this Deployment"

### If Backend Breaks
1. Go to Railway Dashboard → Deployments (Backend)
2. Find previous successful deployment
3. Click on it → Redeploy

## Security Verification

- [ ] No secrets in code (all in environment variables)
- [ ] `RAZORPAY_KEY_SECRET` not exposed in logs
- [ ] `APP_JWT_SECRET` is strong and random
- [ ] CORS doesn't use wildcard `*`
- [ ] HTTPS enforced for API calls
- [ ] MongoDB IP whitelist configured correctly
- [ ] Both deployments are on HTTPS

## Documentation

- [ ] DEPLOYMENT.md reviewed and updated
- [ ] Environment variable examples created
- [ ] Credentials securely stored (password manager recommended)
- [ ] Team notified of production URLs
- [ ] Status page/monitoring dashboard set up (optional)

## Final Verification

- [ ] Production frontend URL: `https://______.vercel.app`
- [ ] Production backend URL: `https://______.railway.app`
- [ ] All critical flows tested end-to-end
- [ ] Team can access production environment
- [ ] Rollback procedure tested and documented
- [ ] Support/monitoring plan in place

---

## Quick Links

| Service | Link | Type |
|---------|------|------|
| Frontend | https://______.vercel.app | Production |
| Backend | https://______.railway.app | Production |
| Vercel Dashboard | https://vercel.com/dashboard | Management |
| Railway Dashboard | https://railway.app/dashboard | Management |
| GitHub Repo | (your GitHub URL) | Source Control |
| MongoDB Atlas | https://cloud.mongodb.com | Database |
| Razorpay Dashboard | https://dashboard.razorpay.com | Payments |

---

## Support

- For Vercel issues: Check [Vercel Docs](https://vercel.com/docs)
- For Railway issues: Check [Railway Docs](https://docs.railway.app)
- For MongoDB issues: Check [Atlas Docs](https://docs.atlas.mongodb.com)
- For Spring Boot issues: Check [Spring Docs](https://spring.io/projects/spring-boot)

**Deployment Date:** _____________________

**Deployed By:** _____________________

**Status:** ☐ In Progress ☐ Completed ☐ Failed (Rollback)

---

Last Updated: 2026-06-26
