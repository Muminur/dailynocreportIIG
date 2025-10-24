# CLAUDE.md - NOC Email Report Generator Project Guide

## 🎯 Project Context
You are working on the **NOC Email Report Generator**, a web application that automates the creation of daily Network Operations Center (NOC) reports by parsing emails from Microsoft Outlook accounts.

## 📋 Session Start Protocol
**IMPORTANT:** At the start of EVERY new conversation, you MUST:
1. **READ** `PLANNING.md` to understand the project vision, architecture, and technology stack
2. **CHECK** `TASKS.md` to see what tasks are pending and what has been completed
3. **IDENTIFY** which milestone and tasks you'll be working on in this session
4. **UPDATE** tasks in `TASKS.md` immediately after completing them
5. **ADD** any newly discovered tasks to `TASKS.md` when found

## 🏗️ Project Structure
```
noc-email-report-generator/
├── src/
│   ├── app/                    # Next.js 14+ app directory
│   │   ├── api/                # API routes
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Dashboard pages
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── auth/              # Authentication components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── report/            # Report display/editing components
│   │   └── export/            # Export functionality components
│   ├── lib/                   # Utility libraries
│   │   ├── auth/              # Auth utilities (OAuth, tokens)
│   │   ├── email/             # Email parsing and categorization
│   │   ├── db/                # MongoDB connection and queries
│   │   └── export/            # Export utilities (XLSX, PDF)
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # Global styles and CSS modules
├── public/                    # Static assets
├── tests/                     # Test files
├── .env.local                 # Environment variables (create from .env.example)
├── .env.example              # Environment variables template
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
├── next.config.js            # Next.js configuration
├── PLANNING.md               # Project planning document
├── TASKS.md                  # Task tracking document
└── README.md                 # Project documentation
```

## 🔑 Key Implementation Guidelines

### Authentication & Security
- Use Microsoft OAuth 2.0 v2 endpoint for authentication
- Required scopes: `Mail.Read`, `User.Read`
- Store tokens securely using encryption
- Implement automatic token refresh
- Session duration: 24 hours
- Never expose sensitive data in client-side code

### Email Processing
- Use Microsoft Graph API for email retrieval
- Apply GMT+6 timezone for all date/time operations
- Parse both inbox and sent items
- Implement pagination for large email volumes
- Category keywords are case-insensitive

### Database Operations
- MongoDB connection string in environment variable
- Implement proper error handling for all DB operations
- Use transactions for multi-document updates
- Index frequently queried fields

### Report Generation
- Generate reports within 2 minutes
- Auto-save changes with debouncing (2 seconds)
- Maintain editing history for audit trail
- Update summary statistics in real-time

### Export Functionality
- XLSX export with formatting and multiple sheets
- PDF export matching the specified template format
- Handle large reports efficiently
- Implement progress indicators for exports

## 🎨 UI/UX Requirements
- Responsive design for desktop and tablet
- Loading states for all async operations
- User-friendly error messages
- Inline editing with auto-save
- Drag-and-drop or button-based row reordering
- Clear visual feedback for user actions

## 🧪 Testing Approach
- Write unit tests for:
  - Email parsing logic
  - Categorization functions
  - Summary calculations
  - Date/time utilities
- Integration tests for:
  - OAuth flow
  - Microsoft Graph API calls
  - MongoDB operations
  - Export functionality
- E2E tests for critical user flows

## 📝 Code Quality Standards
- TypeScript strict mode enabled
- ESLint and Prettier configured
- Meaningful variable and function names
- Comprehensive error handling
- JSDoc comments for complex functions
- No console.logs in production code

## 🚀 Development Workflow
1. **Feature Development**:
   - Create feature branch from main
   - Implement feature following the PRD
   - Write tests alongside code
   - Update TASKS.md with progress

2. **Code Review Checklist**:
   - [ ] TypeScript types properly defined
   - [ ] Error handling implemented
   - [ ] Loading states added
   - [ ] Responsive design verified
   - [ ] Tests written and passing
   - [ ] No sensitive data exposed

3. **Deployment Preparation**:
   - [ ] Environment variables configured
   - [ ] MongoDB indexes created
   - [ ] Microsoft Azure AD app registered
   - [ ] Build optimization completed
   - [ ] Security headers configured

## 🔍 Common Issues & Solutions

### Microsoft Graph API Rate Limiting
- Implement exponential backoff
- Cache frequently accessed data
- Batch API requests when possible
- Show user-friendly messages during rate limit

### Email Parsing Accuracy
- Log unparsed emails for analysis
- Allow manual categorization override
- Implement fuzzy matching for keywords
- Provide "Uncategorized" fallback

### Large Email Volumes
- Implement streaming/pagination
- Show progress indicators
- Process in batches
- Add "Cancel" operation option

## 📚 Resources
- [Microsoft Graph API Docs](https://docs.microsoft.com/en-us/graph/api/overview)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [React Hook Form](https://react-hook-form.com/)
- [TanStack Table](https://tanstack.com/table/latest)

## ⚠️ Critical Reminders
1. **ALWAYS** check PLANNING.md and TASKS.md at session start
2. **NEVER** commit sensitive data or credentials
3. **UPDATE** TASKS.md immediately after completing tasks
4. **TEST** authentication flow thoroughly
5. **VALIDATE** email parsing logic with various email formats
6. **ENSURE** MongoDB connection pooling is properly configured
7. **IMPLEMENT** proper error boundaries in React components
8. **ADD** newly discovered tasks to TASKS.md

## 🎯 Success Criteria
- [ ] Report generation < 2 minutes
- [ ] Email parsing accuracy > 85%
- [ ] All P0 features implemented
- [ ] Export functionality working reliably
- [ ] Responsive UI on all target devices
- [ ] Comprehensive error handling
- [ ] Security best practices followed
- [ ] Documentation complete
