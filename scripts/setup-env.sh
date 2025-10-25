#!/bin/bash

# MongoDB Connection String Setup Script
# This script creates your .env.local file with the MongoDB connection

echo "🔧 Setting up environment variables..."

# MongoDB connection string
MONGODB_URI="mongodb://root:AD5Db8zE1N0R1bs0LZEfU1winw7QvEzkAYp4Gt2AEIcvhrtVmir5PqcOS826vNtM@66.179.240.208:5444/?directConnection=true"

# Create .env.local file
cat > .env.local << EOF
# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Microsoft Azure OAuth Configuration
AZURE_AD_TENANT_ID=your-tenant-id-from-azure-portal
AZURE_AD_CLIENT_ID=your-client-id-from-azure-portal
AZURE_AD_CLIENT_SECRET=your-client-secret-from-azure-portal

# MongoDB Configuration (Cloud)
MONGODB_URI=${MONGODB_URI}
MONGODB_DB_NAME=noc-reports

# Microsoft Graph API
GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0

# Encryption Key
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Application Settings
DEFAULT_TIMEZONE=Asia/Dhaka
MAX_EXPORT_ROWS=10000
PDF_LOGO_URL=/logo.png

# Session Configuration
SESSION_MAX_AGE=86400

# Environment
NODE_ENV=development
EOF

echo "✅ .env.local file created successfully!"
echo ""
echo "📝 Generated secrets:"
echo "   - NEXTAUTH_SECRET: Auto-generated"
echo "   - ENCRYPTION_KEY: Auto-generated"
echo ""
echo "⚠️  Remember to add your Azure AD credentials before running the app!"
echo ""
echo "Next steps:"
echo "1. Review and edit .env.local if needed"
echo "2. Run: npm run dev"


