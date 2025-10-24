# Environment Variables

Copy this file to `.env.local` and fill in your actual values.

```bash
# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-using-openssl-rand-base64-32

# Microsoft Azure OAuth Configuration
AZURE_AD_TENANT_ID=your-tenant-id-from-azure-portal
AZURE_AD_CLIENT_ID=your-client-id-from-azure-portal
AZURE_AD_CLIENT_SECRET=your-client-secret-from-azure-portal

# MongoDB Configuration
# For Local Development
MONGODB_URI=mongodb://localhost:27017/noc-reports
# For Production (replace with your connection string)
# MONGODB_URI=mongodb://username:password@host:port/database

# Microsoft Graph API
GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0

# Encryption Key (Generate using: openssl rand -hex 32)
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Application Settings
DEFAULT_TIMEZONE=Asia/Dhaka
MAX_EXPORT_ROWS=10000
PDF_LOGO_URL=/logo.png

# Session Configuration
SESSION_MAX_AGE=86400

# Environment
NODE_ENV=development
```

## Instructions

1. Copy the content above to a new file named `.env.local` in the root directory
2. Replace all placeholder values with your actual credentials
3. Never commit `.env.local` to version control
4. For production, use environment variables from your hosting platform

