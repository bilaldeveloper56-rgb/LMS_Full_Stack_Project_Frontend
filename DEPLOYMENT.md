# Production Deployment & Infrastructure Guide
# Multi-Tenant School ERP & LMS SaaS Platform

---

## 1. Architecture & Hosting Topology

`
+--------------------------------------------------------+
¦             DNS / Edge Routing (Cloudflare)            ¦
+--------------------------------------------------------+
                ¦                        ¦
        HTTPS (Frontend)          HTTPS + WSS (Backend API)
                ?                        ?
+------------------------------+ +------------------------------+
¦  Frontend Client (Vercel)    ¦ ¦   Backend API (Render /      ¦
¦  - React 19 + Vite SPA       ¦ ¦   Railway / AWS ECS / Docker)¦
¦  - Custom Domain Routing     ¦ ¦   - Node.js 20+ Express      ¦
¦  - Static Asset CDN          ¦ ¦   - Socket.io Engine         ¦
+------------------------------+ +------------------------------+
                                                ¦
                 +------------------------------+------------------------------+
                 ?                              ?                              ?
 +------------------------------++------------------------------++------------------------------+
 ¦   Database (MongoDB Atlas)   ¦¦   Cache (Upstash / Redis)    ¦¦   Media / Storage (Cloudinary¦
 ¦   - Multi-tenant data store  ¦¦   - Distributed rate limiter ¦¦   - Avatars & documents      ¦
 ¦   - Partial unique indexes   ¦¦   - In-memory auto-fallback  ¦¦   - Secure MIME validation   ¦
 +------------------------------++------------------------------++------------------------------+
`

---

## 2. Infrastructure Setup & Environment Variables

### A. Backend Deployment (Render / Railway / AWS / Docker)

1. **Node.js Runtime**: Set Node runtime to 20.x or 22.x.
2. **Build Command**: 
pm install --omit=dev
3. **Start Command**: 
pm start (or 
ode src/server.js)
4. **Environment Variables**:

| Variable | Required | Example / Description |
| :--- | :---: | :--- |
| NODE_ENV | **YES** | production |
| PORT | **YES** | 5000 (or platform dynamic $PORT) |
| MONGO_URI | **YES** | mongodb+srv://<user>:<password>@cluster.mongodb.net/school-erp?retryWrites=true&w=majority |
| FRONTEND_URL | **YES** | https://app.yourdomain.com (comma-separated if multiple origins) |
| JWT_ACCESS_SECRET | **YES** | Minimum 32-character high-entropy cryptographic secret |
| JWT_REFRESH_SECRET | **YES** | Minimum 32-character high-entropy cryptographic secret |
| JWT_ACCESS_EXPIRES_IN | **YES** | 15m |
| JWT_REFRESH_EXPIRES_IN | **YES** | 7d |
| COOKIE_SECURE | **YES** | 	rue |
| COOKIE_SAME_SITE | **YES** | 
one (for cross-site frontend/backend) or lax (for same-domain) |
| COOKIE_DOMAIN | Optional | .yourdomain.com (leave empty for host-only) |
| SUPER_ADMIN_EMAIL | **YES** | dmin@yourdomain.com |
| SUPER_ADMIN_PASSWORD | **YES** | High-entropy password (min 8 chars) |
| EMAIL_PROVIDER | **YES** | esend |
| RESEND_API_KEY | **YES** | e_123456789... |
| SMTP_FROM | **YES** | 
o-reply@yourdomain.com (must match verified domain in Resend) |
| CLOUDINARY_CLOUD_NAME| Optional | Cloudinary cloud identifier |
| CLOUDINARY_API_KEY | Optional | Cloudinary API Key |
| CLOUDINARY_API_SECRET | Optional | Cloudinary API Secret |
| REDIS_URL | Optional | ediss://default:<password>@<host>:<port> (falls back to memory if unset) |

---

### B. Frontend Deployment (Vercel)

1. **Framework Preset**: Vite
2. **Root Directory**: client
3. **Build Command**: 
pm run build
4. **Output Directory**: dist
5. **Environment Variables**:

| Variable | Required | Production Value |
| :--- | :---: | :--- |
| VITE_API_BASE_URL | **YES** | https://api.yourdomain.com/api/v1 |
| VITE_SOCKET_URL | **YES** | https://api.yourdomain.com |

---

## 3. Database Initialization & Seeding

On initial deployment, populate the platform Super Admin account:

`ash
npm run seed:superadmin
`

This ensures the platform owner can authenticate and provision tenant schools.

---

## 4. Email Authentication DNS Configuration (Resend)

To prevent invitation and password reset emails from landing in spam folders, configure the following DNS records on your domain registrar:

1. **SPF (TXT)**:
   - Name: @ or domain name
   - Value: =spf1 include:amazonses.com ~all (or Resend specified record)
2. **DKIM (CNAME / TXT)**:
   - Configure the 3 DKIM tokens generated in your Resend domain settings.
3. **DMARC (TXT)**:
   - Name: _dmarc.yourdomain.com
   - Value: =DMARC1; p=quarantine; rua=mailto:dmarc-reports@yourdomain.com

---

## 5. Production Health Monitoring Endpoints

The backend provides non-authenticated operational endpoints:

- **Overall Health**: GET https://api.yourdomain.com/health
- **Database Status**: GET https://api.yourdomain.com/health/db
- **Redis Cache Status**: GET https://api.yourdomain.com/health/redis

All endpoints sanitize internal connection strings, credentials, and topology.
