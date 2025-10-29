# Vercel Deployment Guide - Quick Start

## 🚀 Environment Variables Needed

You'll need to set these in Vercel before deployment:

### 1. NextAuth.js
```bash
NEXTAUTH_SECRET=          # Generate: openssl rand -base64 32
NEXTAUTH_URL=             # Will be https://your-app.vercel.app (set after first deploy)
```

### 2. Azure AD (Get from Azure Portal)
```bash
AZURE_AD_CLIENT_ID=       # Your Azure App Client ID
AZURE_AD_CLIENT_SECRET=   # Your Azure App Client Secret
AZURE_AD_TENANT_ID=       # Your Azure Tenant ID
```

### 3. MongoDB
```bash
MONGODB_URI=              # Your MongoDB connection string
```

### 4. Security
```bash
ENCRYPTION_KEY=           # Generate: openssl rand -base64 32
```

### 5. Optional
```bash
NODE_ENV=production
```

---

## 📝 Step-by-Step Deployment

### Step 1: Generate Secrets (Run these commands)
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -base64 32
```

### Step 2: Deploy to Vercel
```bash
vercel --prod
```

### Step 3: Set Environment Variables
After deployment, go to:
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all the variables listed above
3. Redeploy to apply environment variables

### Step 4: Update Azure AD Redirect URI
After deployment, update your Azure App registration with the new redirect URI:
```
https://your-app.vercel.app/api/auth/callback/azure-ad
```

### Step 5: Test
Visit your app and test the sign-in flow!

---

## ⚡ Quick Deploy (If you have all env vars ready)

If you already have MongoDB and Azure AD configured:

```bash
# Deploy
vercel --prod

# Follow the prompts to set env variables
```

---

## 🔧 Troubleshooting

**Issue: Build fails**
- Check that all environment variables are set
- Ensure MongoDB connection string is correct

**Issue: Can't sign in**
- Verify Azure AD redirect URI is updated
- Check NEXTAUTH_URL matches your Vercel domain
- Ensure all Azure AD credentials are correct

**Issue: Database connection fails**
- Verify MONGODB_URI is correct
- Check MongoDB Atlas network access allows Vercel IPs (0.0.0.0/0)

---

## 📚 More Info

See `docs/DEPLOYMENT_GUIDE.md` for complete deployment documentation.

