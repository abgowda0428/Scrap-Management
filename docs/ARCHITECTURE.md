# System Architecture

## High-Level Flow

```
Frontend (React)
   ↓
Service Layer
   ↓
Supabase Gateway
(Auth + RLS)
   ↓
PostgreSQL Database
```

## Architectural Principles

* Clean Architecture
* Separation of concerns
* Database-enforced authorization
* Scalable by design

## Roles

* Operator
* Supervisor
* Manager
* Admin

## Data Flow

* Operator creates job and logs scrap
* Supervisor reviews and approves
* Manager analyzes reports
* Admin manages users and configuration
