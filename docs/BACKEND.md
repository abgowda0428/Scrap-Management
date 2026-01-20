# Backend Documentation

## Overview

The backend is built using Supabase with PostgreSQL and follows enterprise-grade clean architecture principles.

## Core Responsibilities

* Authentication & authorization
* Data validation & security
* Audit logging
* Analytics via materialized views

## Security

* Row Level Security (RLS) on all tables
* Role-based access control
* Zero-trust enforcement
* No hardcoded secrets

## Database Highlights

* 13+ core tables
* 17+ enums
* 50+ optimized indexes
* Audit triggers
* Soft delete support

## Authentication

* Supabase Auth
* JWT-based sessions
* Role helpers

## Scalability

* Connection pooling
* Read-optimized views
* Horizontal scaling ready
