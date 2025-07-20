(R=P, V=3)

Below is a detailed technical specification for the Radiation Dose Tracking application. It’s organized to guide development from architecture through API definitions, data model, UI wireframes, and non-functional requirements.

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [1. Overview](#1-overview)
- [2. System Architecture](#2-system-architecture)
- [3. Component Breakdown](#3-component-breakdown)
  - [3.1 Mobile App](#31-mobile-app)
  - [3.2 Backend Services](#32-backend-services)
  - [3.3 Database](#33-database)
- [4. Data Model](#4-data-model)
- [5. API Specification](#5-api-specification)
  - [5.1 Authentication](#51-authentication)
  - [5.2 Workers](#52-workers)
  - [5.3 Dose Entries](#53-dose-entries)
  - [5.4 Alerts](#54-alerts)
  - [5.5 Reporting](#55-reporting)
- [6. Frontend UI/UX Flows](#6-frontend-uiux-flows)
- [7. Offline \& Sync Strategy](#7-offline--sync-strategy)
- [8. Security \& Compliance](#8-security--compliance)
- [9. Non-Functional Requirements](#9-non-functional-requirements)
- [10. Deployment \& DevOps](#10-deployment--devops)

---

## 1. Overview

**Purpose**
Provide supervisors and Radiation Protection Officers (RPOs) with a mobile-first tool to record, monitor, and analyze occupational dose in real time, enforce ALARA distribution, and trigger regulatory alerts (whole body counts, bioassays, training renewals).

**MVP Scope**

* Dose entry & live extrapolation
* Crew summary & ALARA variance alerts
* Threshold-based notifications
* Bioassay & training reminders
* Monthly regulatory report export

---

## 2. System Architecture

```
┌─────────┐      HTTPS/WebSocket      ┌───────────┐
│ Mobile  │◀────────────────────────▶│  Backend  │
│ (React  │                           │ (Node.js) │
│  Native)│─────Sync via REST/WebSocket─▶│           │
└─────────┘                           └───────────┘
      │                                     │
      │ SQLite (local cache)                │ PostgreSQL
      │                                     │
      └───────────Offline Sync─────────────┘
```

* **Frontend**: React Native, offline-first
* **Backend**: Node.js + Express, WebSocket for live updates
* **Database**: PostgreSQL with PostGIS (if geofencing)
* **Notifications**: FCM for app, Twilio for SMS
* **Auth**: JWT with RBAC claims

---

## 3. Component Breakdown

### 3.1 Mobile App

* **Login & Auth**
* **Dose Entry Screen**
* **Crew Dashboard**
* **Alerts Center**
* **Training & Bioassay Calendar**

### 3.2 Backend Services

* **Auth Service**: JWT issuance, refresh tokens
* **Dose Service**: CRUD for `DoseEntry`, extrapolation logic
* **Alert Service**: Rule engine evaluating dose thresholds, test schedules
* **Reporting Service**: PDF/CSV generation
* **Sync Service**: Conflict resolution, offline data merge

### 3.3 Database

* Schemas for workers, jobs, dose entries, training records, alerts, audit logs

---

## 4. Data Model

```mermaid
erDiagram
    WORKER ||--o{ DOSE_ENTRY : receives
    JOB ||--o{ DOSE_ENTRY : contains
    WORKER ||--o{ TRAINING_RECORD : holds
    WORKER ||--o{ ALERT : triggers

    WORKER {
      UUID id PK
      varchar name
      varchar role
      decimal annual_limit_mSv
      date last_bioassay
    }
    JOB {
      UUID id PK
      varchar site
      timestamp start_time
      integer planned_duration_min
      UUID supervisor_id FK -> WORKER.id
    }
    DOSE_ENTRY {
      UUID id PK
      UUID worker_id FK -> WORKER.id
      UUID job_id FK -> JOB.id
      timestamp timestamp
      decimal dose_mSv
      varchar source_instrument
    }
    TRAINING_RECORD {
      UUID id PK
      UUID worker_id FK -> WORKER.id
      varchar course_name
      date completion_date
      date expiry_date
    }
    ALERT {
      UUID id PK
      UUID worker_id FK -> WORKER.id
      varchar type
      timestamp triggered_at
      timestamp resolved_at NULL
    }
```

---

## 5. API Specification

### 5.1 Authentication

<details>
<summary>POST /api/auth/login</summary>

**Request**

```json
{ "username": "string", "password": "string" }
```

**Response**

```json
{ "accessToken": "jwt", "refreshToken": "jwt" }
```

</details>

<details>
<summary>POST /api/auth/refresh</summary>

**Request**

```json
{ "refreshToken": "jwt" }
```

**Response**

```json
{ "accessToken": "jwt" }
```

</details>

### 5.2 Workers

<details>
<summary>GET /api/workers</summary>

Fetch all workers (supervisor scope).

**Response**
200 OK

```json
[{ "id":"uuid", "name":"Alice", "role":"Technician", … }]
```

</details>

<details>
<summary>POST /api/workers</summary>

Create a new worker.

**Request**

```json
{ "name":"Bob", "role":"RP Tech", "annualLimit":50.0, "lastBioassay":"2025-01-15" }
```

**Response**
201 Created with worker object

</details>

### 5.3 Dose Entries

<details>
<summary>POST /api/dose</summary>

Log a dose reading.

**Request**

```json
{ "workerId":"uuid", "jobId":"uuid", "timestamp":"ISO8601", "dose":0.25, "source":"TPOD-100" }
```

**Response**
201 Created

```json
{ "id":"uuid", … }
```

</details>

<details>
<summary>GET /api/jobs/{jobId}/dose-summary</summary>

Get live extrapolation and crew variance.

**Response**

```json
{
  "totalDose": 12.5,
  "averageDose": 2.5,
  "variance": 0.8,
  "forecastEndDose": { "min":3.0, "max":4.5, "avg":3.6 }
}
```

</details>

### 5.4 Alerts

<details>
<summary>GET /api/alerts?workerId=…</summary>

Fetch active alerts.

**Response**

```json
[{ "id":"uuid", "type":"DoseThreshold", "triggeredAt":"…", "resolvedAt":null }]
```

</details>

<details>
<summary>PUT /api/alerts/{alertId}/resolve</summary>

Mark an alert as resolved.

</details>

### 5.5 Reporting

<details>
<summary>GET /api/reports/monthly?year=2025&month=7</summary>

Generate PDF/CSV dose report.

</details>

---

## 6. Frontend UI/UX Flows

1. **Login** → Home Dashboard
2. **Select Job** → Crew List + Dose Summary
3. **Tap Worker** → Dose Entry Form (pre-filled timestamp)
4. **View Alerts** → Acknowledge or resolve
5. **Calendar View** → Upcoming bioassay & training expirations

> *Wireframes*: (to be drafted in Figma; focus on large touch targets, offline sync status icon, color-coded alerts)

---

## 7. Offline & Sync Strategy

* **Local Store**: SQLite with tables mirroring server schema
* **Change Queue**: track creates/updates/deletes when offline
* **Sync Engine**:

  1. On connectivity gain, push local changes (with timestamp/version)
  2. Pull server updates since last sync
  3. Resolve conflicts by “last-write-wins” for dose entries, manual conflict flag for training records

---

## 8. Security & Compliance

* **Transport**: TLS everywhere
* **Auth**: Strong passwords + optional 2FA
* **Data at Rest**: Encrypt sensitive fields (e.g., health data) in DB
* **Audit Trail**: Immutable log of all modifications
* **Regulatory**: CNSC/NRC data retention rules (e.g., 5 years)

---

## 9. Non-Functional Requirements

* **Performance**: <200 ms for API responses under load
* **Scalability**: Horizontal scaling for backend; RDS read replicas
* **Reliability**: 99.9% uptime SLA
* **Usability**: UI tested for field conditions (gloved use, low light)
* **Accessibility**: WCAG AA compliance

---

## 10. Deployment & DevOps

* **CI/CD**: GitHub Actions → build, lint, test, deploy
* **Infrastructure as Code**: Terraform for AWS (EC2/EBS, RDS, S3)
* **Monitoring**: Prometheus + Grafana; Sentry for error tracking
* **Backups**: Daily DB snapshots; weekly retention for 4 weeks

---

