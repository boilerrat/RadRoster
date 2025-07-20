# RadRoster - Radiation Dose Tracking App

A safety-critical mobile application for nuclear industry supervisors and RPOs to track radiation doses, manage workers, and ensure regulatory compliance.

## 🚀 Day 1 Setup Complete

### What's Been Implemented

#### Backend (Node.js + Express)
- ✅ Express server with TypeScript
- ✅ JWT authentication with refresh tokens
- ✅ PostgreSQL database configuration with Sequelize
- ✅ Comprehensive error handling and logging
- ✅ Health check endpoints
- ✅ Security middleware (helmet, CORS, rate limiting)
- ✅ Environment variable configuration
- ✅ ESLint and Jest setup

#### Mobile App (React Native)
- ✅ React Native scaffold with TypeScript
- ✅ Navigation setup with React Navigation
- ✅ Authentication context and hooks
- ✅ Network and sync context providers
- ✅ Basic screen structure (Login, Dashboard, Dose Entry, etc.)
- ✅ API service configuration
- ✅ Offline-first architecture foundation

#### CI/CD & Infrastructure
- ✅ GitHub Actions workflow for lint/test/build
- ✅ Monorepo structure with workspaces
- ✅ Environment variable templates
- ✅ Comprehensive testing setup

## 🏗️ Project Structure

```
RadRoster/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database, API config
│   │   ├── middleware/     # Auth, error handling
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities and logging
│   │   └── test/           # Test setup
│   └── package.json
├── mobile-app/             # React Native app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── screens/        # App screens
│   │   ├── services/       # API services
│   │   └── config/         # App configuration
│   └── package.json
├── .github/workflows/      # CI/CD pipelines
├── env.sample              # Environment variables template
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- React Native development environment
- Git

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp ../env.sample .env
   # Edit .env with your database and API credentials
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

### Mobile App Setup

1. **Install dependencies:**
   ```bash
   cd mobile-app
   npm install
   ```

2. **iOS setup (macOS only):**
   ```bash
   cd ios && pod install
   ```

3. **Start Metro bundler:**
   ```bash
   npm start
   ```

4. **Run on device/simulator:**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## 🔐 Authentication

The app uses JWT tokens with refresh token rotation:

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days
- **Demo Credentials**: 
  - Email: `admin@radroster.com`
  - Password: `admin123`

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Mobile App Tests
```bash
cd mobile-app
npm test              # Run all tests
```

## 📱 Features (Planned)

### Day 1 ✅
- [x] Authentication system
- [x] Basic app structure
- [x] CI/CD pipeline
- [x] Environment configuration

### Day 2 (Next)
- [ ] Database models (Worker, Job, DoseEntry)
- [ ] CRUD operations
- [ ] React Native forms

### Day 3
- [ ] Dose entry and extrapolation
- [ ] Forecasting algorithms

### Day 4
- [ ] Dashboard with charts
- [ ] Dose summaries

### Day 5
- [ ] Alert system
- [ ] Push notifications

### Day 6
- [ ] Training records
- [ ] Compliance reporting

### Day 7
- [ ] Offline sync
- [ ] End-to-end testing

## 🔧 Development

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb config with TypeScript
- **Prettier**: Code formatting
- **Jest**: Unit and integration testing

### Safety & Compliance
- All dose calculations validated
- Comprehensive error handling
- Audit trail logging
- Nuclear industry security standards

### Offline-First
- SQLite local storage
- Conflict resolution
- Sync status indicators
- Graceful network failure handling

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user

### Health
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health with DB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is proprietary software for nuclear industry use.

## 🆘 Support

For technical support or questions about the radiation dose tracking system, please contact the development team.

---

**⚠️ Safety Notice**: This is a safety-critical application for nuclear industry use. All dose calculations and data handling must be thoroughly tested and validated before production deployment. 