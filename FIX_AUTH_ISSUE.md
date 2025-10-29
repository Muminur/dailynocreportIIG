# 🔧 Fix Authentication Issue

## Problem Identified

Authentication error: "There is a problem with the server configuration"

**Root Cause:** Missing `AZURE_AD_TENANT_ID` environment variable

---

## ✅ Environment Variables Status

Already Set (✅):
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL
- ✅ ENCRYPTION_KEY
- ✅ AZURE_AD_CLIENT_ID
- ✅ AZURE_AD_CLIENT_SECRET
- ✅ MONGODB_URI

**Missing (❌):**
- ❌ **AZURE_AD_TENANT_ID** ← This is causing the error!

---

## 🔧 Solution: Add Missing Variable

### Option 1: Using Vercel CLI (Fastest)

```bash
# Run this command and enter your Azure AD Tenant ID when prompted:
vercel env add AZURE_AD_TENANT_ID production
```

**Where to find your Tenant ID:**
1. Go to Azure Portal: https://portal.azure.com
2. Navigate to "Azure Active Directory"
3. In the overview page, you'll see "Tenant ID"
4. Copy that value (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Option 2: Using Vercel Dashboard

1. Go to: https://vercel.com/iig-reports-projects/noc-email-report-generator/settings/environment-variables
2. Click "Add New"
3. **Key:** `AZURE_AD_TENANT_ID`
4. **Value:** Your Azure AD Tenant ID (from Azure Portal)
5. **Environments:** Check all (Production, Preview, Development)
6. Click "Save"

---

## 🚀 After Adding the Variable

### Step 1: Redeploy the Application

```bash
vercel --prod
```

### Step 2: Verify Azure AD Redirect URI

Make sure your Azure App registration has this redirect URI:

```
https://noc-email-report-generator-8d2fdcj2d-iig-reports-projects.vercel.app/api/auth/callback/azure-ad
```

**How to add it:**
1. Go to Azure Portal → Azure Active Directory → App registrations
2. Select your app
3. Click "Authentication" in the left menu
4. Under "Web" platform, add the redirect URI above
5. Click "Save"

### Step 3: Test Authentication

1. Visit: https://noc-email-report-generator-8d2fdcj2d-iig-reports-projects.vercel.app
2. Click "Sign in with Microsoft"
3. You should now be able to authenticate!

---

## 🔍 Additional Troubleshooting

If you still get errors after adding AZURE_AD_TENANT_ID:

### Check 1: Verify All Azure AD Values

Run this to check what's set:
```bash
vercel env ls
```

Make sure these are all present:
- AZURE_AD_CLIENT_ID
- AZURE_AD_CLIENT_SECRET
- AZURE_AD_TENANT_ID ← Must be there!

### Check 2: View Deployment Logs

```bash
vercel logs https://noc-email-report-generator-8d2fdcj2d-iig-reports-projects.vercel.app
```

Look for any errors related to NextAuth or Azure AD.

### Check 3: Verify Azure AD Configuration

In Azure Portal, verify:
1. **Application (client) ID** matches `AZURE_AD_CLIENT_ID`
2. **Directory (tenant) ID** matches `AZURE_AD_TENANT_ID`
3. **Client secret** is valid and matches `AZURE_AD_CLIENT_SECRET`
4. **Redirect URI** includes your Vercel URL

### Check 4: Test Environment Variables

After redeployment, test if environment variables are loaded:
```bash
curl https://noc-email-report-generator-8d2fdcj2d-iig-reports-projects.vercel.app/health
```

Should return healthy status (if MONGODB_URI is correct).

---

## 📋 Quick Checklist

- [ ] Add AZURE_AD_TENANT_ID to Vercel environment variables
- [ ] Redeploy application (`vercel --prod`)
- [ ] Verify redirect URI in Azure AD
- [ ] Test sign-in again
- [ ] Check deployment logs if still failing

---

## 🆘 If Still Not Working

**Get detailed error information:**

1. Check browser console (F12 → Console tab) when trying to sign in
2. Check Vercel logs: `vercel logs [your-url]`
3. Verify Azure AD app permissions include:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
   - `Mail.Read`
   - `offline_access`

---

**File created:** October 29, 2025

