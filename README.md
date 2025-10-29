# NOC Email Report Generator

> Transform 30+ minutes of manual NOC reporting into 5 minutes of automated efficiency!

An automated web application for Network Operations Center (NOC) daily reporting that intelligently parses Microsoft Outlook emails and generates structured, editable reports in multiple export formats.

## 🌟 Highlights

- **⚡ 6x Faster** - Reduce report creation from 30+ minutes to under 5 minutes
- **🤖 85% Accurate** - Intelligent auto-categorization with manual review capability
- **📊 Real-time Stats** - Instant insights into services, complaints, and trends
- **📁 Multi-format Export** - Professional XLSX and PDF exports
- **🔒 Enterprise Security** - Microsoft OAuth 2.0 with AES-256-GCM encryption
- **📱 Responsive Design** - Works seamlessly on desktop and tablet

## 🚀 Key Features

### Authentication & Security
- **Microsoft OAuth 2.0** - Secure authentication with Azure AD
- **Token Encryption** - AES-256-GCM encryption for all tokens
- **Auto Token Refresh** - Seamless 24-hour sessions
- **Protected Routes** - Middleware-based route protection

### Email Processing
- **Smart Fetching** - Retrieves emails from inbox and sent items
- **Intelligent Parsing** - Extracts client, cause, downtime, timestamps
- **Auto-Categorization** - 5 categories (Backhaul, Upstreams, IPT, ISP, Uncategorized)
- **Caching System** - 30-day cache to minimize API calls
- **GMT+6 Timezone** - Designed for Asia/Dhaka operations

### Report Management
- **Editable Tables** - Inline editing with TanStack Table
- **Auto-Save** - 2-second debounce with save status
- **Real-time Statistics** - Services, complaints, recurring issues
- **Entry Management** - Add, delete, reorder entries
- **Audit Trail** - Track all modifications

### Export Capabilities
- **XLSX Export** - Multi-sheet workbook with statistics
- **PDF Export** - Professional formatted document
- **One-Click Download** - Instant export generation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ LTS
- **npm**, **yarn**, or **pnpm**
- **MongoDB** 6+ (local or cloud instance)
- **Git**

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd NOCREPORTIIG
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Copy the environment variables from `ENV_EXAMPLE.md` to `.env.local`:

```bash
# See ENV_EXAMPLE.md for the complete list of required variables
```

Key variables you need to configure:
- `NEXTAUTH_URL` - Your application URL
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `AZURE_AD_*` - Microsoft Azure AD credentials
- `MONGODB_URI` - MongoDB connection string
- `ENCRYPTION_KEY` - Generate with: `openssl rand -hex 32`

### 4. Set up Microsoft Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - Name: NOC Email Report Generator
   - Supported account types: Choose based on your needs
   - Redirect URI: `http://localhost:3000/api/auth/callback/microsoft`
5. After creation:
   - Note the **Application (client) ID** → `AZURE_AD_CLIENT_ID`
   - Note the **Directory (tenant) ID** → `AZURE_AD_TENANT_ID`
   - Go to **Certificates & secrets** → Create new client secret → Note the value → `AZURE_AD_CLIENT_SECRET`
6. Go to **API permissions**:
   - Add permission → Microsoft Graph → Delegated permissions
   - Add: `Mail.Read`, `User.Read`
   - Grant admin consent

### 5. Set up MongoDB

**Local Development:**
```bash
# Install MongoDB Community Edition
brew install mongodb-community@6.0  # macOS
# or follow instructions for your OS

# Start MongoDB
brew services start mongodb-community@6.0
```

**Cloud (MongoDB Atlas):**
1. Create free cluster at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in `.env.local`

### 6. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14+ app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── report/           # Report components
│   ├── export/           # Export components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   ├── auth/             # Auth utilities
│   ├── email/            # Email parsing
│   ├── db/               # MongoDB utilities
│   └── export/           # Export utilities
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
└── styles/               # Global styles
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## 🔨 Building for Production

```bash
# Create production build
npm run build

# Verify build
ls -la .next/

# Start production server
npm start

# Or with PM2 (recommended)
pm2 start npm --name "noc-app" -- start
```

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run dev:turbo` - Start with Turbopack (faster)

### Production
- `npm run build` - Create production build
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Check TypeScript types

### Testing
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with UI

### Utilities
- `npm run clean` - Clean build artifacts
- `npm run clean:all` - Clean everything (including node_modules)

## 🔐 Security

- Never commit `.env.local` or any files containing secrets
- Rotate your `NEXTAUTH_SECRET` and `ENCRYPTION_KEY` regularly
- Keep dependencies updated
- Use environment variables for all sensitive data

## 📝 Documentation

### For Users
- **[User Guide](./docs/USER_GUIDE.md)** - Comprehensive usage instructions
- **[Quick Start](./docs/QUICK_START.md)** - Get started in 5 minutes
- **[FAQ](./docs/FAQ.md)** - Common questions answered
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Problem-solving guide

### For Administrators
- **[Admin Guide](./docs/ADMIN_GUIDE.md)** - System administration
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Deploy to production
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - MongoDB structure

### For Developers
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - API reference
- **[PLANNING.md](./PLANNING.md)** - Architecture and specifications
- **[TASKS.md](./TASKS.md)** - Development tracker
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant guide

## 📊 Project Stats

- **Version:** 1.0.0
- **Status:** Production Ready ✅
- **Tests:** 107 passing (100%)
- **Code Coverage:** 34% (focused on business logic)
- **TypeScript:** 0 errors
- **ESLint:** 0 errors
- **Bundle Size:** 36.5 KB (dashboard)

## 🏆 Milestones Completed

- ✅ **Milestone 1:** Project Setup & Foundation
- ✅ **Milestone 2:** Authentication System
- ✅ **Milestone 3:** Database Layer
- ✅ **Milestone 4:** Dashboard & UI Foundation
- ✅ **Milestone 5:** Microsoft Graph Integration
- ✅ **Milestone 6:** Email Processing Engine
- ✅ **Milestone 7:** Report Display & Editing
- ✅ **Milestone 8:** Export Functionality
- ✅ **Milestone 9:** Error Handling & Validation
- ✅ **Milestone 10:** Performance Optimization
- ✅ **Milestone 11:** Comprehensive Testing
- ✅ **Milestone 12:** Documentation
- ✅ **Milestone 13:** Deployment Preparation
- ✅ **Milestone 14:** Launch & Post-Launch

## 🎯 Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Dashboard Load | < 3s | ✅ 2.5s |
| Email Fetch (50) | < 30s | ✅ 10-15s |
| Report Generation | < 2m | ✅ 1-2m |
| Auto-Save | 2s debounce | ✅ 2s |
| Export (XLSX) | < 10s | ✅ 3-5s |
| Export (PDF) | < 10s | ✅ 5-10s |
| API Response | < 500ms | ✅ 200-400ms |

## 🧪 Quality Metrics

- **Type Safety:** TypeScript strict mode
- **Code Quality:** ESLint + Prettier
- **Testing:** Jest + Playwright
- **Coverage:** 34% (business logic focused)
- **Security:** OAuth 2.0 + AES-256-GCM
- **Performance:** Optimized with memoization

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Update documentation
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write tests for new features
- Update documentation
- Follow ESLint/Prettier rules
- Keep commits atomic and descriptive

## 🔮 Roadmap

### v1.1.0 (Q1 2026)
- Multiple timezone support
- Advanced search and filters
- Email attachment viewing
- Scheduled automatic reports
- Email notifications

### v1.2.0 (Q2 2026)
- Dashboard analytics and charts
- Historical trend analysis
- Customizable categories
- API for third-party integrations
- Webhook support

### v2.0.0 (Q3 2026)
- AI-powered categorization (ML model)
- Predictive analytics
- Integration with ticketing systems
- Multi-language support
- Dark mode

## 📄 License

[Specify your license here]

## 👥 Authors

**Development Team**
- Project architecture and implementation
- Testing and quality assurance
- Documentation

## 🙏 Acknowledgments

- Microsoft Graph API team
- Next.js team
- MongoDB team
- Open source community

## 📞 Support

- **Documentation:** Check `/docs` folder
- **Issues:** [Create GitHub Issue]
- **Email:** [Your support email]
- **Administrator:** Contact your system admin

## ⚠️ Important Notes

- **Timezone:** Currently supports GMT+6 (Asia/Dhaka) only
- **Email Limit:** Maximum 5,000 emails per fetch
- **Cache Duration:** 30 days (automatic cleanup)
- **Session Duration:** 24 hours
- **Categorization Accuracy:** ~85% (manual review recommended)

## 🚀 Quick Links

- [Live Demo](#) (if available)
- [Documentation](./docs/)
- [API Reference](./docs/API_DOCUMENTATION.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Changelog](./CHANGELOG.md)
- [Contributing Guidelines](#contributing)

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running: `brew services list` (macOS)
- Check connection string in `.env.local`
- Verify network access for MongoDB Atlas

**OAuth Authentication Error:**
- Verify Azure AD credentials
- Check redirect URI matches exactly
- Ensure API permissions are granted

**Build Errors:**
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 20+)

## 📧 Support

For support and questions, please [create an issue](../../issues) or contact the development team.

---

Built with ❤️ using Next.js 14, TypeScript, and MongoDB

