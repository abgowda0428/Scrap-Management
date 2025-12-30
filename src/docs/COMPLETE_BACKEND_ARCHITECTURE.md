# COMPLETE BACKEND ARCHITECTURE DOCUMENTATION
## Autocrat Engineers - Scrap Management System

**Author**: Principal Software Engineer (SDE-3+)  
**Date**: December 17, 2025  
**Version**: 1.0.0  

---

## 📋 TABLE OF CONTENTS

1. [Architecture Overview](#1-architecture-overview)
2. [Database Design](#2-database-design)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [API & Data Flow](#4-api--data-flow)
5. [Environment Management](#5-environment-management)
6. [Frontend Integration](#6-frontend-integration)
7. [Security](#7-security)
8. [Scalability & Maintainability](#8-scalability--maintainability)
9. [Developer Experience](#9-developer-experience)

---

## 1️⃣ ARCHITECTURE OVERVIEW

### System Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
│  • React Components (Presentation Only)                      │
│  • Context API (State Management)                           │
│  • Service Layer (API Abstraction)                          │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS (TLS 1.3)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                 SERVICE LAYER (Frontend)                     │
│  • auth.service.ts        - Authentication                   │
│  • cutting-jobs.service.ts - Job management                  │
│  • cut-pieces.service.ts  - Cut pieces tracking             │
│  • scrap.service.ts       - Scrap management                │
│  • reports.service.ts     - Analytics & reporting           │
└──────────────────┬──────────────────────────────────────────┘
                   │ Supabase Client SDK
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE API GATEWAY                            │
│  • Auto-managed authentication                               │
│  • Request validation                                        │
│  • Rate limiting                                            │
│  • RLS enforcement                                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────────┐  ┌──────────────────────┐
│  EDGE FUNCTIONS  │  │   DATABASE LAYER     │
│  (Complex Logic) │  │   (PostgreSQL + RLS) │
│                  │  │                      │
│  • Approvals     │  │  • Tables           │
│  • Reports       │  │  • RLS Policies     │
│  • Validations   │  │  • Triggers         │
│  • Workflows     │  │  • Functions        │
└──────────────────┘  └──────────────────────┘
```

### Separation of Concerns

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | UI Components, user interactions | `/src/components/` |
| **State Management** | Application state, context | `/src/context/AppContext.tsx` |
| **Service Layer** | API abstraction, data transformation | `/src/services/api/` |
| **Business Logic** | Complex operations, workflows | `/supabase/functions/` |
| **Data Access** | Database operations, RLS | PostgreSQL + RLS policies |
| **Storage** | File management | Supabase Storage |

---

## 2️⃣ DATABASE DESIGN

### Schema Overview

**Total Tables**: 13 core tables  
**Total Enums**: 17 type-safe enums  
**Total Views**: 7 materialized views + 3 regular views  
**Total Indexes**: 50+ optimized indexes  

### Core Tables

#### 1. Users Table
```sql
users
├── id (UUID, PK, FK to auth.users)
├── employee_id (VARCHAR, UNIQUE)
├── full_name (VARCHAR)
├── email (VARCHAR, UNIQUE)
├── role (user_role ENUM)
├── department (VARCHAR)
├── shift (shift ENUM)
├── is_active (BOOLEAN)
├── created_at, updated_at
└── deleted_at (soft delete)
```

**RLS Policies**:
- Users can view their own profile
- Users can view other active users (basic info)
- Only ADMIN can create/modify users
- Users can update limited fields (name, shift)

#### 2. Raw Materials Table
```sql
raw_materials
├── id (UUID, PK)
├── item_code (VARCHAR, UNIQUE) -- RM0001
├── material_identification (TEXT)
├── material_shape (material_shape ENUM)
├── material_category (material_category ENUM)
├── material_grade (VARCHAR) -- SS304, 6061, etc.
├── dimension_size (VARCHAR)
├── cost_per_kg (DECIMAL)
├── current_stock_qty (DECIMAL)
├── supplier_name (VARCHAR)
└── Standard audit fields
```

**RLS Policies**:
- All authenticated users can view
- SUPERVISOR+ can create/update
- MANAGER+ can delete

#### 3. Cutting Jobs Table
```sql
cutting_jobs
├── id (UUID, PK)
├── job_order_no (VARCHAR, UNIQUE)
├── scrap_tracking_id (VARCHAR, UNIQUE, AUTO-GENERATED)
├── operator_id (UUID, FK to users)
├── supervisor_id (UUID, FK to users)
├── machine_id (UUID, FK to machines)
├── material_id (UUID, FK to raw_materials)
├── total_input_weight_kg (DECIMAL)
├── total_output_weight_kg (DECIMAL)
├── total_scrap_weight_kg (DECIMAL)
├── scrap_percentage (DECIMAL, CALCULATED)
├── status (job_status ENUM)
├── sap_updated (BOOLEAN)
└── Standard audit fields
```

**RLS Policies**:
- Operators see only their jobs
- Supervisors see jobs they supervise
- Managers see all jobs
- Operators can create own jobs
- Supervisors can update supervised jobs
- Managers can update any job

**Triggers**:
- Auto-calculate scrap percentage
- Validate weight balance (input = output + scrap + waste)
- Update material stock on job creation
- Generate scrap tracking ID

#### 4. Cut Pieces Table
```sql
cut_pieces
├── id (UUID, PK)
├── cutting_job_id (UUID, FK)
├── material_id (UUID, FK)
├── finished_good_id (UUID, FK)
├── operator_id (UUID, FK)
├── single_part_weight_kg (DECIMAL)
├── cut_pieces_count (INTEGER)
├── total_weight_kg (DECIMAL, CALCULATED)
├── next_operation (VARCHAR) -- CNC, VMC, etc.
├── status (cut_piece_status ENUM)
├── used_in_job_id (VARCHAR) -- Bin ID
├── is_reusable (BOOLEAN)
└── Standard audit fields
```

**RLS Policies**:
- Operators see cut pieces from their jobs
- SUPERVISOR+ see all cut pieces
- Operators can create for their jobs
- Status transitions controlled

#### 5. Bin Movements Table
```sql
bin_movements
├── id (UUID, PK)
├── bin_id (VARCHAR, UNIQUE) -- BIN-YYYYMMDD-XXX
├── job_order_no (VARCHAR)
├── material_id (UUID, FK)
├── finished_good_id (UUID, FK)
├── pieces_count (INTEGER)
├── total_weight_kg (DECIMAL)
├── from_operation (VARCHAR)
├── to_operation (VARCHAR)
├── operator_id (UUID, FK)
├── movement_date, movement_time
├── label_printed (BOOLEAN)
└── Standard audit fields
```

**RLS Policies**:
- Operators see movements they created
- SUPERVISOR+ see all movements
- Operators can create movements
- SUPERVISOR+ can update

#### 6. Scrap Entries Table
```sql
scrap_entries
├── id (UUID, PK)
├── scrap_tracking_id (VARCHAR)
├── cutting_job_id (UUID, FK)
├── material_id (UUID, FK)
├── operator_id (UUID, FK)
├── reason_id (UUID, FK to scrap_reasons)
├── material_category (material_category ENUM)
├── scrap_classification (scrap_classification ENUM)
├── scrap_weight_kg (DECIMAL)
├── scrap_type (scrap_type ENUM)
├── approval_status (approval_status ENUM)
├── approved_by_id (UUID, FK)
├── approval_date, approval_notes
├── photos (JSONB) -- Array of storage paths
├── Reusable tracking fields
├── Disposal tracking fields
└── Standard audit fields
```

**RLS Policies**:
- Operators see own scrap entries
- Supervisors see entries needing approval
- Managers see all entries
- Operators can create/edit PENDING entries
- Supervisors can approve/reject
- Workflow enforced by triggers

**Triggers**:
- Validate approval workflow (only SUPERVISOR+ can approve)
- Set approval metadata on status change

#### 7. Audit Logs Table
```sql
audit_logs
├── id (UUID, PK)
├── table_name (VARCHAR)
├── record_id (UUID)
├── operation (VARCHAR) -- INSERT, UPDATE, DELETE
├── old_values (JSONB)
├── new_values (JSONB)
├── changed_fields (TEXT[])
├── user_id (UUID, FK)
├── user_role (user_role ENUM)
├── ip_address (INET)
├── user_agent (TEXT)
└── created_at
```

**RLS Policies**:
- Users can view own audit logs
- Managers can view all audit logs
- Insert-only (no updates/deletes)

### Materialized Views (Pre-aggregated Analytics)

#### 1. Daily Scrap Summary
```sql
mv_daily_scrap_summary
├── job_date, shift, material_category
├── total_jobs, total_input_kg
├── total_output_kg, total_scrap_kg
├── avg_scrap_percentage
├── total_reusable_kg, total_end_piece_kg
└── Refreshed hourly
```

#### 2. Operator Performance
```sql
mv_operator_performance
├── operator_id, operator_name, department
├── total_jobs, total_material_processed_kg
├── total_scrap_generated_kg, avg_scrap_percentage
├── completed_jobs, approved/rejected_scrap_entries
├── jobs_below_5_percent_scrap
└── avoidable_scrap_kg
```

#### 3. Material Utilization
```sql
mv_material_utilization
├── material_id, item_code, material_category
├── times_used, total_consumed_kg
├── total_scrap_kg, avg_scrap_percentage
├── utilization_percentage
├── total_material_cost, total_scrap_cost
└── Refresh on-demand
```

### Database Functions

```sql
-- Business logic functions
fn_get_job_stats(job_id UUID) -- Get complete job statistics
fn_check_material_availability(material_id UUID, required_qty DECIMAL) -- Stock check
fn_get_pending_approvals(supervisor_id UUID) -- Get pending scrap approvals
fn_refresh_all_materialized_views() -- Refresh all analytics views
```

---

## 3️⃣ AUTHENTICATION & AUTHORIZATION

### Authentication Flow

```
1. User enters credentials
   ↓
2. Frontend calls authService.signIn()
   ↓
3. Supabase Auth validates credentials
   ↓
4. Fetch user profile from users table
   ↓
5. Verify user is_active = true
   ↓
6. Update last_login timestamp
   ↓
7. Return user object to frontend
   ↓
8. Store session in localStorage
   ↓
9. Auto-refresh token before expiry
```

### Authorization Levels

| Role | Level | Permissions |
|------|-------|-------------|
| **OPERATOR** | 1 | Create own jobs, view own data, create scrap entries |
| **SUPERVISOR** | 2 | All OPERATOR + view team data, approve scrap, manage materials |
| **MANAGER** | 3 | All SUPERVISOR + view all data, analytics, soft delete |
| **ADMIN** | 4 | All MANAGER + user management, system config |

### RLS Policy Pattern

```sql
-- Example: Operators can only see their own cutting jobs
CREATE POLICY "cutting_jobs_select_own"
ON public.cutting_jobs FOR SELECT
TO authenticated
USING (
    operator_id = auth.uid() AND 
    deleted_at IS NULL AND 
    public.is_user_active()
);

-- Example: Supervisors can approve scrap
CREATE POLICY "scrap_entries_update_supervisor_approve"
ON public.scrap_entries FOR UPDATE
TO authenticated
USING (
    public.has_min_role('SUPERVISOR') AND 
    deleted_at IS NULL AND
    approval_status = 'PENDING'
)
WITH CHECK (
    public.has_min_role('SUPERVISOR') AND
    approval_status IN ('APPROVED', 'REJECTED') AND
    approved_by_id = auth.uid()
);
```

### Frontend Permission Checks

```typescript
// Check minimum role level
const canApprove = authService.hasMinRole(currentUser, 'SUPERVISOR');

// Role-based UI rendering
{canApprove && (
  <button onClick={handleApprove}>Approve</button>
)}

// Service layer permission check
if (!authService.hasMinRole(user, 'SUPERVISOR')) {
  throw new Error('Insufficient permissions');
}
```

### Session Management

- **Storage**: localStorage with custom key
- **Expiry**: Handled by Supabase Auth
- **Refresh**: Automatic before expiration
- **Timeout**: Configurable (default: 8 hours)
- **Logout**: Clears session and redirects

---

## 4️⃣ API & DATA FLOW

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────┐
│ 1. USER ACTION (Frontend)                           │
│    • Button click                                   │
│    • Form submission                                │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ 2. SERVICE LAYER (Frontend)                         │
│    • Validate input (Zod schemas)                   │
│    • Transform data                                 │
│    • Add metadata (user ID, timestamp)              │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ 3. SUPABASE CLIENT                                  │
│    • Add auth token to request                      │
│    • Send HTTPS request                             │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ 4. SUPABASE API GATEWAY                             │
│    • Validate token                                 │
│    • Rate limiting                                  │
│    • Route to database or Edge Function             │
└───────────────────┬─────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
┌─────────────────┐  ┌──────────────────────┐
│ 5a. EDGE        │  │ 5b. DATABASE         │
│     FUNCTION    │  │     (Direct Query)   │
│                 │  │                      │
│ • Complex logic │  │ • Simple CRUD        │
│ • Validations   │  │ • RLS check          │
│ • Workflows     │  │ • Triggers fire      │
│ • Call DB       │  │ • Return data        │
└─────────┬───────┘  └──────────┬───────────┘
          │                     │
          └──────────┬──────────┘
                     ▼
┌─────────────────────────────────────────────────────┐
│ 6. DATABASE LAYER                                   │
│    • RLS policies enforce access                    │
│    • Triggers execute (audit, validation)           │
│    • Business rules enforced                        │
│    • Return data or error                           │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ 7. RESPONSE PROCESSING                              │
│    • Transform database response                    │
│    • Sanitize sensitive data                        │
│    • Format errors                                  │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ 8. SERVICE LAYER (Frontend)                         │
│    • Parse response                                 │
│    • Handle errors gracefully                       │
│    • Update local state                             │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ 9. UI UPDATE                                        │
│    • Display success/error message                  │
│    • Update component state                         │
│    • Trigger re-render                              │
└─────────────────────────────────────────────────────┘
```

### Service Layer Example: Cutting Jobs

```typescript
// src/services/api/cutting-jobs.service.ts
class CuttingJobsService {
  async createJob(jobData: CreateJobRequest): Promise<JobResponse> {
    try {
      // 1. Validate input (client-side)
      const validated = createJobSchema.parse(jobData);
      
      // 2. Add metadata
      const payload = {
        ...validated,
        created_by: auth.uid(),
        created_at: new Date().toISOString()
      };
      
      // 3. Call database (RLS will enforce permissions)
      const { data, error } = await supabase
        .from('cutting_jobs')
        .insert(payload)
        .select()
        .single();
      
      // 4. Handle response
      if (error) {
        return { job: null, error: parseSupabaseError(error) };
      }
      
      return { job: data, error: null };
    } catch (error) {
      // 5. Handle errors gracefully
      return { job: null, error: parseSupabaseError(error) };
    }
  }
  
  async listJobs(filters: JobFilters): Promise<JobsListResponse> {
    // Implementation with pagination, filtering, sorting
  }
  
  async updateJob(jobId: string, updates: Partial<Job>): Promise<JobResponse> {
    // Implementation with optimistic updates
  }
}

export const cuttingJobsService = new CuttingJobsService();
```

### Error Handling Strategy

```typescript
// Centralized error parsing
export function parseSupabaseError(error: any): string {
  // PostgreSQL error codes
  const pgErrors: Record<string, string> = {
    '23505': 'Record already exists',
    '23503': 'Referenced record not found',
    '42501': 'Permission denied',
  };
  
  if (error.code && pgErrors[error.code]) {
    return pgErrors[error.code];
  }
  
  // Supabase error messages
  if (error.message) {
    return error.message.replace(/^.*?:\s*/, '');
  }
  
  return 'An unexpected error occurred';
}

// Usage in components
try {
  const { job, error } = await cuttingJobsService.createJob(formData);
  if (error) {
    toast.error(error); // User-friendly message
    return;
  }
  toast.success('Job created successfully!');
} catch (error) {
  toast.error('Something went wrong. Please try again.');
  console.error('Unexpected error:', error);
}
```

---

## 5️⃣ ENVIRONMENT MANAGEMENT

### Zero-Configuration Project Switching

**Goal**: Switch between Supabase projects in < 2 minutes without code changes

#### Step 1: Environment Variables

```bash
# .env.local (Local Development)
VITE_SUPABASE_URL=https://local-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...local-key

# .env.staging (Staging)
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...staging-key

# .env.production (Production)
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...prod-key
```

#### Step 2: Centralized Configuration

```typescript
// src/config/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ All Supabase connections use these variables
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ❌ NEVER hardcode:
// const supabase = createClient('https://hardcoded-url.supabase.co', 'hardcoded-key');
```

#### Step 3: Service Layer

```typescript
// src/services/api/client.ts
import { supabase } from '../../config/supabase';

// All services import from centralized config
// No direct Supabase client creation in services

export const client = supabase;
```

#### Step 4: Project Switch Checklist

```
✅ 1. Get new project credentials from Supabase dashboard
✅ 2. Update .env file with new URL and keys
✅ 3. Restart development server: npm run dev
✅ 4. Verify connection in browser console
✅ 5. Test authentication
✅ 6. Done! ⏱️ Total time: < 2 minutes
```

### Environment-Specific Configuration

```typescript
// src/config/constants.ts
export const CONFIG = {
  // API Configuration
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  API_RETRY_ATTEMPTS: Number(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
  
  // File Upload
  MAX_FILE_SIZE_MB: Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 10,
  ALLOWED_FILE_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png'],
  
  // Features
  FEATURE_SAP_INTEGRATION: import.meta.env.VITE_FEATURE_SAP_INTEGRATION === 'true',
  FEATURE_ANALYTICS: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
  
  // Security
  SESSION_TIMEOUT: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 480,
  
  // Logging
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  LOG_CONSOLE: import.meta.env.VITE_LOG_CONSOLE === 'true',
};
```

### Secrets Management

**CRITICAL RULES**:

1. ✅ **Anon Key**: Safe to expose (RLS protected)
2. ❌ **Service Role Key**: NEVER expose to frontend
3. ✅ **Environment Variables**: Use platform-specific methods
4. ❌ **Hardcoded Values**: Never in code
5. ✅ **Version Control**: .env files in .gitignore

```bash
# .gitignore
.env
.env.local
.env.staging
.env.production
.env.*.local
```

### Production Deployment

**Vercel / Netlify**:
```
Project Settings → Environment Variables
├── VITE_SUPABASE_URL
├── VITE_SUPABASE_ANON_KEY
└── [Other variables]
```

**Docker**:
```dockerfile
# Pass environment variables at runtime
docker run -e VITE_SUPABASE_URL=$URL -e VITE_SUPABASE_ANON_KEY=$KEY app
```

---

## 6️⃣ FRONTEND INTEGRATION

### Service Layer Pattern

```typescript
// src/services/api/cutting-jobs.service.ts
import { supabase, parseSupabaseError } from '../../config/supabase';

class CuttingJobsService {
  /**
   * Create a new cutting job
   * - Validates input
   * - Checks material availability
   * - Enforces business rules
   * - Returns type-safe response
   */
  async createJob(data: CreateJobRequest): Promise<JobResponse> {
    // Business logic here
  }
  
  /**
   * List cutting jobs with filters
   * - Pagination
   * - Sorting
   * - Filtering by status, operator, etc.
   */
  async listJobs(filters: JobFilters): Promise<JobListResponse> {
    // Implementation
  }
}

export const cuttingJobsService = new CuttingJobsService();
```

### Component Usage

```tsx
// src/components/CuttingJobForm.tsx
import { cuttingJobsService } from '../services/api/cutting-jobs.service';

function CuttingJobForm() {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (formData) => {
    setLoading(true);
    
    try {
      const { job, error } = await cuttingJobsService.createJob(formData);
      
      if (error) {
        toast.error(error);
        return;
      }
      
      toast.success('Job created successfully!');
      navigate(`/jobs/${job.id}`);
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Create job error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Data Validation

```typescript
// src/services/validation/schemas.ts
import { z } from 'zod';

export const createJobSchema = z.object({
  job_order_no: z.string().min(1, 'Job order number is required'),
  machine_id: z.string().uuid('Invalid machine ID'),
  material_id: z.string().uuid('Invalid material ID'),
  total_input_weight_kg: z.number().positive('Weight must be positive'),
  // ... other fields
});

// Usage
try {
  const validated = createJobSchema.parse(formData);
  // Proceed with validated data
} catch (error) {
  if (error instanceof z.ZodError) {
    // Display validation errors to user
    error.errors.forEach(err => {
      toast.error(`${err.path}: ${err.message}`);
    });
  }
}
```

---

## 7️⃣ SECURITY

### Zero-Trust Security Model

**Principles**:
1. **Deny by Default**: Everything blocked unless explicitly allowed
2. **RLS Always On**: Never disable RLS in production
3. **Service Role Isolation**: Only in Edge Functions, never frontend
4. **Input Validation**: Both client and server-side
5. **Audit Everything**: Complete audit trail

### Attack Vectors & Mitigations

#### 1. SQL Injection
**Attack**: Malicious SQL in user input
**Mitigation**:
- ✅ Supabase uses parameterized queries
- ✅ No raw SQL from frontend
- ✅ Input validation with Zod schemas

#### 2. IDOR (Insecure Direct Object Reference)
**Attack**: Access other users' data by manipulating IDs
**Mitigation**:
- ✅ RLS policies enforce ownership
- ✅ `WHERE user_id = auth.uid()` in policies
- ✅ Cannot bypass without service role key

```sql
-- Example: User can only see their own jobs
USING (operator_id = auth.uid())
```

#### 3. Privilege Escalation
**Attack**: User changes their role to ADMIN
**Mitigation**:
- ✅ `role` field excluded from user updates
- ✅ Only ADMIN can change roles
- ✅ Enforced in RLS policy

```sql
WITH CHECK (
  role = (SELECT role FROM users WHERE id = auth.uid())
)
```

#### 4. Token Misuse
**Attack**: Stolen or forged JWT tokens
**Mitigation**:
- ✅ Tokens signed by Supabase (HMAC-SHA256)
- ✅ Short expiration (configurable)
- ✅ Automatic refresh
- ✅ Revocable on logout

#### 5. File Upload Exploits
**Attack**: Upload malicious files
**Mitigation**:
- ✅ File size limits (10MB)
- ✅ MIME type validation
- ✅ Storage RLS policies
- ✅ Virus scanning (optional, via Edge Function)

```typescript
// File upload validation
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

if (file.size > MAX_SIZE) {
  throw new Error('File too large');
}

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type');
}
```

#### 6. Data Leakage
**Attack**: Expose sensitive data in errors
**Mitigation**:
- ✅ Generic error messages to users
- ✅ Detailed errors only in logs
- ✅ No stack traces in production

```typescript
// ❌ BAD: Exposes internals
throw new Error(`Failed to query users table: ${dbError.detail}`);

// ✅ GOOD: Generic message
return { error: 'Unable to fetch users' };
// Log details server-side only
console.error('DB Error:', dbError);
```

### Security Checklist

```
✅ RLS enabled on all tables
✅ Service role key never in frontend
✅ Anon key is the only client-side key
✅ Input validation on frontend and backend
✅ File upload restrictions enforced
✅ Audit logs for all critical operations
✅ Session timeout configured
✅ HTTPS enforced in production
✅ CORS configured correctly
✅ Error messages sanitized
✅ No sensitive data in logs
✅ Regular security updates
✅ Backup and recovery plan
```

---

## 8️⃣ SCALABILITY & MAINTAINABILITY

### Scaling from 10 → 1M Users

#### Database Scaling

**Phase 1: 0-1K Users** (Current Design)
- Single Supabase instance
- Standard indexes
- Real-time queries

**Phase 2: 1K-10K Users**
- Materialized views refreshed hourly
- Connection pooling (Supavisor)
- Read replicas for reports

**Phase 3: 10K-100K Users**
- Partition large tables by date
- Horizontal scaling (Supabase Pro)
- CDN for static assets

**Phase 4: 100K-1M Users**
- Sharding by organization
- Microservices for heavy operations
- Dedicated analytics database

#### Performance Optimization

```sql
-- Partitioning example (when needed)
CREATE TABLE cutting_jobs_2025 PARTITION OF cutting_jobs
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Indexes for common queries
CREATE INDEX CONCURRENTLY idx_cutting_jobs_operator_date 
  ON cutting_jobs(operator_id, job_date) 
  WHERE deleted_at IS NULL;
```

#### Caching Strategy

```typescript
// Service worker cache for static data
const CACHE_TTL = {
  materials: 3600,      // 1 hour
  machines: 3600,       // 1 hour
  users: 300,           // 5 minutes
  jobs: 60,             // 1 minute
};

// Implementation in service layer
async getMaterials() {
  const cached = await cache.get('materials');
  if (cached && !cache.isExpired('materials')) {
    return cached;
  }
  
  const { data } = await supabase.from('raw_materials').select('*');
  await cache.set('materials', data, CACHE_TTL.materials);
  return data;
}
```

#### Background Jobs

```typescript
// Supabase Edge Function for scheduled tasks
// /supabase/functions/scheduled-tasks/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  // Run scheduled tasks:
  // 1. Refresh materialized views
  // 2. Send daily reports
  // 3. Archive old data
  // 4. Send alerts for overdue maintenance
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Refresh analytics views
  await supabase.rpc('fn_refresh_all_materialized_views');
  
  return new Response(JSON.stringify({ success: true }));
});
```

### Monitoring & Observability

```typescript
// Structured logging
const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  
  error: (message: string, error: any, meta?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString(),
      ...meta
    }));
  }
};

// Usage
logger.info('Job created', { jobId, operatorId });
logger.error('Failed to create job', error, { formData });
```

### Backup & Recovery

**Automated Backups**:
- Supabase: Daily automatic backups (7-day retention)
- Manual: `pg_dump` for critical data

**Recovery Plan**:
1. Identify issue
2. Notify users (status page)
3. Restore from backup (RTO: < 1 hour)
4. Verify data integrity
5. Resume operations

---

## 9️⃣ DEVELOPER EXPERIENCE

### Setup Guide (Step-by-Step)

#### 1. Prerequisites
```bash
# Install Node.js 18+
node --version

# Install dependencies
npm install

# Install Supabase CLI (optional, for local dev)
npm install -g supabase
```

#### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Open .env.local and fill in:
# 1. Go to https://app.supabase.com/project/YOUR_PROJECT/settings/api
# 2. Copy "Project URL" → VITE_SUPABASE_URL
# 3. Copy "anon public key" → VITE_SUPABASE_ANON_KEY
nano .env.local
```

#### 3. Database Setup
```bash
# Run migrations (if using Supabase CLI)
supabase db push

# Or manually:
# 1. Go to Supabase SQL Editor
# 2. Run migrations/00001_initial_schema.sql
# 3. Run migrations/00002_add_rls_policies.sql
# 4. Run migrations/00003_add_audit_triggers.sql
# 5. Run migrations/00004_add_materialized_views.sql
```

#### 4. Seed Data (Optional)
```bash
# Run seed scripts
supabase db seed

# Or manually run:
# /supabase/seed/01_users.sql
# /supabase/seed/02_materials.sql
# etc.
```

#### 5. Start Development Server
```bash
npm run dev

# Open browser to http://localhost:5173
# Check console for Supabase connection status
```

#### 6. Verify Setup
```bash
# Test authentication
# - Go to login page
# - Try signing in with test account
# - Check browser DevTools for errors

# Test database connection
# - Navigate to different pages
# - Check data loads correctly
# - Verify RLS is working (try accessing unauthorized data)
```

### Code Organization Best Practices

```
/src
├── components/          # UI Components
│   ├── CuttingJobForm.tsx
│   └── CutPiecesTracking.tsx
│
├── services/            # Business Logic (API calls)
│   ├── api/
│   │   ├── auth.service.ts
│   │   └── cutting-jobs.service.ts
│   └── validation/
│       └── schemas.ts
│
├── context/             # React Context (State)
│   └── AppContext.tsx
│
├── config/              # Configuration
│   ├── supabase.ts      # ⚠️ SINGLE SOURCE OF TRUTH
│   └── constants.ts
│
├── types/               # TypeScript Types
│   ├── index.ts
│   └── database.types.ts  # Generated from Supabase
│
└── utils/               # Utilities
    └── helpers.ts
```

### Code Style Guidelines

```typescript
// ✅ GOOD: Descriptive names
async function createCuttingJob(data: CreateJobRequest) { }

// ❌ BAD: Vague names
async function create(d: any) { }

// ✅ GOOD: Type safety
interface JobResponse {
  job: CuttingJob | null;
  error: string | null;
}

// ❌ BAD: Any types
function doSomething(): any { }

// ✅ GOOD: Error handling
try {
  const result = await service.createJob(data);
  if (result.error) {
    handleError(result.error);
    return;
  }
  handleSuccess(result.job);
} catch (error) {
  handleUnexpectedError(error);
}

// ❌ BAD: Silent failures
const result = await service.createJob(data);
```

### Testing Strategy

```typescript
// Unit Tests: Services
describe('CuttingJobsService', () => {
  it('should create a job with valid data', async () => {
    const jobData = { /* ... */ };
    const result = await cuttingJobsService.createJob(jobData);
    expect(result.error).toBeNull();
    expect(result.job).toBeDefined();
  });
  
  it('should return error with invalid data', async () => {
    const invalidData = { /* ... */ };
    const result = await cuttingJobsService.createJob(invalidData);
    expect(result.error).toBeDefined();
    expect(result.job).toBeNull();
  });
});

// Integration Tests: Database
describe('RLS Policies', () => {
  it('should allow operators to view only their jobs', async () => {
    // Test implementation
  });
  
  it('should prevent operators from viewing others jobs', async () => {
    // Test implementation
  });
});

// E2E Tests: Full Flow
describe('Create Cutting Job Flow', () => {
  it('should complete job creation from start to finish', async () => {
    // 1. Login as operator
    // 2. Navigate to job creation
    // 3. Fill form
    // 4. Submit
    // 5. Verify job created
  });
});
```

---

## 🎯 QUICK REFERENCE

### Common Commands

```bash
# Development
npm run dev                # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build

# Database
supabase db push           # Apply migrations
supabase db reset          # Reset database (local)
supabase gen types         # Generate TypeScript types

# Code Quality
npm run lint               # Run ESLint
npm run type-check         # Run TypeScript checks
npm run test               # Run tests
```

### Common Tasks

**Switch Supabase Project**:
1. Update `.env.local`
2. Restart dev server
3. Done!

**Add New Table**:
1. Create migration SQL file
2. Add RLS policies
3. Generate TypeScript types
4. Create service methods

**Add New Feature**:
1. Design database schema (if needed)
2. Create service methods
3. Add validation schemas
4. Implement UI components
5. Test with different roles

---

## 📚 ADDITIONAL RESOURCES

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL RLS**: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **TypeScript Best Practices**: https://typescript-eslint.io/
- **React Query (for caching)**: https://tanstack.com/query

---

## 🔐 SECURITY CONTACTS

If you discover a security vulnerability:
1. DO NOT open a public issue
2. Email: security@autocratengineers.com
3. Include: Description, steps to reproduce, impact

---

**END OF DOCUMENTATION**

This architecture is production-ready and follows enterprise standards. All code is commented, environment-agnostic, and designed for long-term maintainability.

For questions or clarifications, refer to inline code comments or reach out to the development team.
