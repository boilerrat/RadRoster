# Radiation Dose Tracking App Solo + AI 7-Day Sprint Plan

This document outlines a 7-day accelerated, solo-plus-AI development plan. Each day has a clear focus, deliverables, and three AI prompts to feed your assistant (e.g. Cursor) in the morning, afternoon, and evening.

---

## Day 1: Kick-off & Core Setup

**Focus Area**  
- Initialize repo, CI/CD, env, and app skeletons.

**Deliverables**  
- Git repo with branch strategy  
- GitHub Actions workflow for lint/test/build  
- `.env.sample` listing all required variables (DB_URL, JWT_SECRET, FCM_KEY, TWILIO creds)  
- Node.js + Express backend scaffold  
- React Native app scaffold (iOS/Android)  
- Stub JWT auth middleware

**AI Prompts**  
1. “Generate a GitHub Actions workflow for a mono-repo with Node.js (Express) and React Native: lint, test, and build steps.”  
2. “Scaffold an Express app with JWT auth: login, token refresh endpoints, and a JWT verification middleware stub.”  
3. “Create a `.env.sample` file listing env vars: DATABASE_URL, JWT_SECRET, FCM_SERVER_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN.”

---

## Day 2: Data Modeling & CRUD

**Focus Area**  
- Define database schemas and basic CRUD.

**Deliverables**  
- Migrations/models for `Worker`, `Job`, `DoseEntry`  
- Sequelize (or TypeORM) models + migration files  
- Express controllers & routes for Worker & Job CRUD with validation  
- React Native screens to list/add/edit workers & jobs  

**AI Prompts**  
1. “Generate Sequelize models and migrations for Worker (id, name, role, annual_limit_mSv, last_bioassay), Job (id, site, start_time, planned_duration), and DoseEntry (id, worker_id, job_id, timestamp, dose_mSv).”  
2. “Scaffold Express controllers and routes for CRUD on Worker and Job, including Joi/Zod request validation.”  
3. “Create React Native screens using react-navigation to list, add, and edit Worker and Job entities with form validation.”

---

## Day 3: Dose Entry & Extrapolation

**Focus Area**  
- Logging doses and forecasting cumulative exposure.

**Deliverables**  
- `DoseEntry` model + migration  
- `POST /api/dose` and `GET /api/dose/:jobId/summary` endpoints  
- Service function to forecast end-of-shift and end-of-job doses  
- RN “Log Dose” form (timestamp pre-fill, numeric input)  
- Unit tests for extrapolation logic  

**AI Prompts**  
1. “Write a Node.js service function to calculate dose-extrapolation: given current cumulative dose and elapsed time vs. planned duration, forecast end-of-shift and end-of-job doses.”  
2. “Generate an Express endpoint `POST /api/dose` with Joi/Zod validation to record a dose entry (workerId, jobId, timestamp, dose_mSv).”  
3. “Scaffold a React Native ‘Log Dose’ form pre-filled with current timestamp, numeric input for dose, submit handler, and error messages.”

---

## Day 4: Crew Dashboard & Charts

**Focus Area**  
- Visualizing crew dose stats and trends.

**Deliverables**  
- `/api/jobs/:id/dose-summary` endpoint returning `{ totalDose, averageDose, variance, forecast }`  
- RN dashboard component: fetch summary, render data table  
- Simple line chart of cumulative dose over time (using react-native-svg or Victory)  
- Unit tests for summary endpoint and chart data formatting  

**AI Prompts**  
1. “Implement GET `/api/jobs/:id/dose-summary` in Express, calculating total, average, variance, and forecast based on DoseEntry data.”  
2. “Create a React Native dashboard component that fetches `/dose-summary` and renders a table of crew dose stats.”  
3. “Generate code for a line chart (react-native-svg/Victory) to plot cumulative dose vs. time for a given job.”

---

## Day 5: Alerts Engine & Notifications

**Focus Area**  
- Threshold checks and push/SMS alerts.

**Deliverables**  
- Rule engine to compare cumulative doses against daily/weekly/monthly limits  
- Background worker (node-cron or Bull) to evaluate rules periodically  
- FCM integration for push notifications in RN  
- Twilio integration for SMS alerts  
- RN Alerts center: list alerts, acknowledge, badge counts  

**AI Prompts**  
1. “Write a Node.js rule-engine function that scans cumulative doses, compares against configured thresholds, and returns alert objects.”  
2. “Generate React Native integration code for Firebase Cloud Messaging to receive and display push notifications.”  
3. “Scaffold a background worker (e.g., with node-cron) that retrieves new alerts and sends SMS via Twilio API.”

---

## Day 6: Training/Bioassay & Reporting

**Focus Area**  
- Tracking expiries and generating compliance reports.

**Deliverables**  
- `TrainingRecord` model + migration (course_name, completion_date, expiry_date)  
- Service to find workers with upcoming bioassay/training due dates  
- RN calendar or list view of upcoming expiries with color-coded reminders  
- PDF/CSV monthly dose report endpoint (using PDFKit or similar)  
- RN UI to select month and download/share the report  

**AI Prompts**  
1. “Generate a Sequelize model and migration for TrainingRecord (id, worker_id, course_name, completion_date, expiry_date).”  
2. “Write a service function that returns workers whose bioassay or training expires within the next X days.”  
3. “Create a React Native calendar or list view showing upcoming bioassay and training expirations with alerts.”

---

## Day 7: Offline-First Sync, QA & Docs

**Focus Area**  
- Offline capability, testing, and documentation.

**Deliverables**  
- Local SQLite store + change-queue in RN  
- Sync engine: push local changes, pull remote diffs, conflict resolution UI  
- Jest tests for sync logic, mocking offline and conflict scenarios  
- E2E mobile tests scaffolding (Detox/Appium)  
- Swagger/OpenAPI docs for all APIs  
- README developer/onboarding guide  

**AI Prompts**  
1. “Write the offline-sync logic to push local SQLite change-queue to server, pull remote diffs, and resolve conflicts with last-write-wins or manual flags.”  
2. “Generate Jest tests for the sync engine, mocking offline mode and conflict scenarios.”  
3. “Scaffold a React Native UI component that shows sync status (pending, failed, success) and allows manual conflict resolution.”

---
