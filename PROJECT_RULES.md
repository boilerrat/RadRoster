# Radiation Dose Tracking App - Project Rules

## Project Overview

**Purpose**: Mobile-first application for supervisors and Radiation Protection Officers (RPOs) to record, monitor, and analyze occupational dose in real time, enforce ALARA distribution, and trigger regulatory alerts.

**MVP Scope**:
- Dose entry & live extrapolation
- Crew summary & ALARA variance alerts  
- Threshold-based notifications
- Bioassay & training reminders
- Monthly regulatory report export

---

## Technology Stack

### Frontend
- **Framework**: React Native (iOS/Android)
- **Navigation**: React Navigation
- **State Management**: Context API or Redux Toolkit
- **Charts**: react-native-svg or Victory Native
- **Offline Storage**: SQLite with AsyncStorage
- **Push Notifications**: Firebase Cloud Messaging (FCM)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with refresh tokens
- **Validation**: Joi or Zod
- **Background Jobs**: node-cron or Bull
- **Notifications**: Twilio for SMS

### DevOps
- **CI/CD**: GitHub Actions
- **Infrastructure**: AWS (EC2, RDS, S3)
- **Monitoring**: Prometheus + Grafana, Sentry
- **Documentation**: Swagger/OpenAPI

---

## Code Standards & Conventions

### File Structure
```
/project-root
├── /mobile-app
│   ├── /src
│   │   ├── /components
│   │   ├── /screens
│   │   ├── /services
│   │   ├── /utils
│   │   └── /hooks
│   └── /__tests__
├── /backend
│   ├── /src
│   │   ├── /controllers
│   │   ├── /models
│   │   ├── /routes
│   │   ├── /services
│   │   ├── /middleware
│   │   └── /utils
│   ├── /migrations
│   └── /__tests__
└── /docs
```

### Naming Conventions
- **Components**: PascalCase (`DoseEntryForm.tsx`)
- **Functions/Variables**: camelCase (`calculateDoseExtrapolation()`)
- **Constants**: UPPERCASE_SNAKE_CASE (`ANNUAL_DOSE_LIMIT`)
- **Files**: kebab-case for utilities (`dose-calculator.ts`)
- **Database Tables**: snake_case (`dose_entries`)

### Code Style
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Trailing Commas**: Yes for multi-line objects/arrays
- **Line Length**: 80 characters max

---

## Database Schema Rules

### Core Entities
```sql
-- Workers table
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  annual_limit_mSv DECIMAL(8,2) NOT NULL,
  last_bioassay DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Jobs table  
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  planned_duration_min INTEGER NOT NULL,
  supervisor_id UUID REFERENCES workers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Dose entries table
CREATE TABLE dose_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  timestamp TIMESTAMP NOT NULL,
  dose_mSv DECIMAL(8,4) NOT NULL,
  source_instrument VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Training records table
CREATE TABLE training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id),
  course_name VARCHAR(255) NOT NULL,
  completion_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id),
  type VARCHAR(50) NOT NULL,
  triggered_at TIMESTAMP NOT NULL,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Design Rules

### Authentication
- Use JWT tokens with refresh mechanism
- Token expiration: 15 minutes (access), 7 days (refresh)
- Include user role in JWT claims for RBAC

### Endpoint Patterns
```javascript
// Standard CRUD pattern
GET    /api/{resource}           // List with pagination
GET    /api/{resource}/{id}      // Get single
POST   /api/{resource}           // Create
PUT    /api/{resource}/{id}      // Update
DELETE /api/{resource}/{id}      // Delete

// Custom endpoints
GET    /api/jobs/{id}/dose-summary    // Dose statistics
POST   /api/dose                      // Log dose entry
GET    /api/alerts                    // Active alerts
PUT    /api/alerts/{id}/resolve       // Resolve alert
```

### Response Format
```javascript
// Success response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [ /* validation errors */ ]
  }
}
```

---

## Mobile App Rules

### Navigation Structure
```
App
├── AuthStack
│   ├── Login
│   └── ForgotPassword
├── MainStack
│   ├── Dashboard
│   ├── Jobs
│   │   ├── JobList
│   │   ├── JobDetail
│   │   └── DoseEntry
│   ├── Workers
│   │   ├── WorkerList
│   │   └── WorkerDetail
│   ├── Alerts
│   └── Reports
└── SettingsStack
    ├── Profile
    ├── Notifications
    └── SyncStatus
```

### Offline-First Requirements
- Store all data locally in SQLite
- Queue changes when offline
- Sync on connectivity restore
- Show sync status indicator
- Handle conflicts gracefully

### UI/UX Guidelines
- Large touch targets (44pt minimum)
- High contrast for field conditions
- Color-coded alerts (red/yellow/green)
- Offline sync status indicator
- Loading states for all async operations

---

## Security & Compliance Rules

### Data Protection
- Encrypt sensitive health data at rest
- Use TLS for all API communications
- Implement proper input sanitization
- Log all data modifications for audit trail
- Follow CNSC/NRC retention rules (5 years minimum)

### Authentication & Authorization
- Strong password requirements
- Optional 2FA for supervisors
- Role-based access control (RBAC)
- Session timeout after inactivity
- Secure token storage on mobile

### Regulatory Compliance
- Maintain audit logs of all dose entries
- Ensure data integrity for regulatory reports
- Implement proper backup and recovery
- Follow nuclear industry security standards

---

## Testing Requirements

### Unit Tests
- All service functions must have unit tests
- Test dose calculation logic thoroughly
- Mock external dependencies (FCM, Twilio)
- Aim for 80%+ code coverage

### Integration Tests
- Test API endpoints with real database
- Test offline sync scenarios
- Test conflict resolution logic
- Test notification delivery

### E2E Tests
- Use Detox or Appium for mobile testing
- Test critical user flows
- Test offline/online transitions
- Test on both iOS and Android

---

## Performance Requirements

### API Performance
- Response time < 200ms under normal load
- Support 100+ concurrent users
- Implement database query optimization
- Use connection pooling

### Mobile Performance
- App launch time < 3 seconds
- Smooth 60fps animations
- Efficient offline sync
- Optimize bundle size

### Scalability
- Horizontal scaling for backend services
- Database read replicas for reporting
- CDN for static assets
- Caching for frequently accessed data

---

## Development Workflow

### Git Strategy
- Main branch for production
- Feature branches for development
- Pull request reviews required
- Automated testing on all PRs

### CI/CD Pipeline
1. Lint code (ESLint, Prettier)
2. Run unit tests
3. Run integration tests
4. Build mobile app
5. Deploy to staging
6. Manual approval for production

### Environment Management
- Development: Local setup
- Staging: AWS staging environment
- Production: AWS production environment
- Environment variables for all config

---

## Documentation Standards

### Code Documentation
- JSDoc for all public functions
- README for each major component
- API documentation with Swagger
- Database schema documentation

### User Documentation
- User manual for supervisors
- Training guide for RPOs
- Troubleshooting guide
- Compliance documentation

---

## Quality Assurance

### Code Quality
- ESLint with strict rules
- Prettier for consistent formatting
- TypeScript for type safety
- Regular dependency updates

### Security Audits
- Regular security scans
- Dependency vulnerability checks
- Penetration testing before production
- Compliance audits

### Performance Monitoring
- Real-time performance metrics
- Error tracking and alerting
- User experience monitoring
- Database performance monitoring

---

## Deployment Rules

### Infrastructure
- Use Infrastructure as Code (Terraform)
- Automated backups (daily)
- Monitoring and alerting setup
- Disaster recovery plan

### Release Process
- Semantic versioning
- Changelog maintenance
- Rollback procedures
- Feature flags for gradual rollouts

### Monitoring
- Application performance monitoring
- Error tracking and alerting
- Database performance monitoring
- User analytics (privacy-compliant)

---

## Compliance & Regulatory

### Data Retention
- Dose records: 5 years minimum
- Training records: 3 years minimum
- Audit logs: 7 years minimum
- Secure deletion procedures

### Reporting Requirements
- Monthly dose reports (PDF/CSV)
- Annual compliance reports
- Incident reports within 24 hours
- Training expiration reports

### Access Controls
- Role-based permissions
- Audit trail for all access
- Secure authentication
- Regular access reviews

---

## Emergency Procedures

### Incident Response
- 24/7 monitoring and alerting
- Escalation procedures
- Communication protocols
- Recovery procedures

### Data Breach Response
- Immediate containment
- Regulatory notification
- User notification
- Investigation and remediation

### System Failures
- Automatic failover procedures
- Manual override capabilities
- Emergency contact procedures
- Recovery time objectives (RTO)

---

## Maintenance & Support

### Regular Maintenance
- Weekly security updates
- Monthly performance reviews
- Quarterly compliance audits
- Annual system reviews

### Support Procedures
- Tier 1: Basic user support
- Tier 2: Technical support
- Tier 3: Development team
- Emergency: 24/7 on-call

### Training Requirements
- User training for supervisors
- Technical training for RPOs
- Developer onboarding
- Compliance training

---

*This document should be reviewed and updated regularly to ensure continued alignment with project requirements and regulatory standards.* 