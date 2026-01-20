# 🏭 Scrap Management System (SMS)

Enterprise-grade Scrap, Cutting & Inventory Optimization Platform

---

## Overview

The Scrap Management System (SMS) is a production-ready manufacturing platform designed to track, classify, approve, analyze, and optimize scrap generated during cutting and fabrication operations. It enforces accountability, auditability, and cost optimization across operators, supervisors, managers, and admins.

## Key Capabilities

* Two-dimensional scrap classification (Material + Usability)
* Supervisor approval workflow with audit trail
* End-to-end cutting job lifecycle
* Operation-by-operation cutting logs
* End-piece reuse and inventory optimization
* Advanced reports and analytics
* Role-based access control (RBAC)

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts

**Backend:** Supabase (PostgreSQL, Auth, RLS, Edge Functions, Storage)

## Repository Structure

```
src/
 ├── components/
 ├── services/
 ├── config/
 ├── types/
 └── App.tsx

supabase/
 ├── migrations/
 └── functions/

docs/
 ├── FRONTEND.md
 ├── BACKEND.md
 ├── ARCHITECTURE.md
 ├── DEPLOYMENT.md
 └── IMPLEMENTATION_SUMMARY.md
```

## Local Setup

```bash
git clone https://github.com/AutoCrat-Engineers/Scrap-Management-System.git
cd Scrap-Management-System
npm install
cp .env.example .env.local
npm run dev
```

## Production Readiness

* Zero-trust security
* Database-level authorization (RLS)
* Audit logging
* Environment-agnostic configuration
* ERP/SAP integration ready

## License

Proprietary – AutoCrat Engineers
