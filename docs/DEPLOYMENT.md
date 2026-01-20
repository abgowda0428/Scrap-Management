# Deployment Guide

## Environments

* Local
* Staging
* Production

## Configuration

All configuration is handled via environment variables.

Required variables:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Deployment Steps

1. Setup Supabase project
2. Run database migrations
3. Configure environment variables
4. Deploy frontend (Vercel / Netlify)

## Post-Deployment Checks

* Authentication works
* RLS policies enforced
* Reports load correctly
* Audit logs recorded

## Rollback Strategy

* Database backups
* Versioned deployments
