# PLANNING.md - NOC Email Report Generator

## 📌 Project Vision
Transform the daily NOC reporting process from a manual, error-prone task into an automated, efficient system that parses Microsoft Outlook emails and generates structured, editable reports in multiple formats, reducing report creation time from 30+ minutes to under 2 minutes.

## 🎯 Core Objectives
1. **Automate email parsing** - Eliminate manual review of hundreds of daily emails
2. **Intelligent categorization** - Automatically classify incidents by type and severity
3. **Editable reports** - Allow manual adjustments and corrections
4. **Multiple export formats** - Support XLSX and PDF exports for different stakeholders
5. **Real-time statistics** - Provide instant insights into daily operations

## 🏗️ System Architecture

### High-Level Architecture
```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│  Microsoft       │────▶│  Next.js App     │────▶│    MongoDB       │
│  OAuth 2.0       │     │  (Frontend +     │     │    Database      │
│                  │     │   Backend)       │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
         │                        │                         │
         │                        │                         │
         ▼                        ▼                         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Microsoft       │     │   Email Parser   │     │   Report Data    │
│  Graph API       │     │   & Categorizer  │     │   Storage        │
│  (Email Access)  │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

### Component Architecture
```
Frontend (React/Next.js)
├── Authentication Layer
│   ├── Microsoft OAuth Login
│   ├── Token Management
│   └── Session Handling
├── Dashboard Module
│   ├── User Profile Display
│   ├── Date Selector
│   └── Report Generation Trigger
├── Report Module
│   ├── Editable Table Component
│   ├── Summary Statistics Panel
│   ├── Row Management (Add/Delete/Reorder)
│   └── Auto-save Handler
└── Export Module
    ├── XLSX Generator
    └── PDF Generator

Backend (Next.js API Routes)
├── Auth API
│   ├── OAuth Callback Handler
│   ├── Token Refresh Service
│   └── Session Management
├── Email API
│   ├── Microsoft Graph Client
│   ├── Email Fetcher
│   └── Pagination Handler
├── Report API
│   ├── Email Parser Service
│   ├── Categorization Engine
│   ├── Statistics Calculator
│   └── Report Generator
└── Export API
    ├── XLSX Export Service
    └── PDF Export Service
```

## 💻 Technology Stack

### Core Technologies
- **Frontend Framework**: Next.js 14+ (App Router)
- **Runtime**: Node.js 20+ LTS
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3.4+
- **Database**: MongoDB 6+
- **Authentication**: NextAuth.js v5 (Auth.js)

### Key Libraries & Packages
```json
{
  "dependencies": {
    // Core
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    
    // Authentication
    "next-auth": "^5.0.0-beta",
    "@azure/msal-node": "^2.6.0",
    
    // Database
    "mongodb": "^6.3.0",
    "mongoose": "^8.0.0",
    
    // Microsoft Graph API
    "@microsoft/microsoft-graph-client": "^3.0.0",
    "@azure/identity": "^4.0.0",
    
    // UI Components
    "@tanstack/react-table": "^8.11.0",
    "@radix-ui/react-*": "latest",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    
    // Date/Time
    "date-fns": "^3.0.0",
    "date-fns-tz": "^2.0.0",
    
    // Export Functionality
    "exceljs": "^4.4.0",
    "pdfmake": "^0.2.9",
    "@react-pdf/renderer": "^3.3.0",
    
    // Utilities
    "axios": "^1.6.0",
    "lodash": "^4.17.21",
    "uuid": "^9.0.0",
    
    // State Management
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.17.0",
    
    // Notifications
    "react-hot-toast": "^2.4.0",
    "sonner": "^1.3.0"
  },
  "devDependencies": {
    // Development Tools
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    
    // Testing
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.2.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "vitest": "^1.2.0",
    "@playwright/test": "^1.41.0"
  }
}
```

## 🛠️ Development Tools

### Required Tools
- **Node.js**: v20+ LTS
- **npm/yarn/pnpm**: Latest version
- **Git**: For version control
- **VS Code**: Recommended IDE
- **MongoDB Compass**: For database management
- **Postman/Insomnia**: For API testing

### VS Code Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- Thunder Client (API testing)
- GitLens

### External Services Setup

#### Microsoft Azure AD Application
1. Register app in Azure Portal
2. Configure redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/microsoft`
   - Production: `https://yourdomain.com/api/auth/callback/microsoft`
3. Required API Permissions:
   - Microsoft Graph: `Mail.Read`, `User.Read`
4. Generate client secret
5. Note down:
   - Tenant ID
   - Client ID
   - Client Secret

#### MongoDB Setup
1. **Local Development**:
   - Install MongoDB Community Edition
   - Default connection: `mongodb://localhost:27017/noc-reports`
2. **Production**:
   - Use provided connection string (store in env variable)
   - Configure IP whitelist
   - Set up database user with appropriate permissions

## 📁 Database Schema

### Collections Structure

#### users
```typescript
{
  _id: ObjectId,
  email: string,
  name: string,
  microsoftId: string,
  accessToken: string (encrypted),
  refreshToken: string (encrypted),
  tokenExpiry: Date,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### reports
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  timezone: string,
  entries: [{
    category: 'Backhaul' | 'Upstreams' | 'IPT Client' | 'ISP Client',
    dateTime: Date,
    clientVendor: string,
    cause: string,
    downtime: string,
    type: 'Service' | 'Complain',
    remarks: string,
    emailId: string,
    isManuallyAdded: boolean,
    isEdited: boolean
  }],
  statistics: {
    totalServices: number,
    totalNewComplaints: number,
    recurringComplaints: number,
    complaintsUnresolved: number,
    complaintsResolved: number
  },
  createdAt: Date,
  updatedAt: Date,
  lastModifiedBy: string
}
```

#### email_cache
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  emailId: string,
  subject: string,
  from: string,
  to: string[],
  receivedDateTime: Date,
  parsedData: object,
  category: string,
  createdAt: Date
}
```

### Indexes
```javascript
// users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ microsoftId: 1 }, { unique: true })

// reports collection
db.reports.createIndex({ userId: 1, date: -1 })
db.reports.createIndex({ "entries.emailId": 1 })

// email_cache collection
db.email_cache.createIndex({ userId: 1, emailId: 1 }, { unique: true })
db.email_cache.createIndex({ userId: 1, receivedDateTime: -1 })
```

## 🔐 Environment Variables

### .env.example Template
```bash
# Application
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Microsoft OAuth
AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret

# MongoDB
MONGODB_URI=mongodb://localhost:27017/noc-reports
# Production: mongodb://username:password@host:port/database

# Microsoft Graph API
GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# Timezone
DEFAULT_TIMEZONE=Asia/Dhaka

# Export Settings
MAX_EXPORT_ROWS=10000
PDF_LOGO_URL=/logo.png

# Session
SESSION_MAX_AGE=86400

# Development
NODE_ENV=development
```

## 📊 Performance Requirements

### Response Time Targets
- Authentication: < 3 seconds
- Dashboard load: < 2 seconds
- Email fetching: < 30 seconds for 500 emails
- Report generation: < 2 minutes total
- Export generation: < 10 seconds
- Auto-save: < 2 seconds

### Scalability Considerations
- Support 100+ concurrent users
- Handle 1000+ emails per report
- Process reports with 500+ entries
- Export files up to 10MB
- Database growth: ~1GB per year

## 🔄 API Rate Limits

### Microsoft Graph API
- Throttling: 100,000 requests per 10 minutes
- Implement exponential backoff
- Cache frequently accessed data
- Batch requests when possible

### Internal API Limits
- Login attempts: 500 per minute
- Report generation: 1000 per hour per user
- Export requests: 2000 per hour per user
- Auto-save: Debounced at 2 seconds

## 📋 Development Phases

### Phase 1: Foundation (Week 1-2)
- Project setup and configuration
- Authentication implementation
- Basic UI structure
- MongoDB connection

### Phase 2: Core Functionality (Week 3-4)
- Email fetching via Graph API
- Email parsing and categorization
- Report generation
- Database operations

### Phase 3: Editing & Interaction (Week 5)
- Editable table implementation
- Row management features
- Auto-save functionality
- Real-time statistics

### Phase 4: Export & Polish (Week 6)
- XLSX export
- PDF export
- UI/UX refinements
- Error handling

### Phase 5: Testing & Optimization (Week 7-8)
- Unit and integration tests
- Performance optimization
- Security audit
- Documentation

## 🚦 Go-Live Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] MongoDB indexes created
- [ ] Microsoft Azure AD app configured
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Backup strategy implemented

### Security
- [ ] Authentication flow tested
- [ ] Token encryption verified
- [ ] API rate limiting configured
- [ ] Input validation implemented


### Performance
- [ ] Database queries optimized
- [ ] Caching strategy implemented
- [ ] Image optimization complete
- [ ] Bundle size minimized
- [ ] Lazy loading configured

### Testing
- [ ] Unit tests passing
- [ ] Integration tests complete
- [ ] E2E tests successful
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness verified

### Documentation
- [ ] README.md complete
- [ ] API documentation ready
- [ ] User guide created
- [ ] Deployment guide written
- [ ] Troubleshooting guide prepared

## 🎯 Success Metrics

### Technical Metrics
- Page load time < 3 seconds
- API response time < 500ms (avg)
- Error rate < 1%
- Uptime > 99.9%
- Test coverage > 80%

### Business Metrics
- Report generation time < 2 minutes
- Email parsing accuracy > 85%
- User adoption > 80%
- Export success rate > 95%
- User satisfaction > 4/5

## 📝 Notes & Considerations

1. **Email Volume**: System should handle peak loads during incident outbreaks
2. **Time Zones**: All operations must respect GMT+6 timezone
3. **Data Privacy**: Only process necessary email data, don't store full email content
4. **Audit Trail**: Log all user actions for compliance
5. **Graceful Degradation**: System should work partially if some services are down
6. **Mobile Future**: Design with future mobile app in mind
7. **Extensibility**: Architecture should support future integrations
