# NOC Email Report Generator

An automated web application for Network Operations Center (NOC) daily reporting that parses Microsoft Outlook emails and generates structured, editable reports in multiple formats.

## 🚀 Features

- **Microsoft OAuth Authentication** - Secure login with Microsoft accounts
- **Automated Email Parsing** - Intelligent categorization of NOC incidents
- **Editable Reports** - Full editing capabilities with auto-save
- **Multiple Export Formats** - Export to XLSX and PDF
- **Real-time Statistics** - Instant insights into daily operations
- **GMT+6 Timezone Support** - Designed for Asia/Dhaka timezone

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

# Start production server
npm start
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Check TypeScript types

## 🔐 Security

- Never commit `.env.local` or any files containing secrets
- Rotate your `NEXTAUTH_SECRET` and `ENCRYPTION_KEY` regularly
- Keep dependencies updated
- Use environment variables for all sensitive data

## 📝 Documentation

For detailed documentation, see:
- [PLANNING.md](./PLANNING.md) - Project architecture and technical specifications
- [TASKS.md](./TASKS.md) - Development task tracker
- [CLAUDE.md](./CLAUDE.md) - AI assistant guide for development

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Update documentation
5. Submit a pull request

## 📄 License

[Specify your license here]

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

