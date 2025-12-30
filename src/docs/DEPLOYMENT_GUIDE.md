## 🚀 DEPLOYMENT GUIDE
### Autocrat Engineers - Scrap Management System

**Version**: 1.0.0  
**Last Updated**: December 17, 2025

---

## 📋 TABLE OF CONTENTS

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Migration](#database-migration)
4. [Frontend Deployment](#frontend-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Rollback Procedure](#rollback-procedure)
8. [Troubleshooting](#troubleshooting)

---

## 1. PRE-DEPLOYMENT CHECKLIST

### Security Checklist
- [ ] All `.env` files are in `.gitignore`
- [ ] No hardcoded credentials in code
- [ ] Service role key never exposed to frontend
- [ ] RLS enabled on all tables
- [ ] HTTPS enforced in production
- [ ] CORS configured for production domain only
- [ ] File upload limits enforced
- [ ] Session timeout configured

### Code Quality Checklist
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] ESLint warnings resolved
- [ ] Code reviewed and approved
- [ ] Build succeeds without errors
- [ ] No console.log in production code

### Documentation Checklist
- [ ] API documentation updated
- [ ] Environment variables documented
- [ ] Deployment steps reviewed
- [ ] Rollback procedure documented

---

## 2. SUPABASE PROJECT SETUP

### 2.1 Create Production Project

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com/
   - Click "New Project"

2. **Project Configuration**
   ```
   Name: autocrat-scrap-management-prod
   Database Password: [STRONG PASSWORD - SAVE IN PASSWORD MANAGER]
   Region: [Select closest to users]
   Pricing Plan: Pro (recommended for production)
   ```

3. **Save Project Details**
   ```
   Project URL: https://[project-ref].supabase.co
   Anon Key: eyJ... [Save securely]
   Service Role Key: eyJ... [Save securely - CRITICAL]
   ```

### 2.2 Configure Project Settings

#### Authentication Settings
```
Dashboard → Authentication → Settings

✅ Enable email confirmations: Yes
✅ Secure email change: Yes
✅ Session timeout: 8 hours
✅ JWT expiry: 8 hours
❌ Enable signups: No (Manual user creation only)
```

#### Storage Settings
```
Dashboard → Storage → Settings

✅ File size limit: 10 MB
✅ Allowed MIME types: image/jpeg, image/png, application/pdf
```

#### Database Settings
```
Dashboard → Database → Settings

✅ Connection pooling: Enabled (Supavisor)
✅ SSL enforcement: Enabled
✅ Daily backups: Enabled
✅ Point-in-time recovery: Enabled (Pro plan)
```

---

## 3. DATABASE MIGRATION

### 3.1 Using Supabase SQL Editor (Recommended for First Deployment)

**Step 1**: Run Initial Schema
```sql
-- Go to: Dashboard → SQL Editor → New Query
-- Copy/paste content from: /supabase/migrations/00001_initial_schema.sql
-- Click "Run"
-- Wait for success message
```

**Step 2**: Add RLS Policies
```sql
-- New Query
-- Copy/paste: /supabase/migrations/00002_add_rls_policies.sql
-- Run
```

**Step 3**: Add Audit Triggers
```sql
-- New Query
-- Copy/paste: /supabase/migrations/00003_add_audit_triggers.sql
-- Run
```

**Step 4**: Add Materialized Views
```sql
-- New Query
-- Copy/paste: /supabase/migrations/00004_add_materialized_views.sql
-- Run
```

**Step 5**: Refresh Materialized Views
```sql
-- New Query
SELECT public.fn_refresh_all_materialized_views();
-- Run
```

### 3.2 Using Supabase CLI (Recommended for Updates)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref [your-project-ref]

# Push migrations
supabase db push

# Verify migrations
supabase db diff
```

### 3.3 Seed Initial Data

**Admin User**:
```sql
-- Create admin user in auth.users first
-- Then add to public.users

INSERT INTO public.users (
  id, 
  employee_id, 
  full_name, 
  email, 
  role, 
  department, 
  shift, 
  is_active
) VALUES (
  '[UUID from auth.users]',
  'EMP001',
  'Admin User',
  'admin@autocratengineers.com',
  'ADMIN',
  'Management',
  'DAY',
  true
);
```

**Test Materials** (Optional for demo):
```sql
-- See /supabase/seed/02_materials.sql
```

---

## 4. FRONTEND DEPLOYMENT

### 4.1 Deployment to Vercel

**Step 1**: Install Vercel CLI
```bash
npm install -g vercel
```

**Step 2**: Login
```bash
vercel login
```

**Step 3**: Configure Project
```bash
# In project root
vercel

# Follow prompts:
# - Project name: autocrat-scrap-management
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
```

**Step 4**: Set Environment Variables
```bash
# Go to Vercel Dashboard → Project → Settings → Environment Variables

Add:
VITE_SUPABASE_URL=[your-production-supabase-url]
VITE_SUPABASE_ANON_KEY=[your-production-anon-key]
NODE_ENV=production
VITE_APP_VERSION=1.0.0
VITE_FEATURE_SAP_INTEGRATION=false
VITE_FEATURE_FILE_UPLOADS=true
VITE_FEATURE_ANALYTICS=true
VITE_MAX_FILE_SIZE_MB=10
VITE_SESSION_TIMEOUT=480
VITE_LOG_LEVEL=warn
VITE_HTTPS_ONLY=true
```

**Step 5**: Deploy
```bash
vercel --prod
```

### 4.2 Deployment to Netlify

**Step 1**: Install Netlify CLI
```bash
npm install -g netlify-cli
```

**Step 2**: Login
```bash
netlify login
```

**Step 3**: Initialize
```bash
netlify init

# Follow prompts
```

**Step 4**: Configure Build Settings
```
Build command: npm run build
Publish directory: dist
```

**Step 5**: Set Environment Variables
```bash
# Go to Netlify Dashboard → Site Settings → Build & deploy → Environment

Add same variables as Vercel
```

**Step 6**: Deploy
```bash
netlify deploy --prod
```

### 4.3 Custom Server Deployment

**Prerequisites**:
- Node.js 18+
- Nginx or Apache
- SSL certificate (Let's Encrypt recommended)

**Build for Production**:
```bash
# Create production build
npm run build

# Output will be in /dist folder
```

**Nginx Configuration**:
```nginx
server {
    listen 443 ssl http2;
    server_name app.autocratengineers.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/scrap-management/dist;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https://*.supabase.co;" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name app.autocratengineers.com;
    return 301 https://$server_name$request_uri;
}
```

**Deploy Files**:
```bash
# Upload dist folder to server
rsync -avz --delete dist/ user@server:/var/www/scrap-management/dist/

# Restart Nginx
sudo systemctl restart nginx
```

---

## 5. ENVIRONMENT CONFIGURATION

### 5.1 Production Environment Variables

**Required Variables**:
```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
NODE_ENV=production
VITE_APP_NAME="Autocrat Engineers - Scrap Management"
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_FEATURE_SAP_INTEGRATION=false
VITE_FEATURE_FILE_UPLOADS=true
VITE_FEATURE_ANALYTICS=true
VITE_FEATURE_AUDIT_LOGS=true

# File Upload Configuration
VITE_MAX_FILE_SIZE_MB=10
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png

# API Configuration
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ENABLED=true
VITE_API_RETRY_ATTEMPTS=3

# Security Configuration
VITE_SESSION_TIMEOUT=480
VITE_HTTPS_ONLY=true
VITE_CORS_ENABLED=false

# Logging Configuration
VITE_LOG_LEVEL=warn
VITE_LOG_CONSOLE=false
VITE_LOG_REMOTE=true

# Development Tools (DISABLE IN PRODUCTION)
VITE_REACT_DEVTOOLS=false
VITE_SOURCE_MAPS=false
```

### 5.2 Staging Environment Variables

```bash
# Same as production but with staging project
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=[staging-anon-key]

# Enable more logging
VITE_LOG_LEVEL=info
VITE_LOG_CONSOLE=true

# Enable all features for testing
VITE_FEATURE_SAP_INTEGRATION=true
VITE_FEATURE_FILE_UPLOADS=true
VITE_FEATURE_ANALYTICS=true
```

### 5.3 Environment Variable Management

**Vercel**:
```
Dashboard → Project → Settings → Environment Variables
- Production: Add with environment = Production
- Staging: Add with environment = Preview
- Development: Add with environment = Development
```

**Netlify**:
```
Dashboard → Site Settings → Build & deploy → Environment
- Add variables
- Optionally add context-specific variables
```

**GitHub Actions** (for CI/CD):
```yaml
# .github/workflows/deploy.yml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

---

## 6. POST-DEPLOYMENT VERIFICATION

### 6.1 Health Checks

**Database Connection**:
```bash
# Test query
curl -X POST https://[project-ref].supabase.co/rest/v1/rpc/health_check \
  -H "apikey: [anon-key]" \
  -H "Authorization: Bearer [anon-key]"
```

**Frontend Build**:
```bash
# Check if site loads
curl -I https://app.autocratengineers.com

# Should return 200 OK
```

### 6.2 Feature Testing

**Authentication**:
- [ ] Can login with test account
- [ ] Session persists on page reload
- [ ] Cannot access without authentication
- [ ] Logout works correctly

**Role-Based Access**:
- [ ] Operator can see only their jobs
- [ ] Supervisor can see team jobs
- [ ] Manager can see all jobs
- [ ] Admin can access user management

**Core Features**:
- [ ] Create cutting job
- [ ] Add cut pieces
- [ ] Move pieces to next operation
- [ ] Generate bin label
- [ ] Create scrap entry
- [ ] Approve/reject scrap (as supervisor)
- [ ] View reports
- [ ] Upload photos

**Performance**:
- [ ] Initial page load < 3 seconds
- [ ] Subsequent navigations < 1 second
- [ ] API responses < 500ms (average)
- [ ] No JavaScript errors in console

### 6.3 Security Verification

**RLS Policies**:
```sql
-- Test as operator: Should only see own jobs
SELECT * FROM cutting_jobs;

-- Test as supervisor: Should see team jobs
SELECT * FROM cutting_jobs WHERE supervisor_id = auth.uid();

-- Test data isolation
-- User A should not see User B's data
```

**Authentication**:
- [ ] Cannot access API without valid token
- [ ] Expired tokens are rejected
- [ ] Invalid tokens are rejected
- [ ] Logout clears session

**File Uploads**:
- [ ] Cannot upload files > 10MB
- [ ] Cannot upload disallowed file types
- [ ] Can only access own uploaded files

---

## 7. ROLLBACK PROCEDURE

### 7.1 Frontend Rollback

**Vercel**:
```
1. Go to Deployments tab
2. Find previous working deployment
3. Click three dots → Promote to Production
4. Confirm promotion
```

**Netlify**:
```
1. Go to Deploys tab
2. Find previous working deployment
3. Click "Publish deploy"
4. Confirm
```

**Custom Server**:
```bash
# Restore from backup
cp -r /backup/dist-previous /var/www/scrap-management/dist
sudo systemctl restart nginx
```

### 7.2 Database Rollback

**⚠️ CRITICAL**: Database rollbacks are complex and risky

**Option 1: Point-in-Time Recovery (Supabase Pro)**
```
1. Go to Database → Backups
2. Select restore point (within last 7 days)
3. Restore to new project (don't overwrite production)
4. Verify data integrity
5. Update frontend to point to restored database
```

**Option 2: Manual Restore from Backup**
```bash
# Restore from pg_dump
psql $DATABASE_URL < backup.sql

# Verify data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM cutting_jobs;"
```

**Option 3: Selective Rollback**
```sql
-- Restore specific table from audit logs
-- This is complex and should be done by experienced DBA
```

### 7.3 Rollback Testing

**Before Production Rollback**:
1. Test rollback in staging environment
2. Verify data integrity after rollback
3. Test critical user flows
4. Get approval from stakeholders
5. Execute production rollback during maintenance window

---

## 8. TROUBLESHOOTING

### 8.1 Common Issues

#### Issue: "Failed to fetch" or CORS errors

**Symptoms**:
- Network errors in browser console
- API requests fail
- "Access-Control-Allow-Origin" errors

**Solutions**:
```bash
# 1. Verify Supabase URL is correct
echo $VITE_SUPABASE_URL

# 2. Check CORS settings in Supabase
Dashboard → Settings → API → CORS

# 3. Verify anon key is correct
# It should start with "eyJ"

# 4. Check if project is paused (free tier)
Dashboard → Project Status
```

#### Issue: "Row Level Security policy violation"

**Symptoms**:
- 403 Forbidden errors
- Cannot access data
- "RLS policy violation" in error message

**Solutions**:
```sql
-- 1. Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 2. Check if user has required role
SELECT role FROM users WHERE id = auth.uid();

-- 3. Test RLS policies
SELECT * FROM cutting_jobs;  -- Should only show authorized jobs

-- 4. Temporarily disable RLS for debugging (DEVELOPMENT ONLY!)
ALTER TABLE cutting_jobs DISABLE ROW LEVEL SECURITY;
-- Test query
-- Re-enable immediately:
ALTER TABLE cutting_jobs ENABLE ROW LEVEL SECURITY;
```

#### Issue: Slow Performance

**Symptoms**:
- API requests take > 2 seconds
- UI lags
- Database queries timeout

**Solutions**:
```sql
-- 1. Check for missing indexes
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';

-- 2. Analyze slow queries
-- Go to Dashboard → Database → Query Performance

-- 3. Refresh materialized views
SELECT public.fn_refresh_all_materialized_views();

-- 4. Check connection pool
-- Dashboard → Database → Connection Pooling
```

#### Issue: File Upload Failures

**Symptoms**:
- "File too large" errors
- "Invalid file type" errors
- Upload progress hangs

**Solutions**:
```typescript
// 1. Check file size
if (file.size > MAX_SIZE) {
  console.error('File too large:', file.size);
}

// 2. Check file type
if (!ALLOWED_TYPES.includes(file.type)) {
  console.error('Invalid type:', file.type);
}

// 3. Check storage bucket RLS
-- In Supabase SQL Editor:
SELECT * FROM storage.objects WHERE bucket_id = 'scrap-photos';
```

### 8.2 Debug Mode

**Enable Detailed Logging** (Development/Staging Only):
```bash
# Set in .env
VITE_LOG_LEVEL=debug
VITE_LOG_CONSOLE=true
```

**Browser DevTools**:
```javascript
// In browser console
// Enable Supabase logging
localStorage.setItem('supabase.debug', 'true');

// Reload page and check network tab
```

### 8.3 Getting Help

**Before Asking for Help, Collect**:
1. Error message (exact text)
2. Browser console logs
3. Network request/response
4. Steps to reproduce
5. Environment (production/staging/local)
6. User role attempting the action

**Support Channels**:
- Email: support@autocratengineers.com
- Supabase Support: https://supabase.com/support
- Internal Slack: #scrap-management-support

---

## 9. MONITORING & MAINTENANCE

### 9.1 Daily Checks

- [ ] Check Supabase Dashboard for errors
- [ ] Review application logs
- [ ] Monitor disk space (database)
- [ ] Check backup status

### 9.2 Weekly Checks

- [ ] Review performance metrics
- [ ] Analyze slow queries
- [ ] Check for failed jobs/operations
- [ ] Review audit logs for suspicious activity

### 9.3 Monthly Checks

- [ ] Review and update dependencies
- [ ] Run security audit (`npm audit`)
- [ ] Test backup restore procedure
- [ ] Review and optimize database indexes

### 9.4 Scheduled Tasks

**Daily**:
- Refresh materialized views
- Archive old audit logs (> 90 days)
- Send daily reports (if configured)

**Weekly**:
- Full database backup
- Performance report

**Monthly**:
- Security audit
- Dependency updates
- Capacity planning review

---

## 10. SUCCESS CRITERIA

Deployment is successful when:

- [ ] All health checks pass
- [ ] Critical user flows work
- [ ] Performance metrics meet requirements (< 3s initial load, < 1s navigation)
- [ ] No security vulnerabilities detected
- [ ] No JavaScript errors in console
- [ ] All roles can access appropriate features
- [ ] Data is properly isolated (RLS working)
- [ ] Backups are functioning
- [ ] Monitoring is active
- [ ] Team is notified and trained
- [ ] Documentation is updated
- [ ] Rollback procedure is tested and ready

---

## 📞 EMERGENCY CONTACTS

**Production Issues**:
- On-call Engineer: [Phone]
- DevOps Lead: [Phone]
- CTO: [Phone]

**Supabase Support**:
- Email: support@supabase.com
- Priority Support: [For Pro/Enterprise]

---

**GOOD LUCK WITH YOUR DEPLOYMENT! 🚀**

Remember:
- Test thoroughly in staging first
- Have rollback plan ready
- Monitor closely after deployment
- Communicate with stakeholders
