# Azure AD Setup Checklist

## ✅ Current Status

Your application is deployed with:
- Tenant ID: `3b1b7dd7-d9b7-48ab-97fd-73f0171c708e`
- Production URL: https://noc-email-report-generator-3ieabtp0r-iig-reports-projects.vercel.app

---

## 🔧 Azure AD Configuration Required

### Step 1: Add Redirect URI

1. Go to **Azure Portal**: https://portal.azure.com
2. Navigate to **Azure Active Directory** → **App registrations**
3. Select your application
4. Click **Authentication** in the left menu
5. Under **Platform configurations** → **Web**, click **Add URI**
6. Add this exact URI:
   ```
   https://noc-email-report-generator-3ieabtp0r-iig-reports-projects.vercel.app/api/auth/callback/azure-ad
   ```
7. Click **Save**

### Step 2: Verify API Permissions

1. In the same app registration, click **API permissions** in the left menu
2. Ensure these Microsoft Graph permissions are present:

   **Delegated permissions:**
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
   - `Mail.Read`
   - `offline_access`

3. If any are missing:
   - Click **Add a permission**
   - Select **Microsoft Graph**
   - Select **Delegated permissions**
   - Add the missing permissions
   - Click **Add permissions**
   - Click **Grant admin consent** (if you have admin rights)

### Step 3: Verify Client Secret

1. Click **Certificates & secrets** in the left menu
2. Ensure you have an active client secret
3. If expired or missing, create a new one:
   - Click **New client secret**
   - Add description: "Production Secret"
   - Set expiration (recommended: 24 months)
   - Click **Add**
   - **IMPORTANT:** Copy the secret value immediately (you won't see it again!)
   - Update the `AZURE_AD_CLIENT_SECRET` in Vercel if you created a new one

---

## 🧪 Test Authentication

Once Azure AD is configured:

1. **Visit your application:**
   https://noc-email-report-generator-3ieabtp0r-iig-reports-projects.vercel.app

2. **Click "Sign in with Microsoft"**

3. **Enter your credentials**
   - Use your organizational Microsoft account
   - Email format: user@yourdomain.com

4. **Grant permissions** (first time only)
   - Review the permissions requested
   - Click "Accept"

5. **Success!**
   - You should be redirected to the dashboard
   - You can now fetch emails and generate reports!

---

## 🔍 Troubleshooting

### Error: "AADSTS50011: The reply URL does not match"

**Fix:** The redirect URI in Azure AD doesn't match. Double-check:
- Copy the URI exactly: `https://noc-email-report-generator-3ieabtp0r-iig-reports-projects.vercel.app/api/auth/callback/azure-ad`
- Make sure there are no spaces or extra characters
- Save the changes in Azure Portal

### Error: "AADSTS65001: The user or administrator has not consented"

**Fix:** Permissions not granted. You need to:
1. Add the required API permissions (see Step 2 above)
2. Grant admin consent (if you're an admin)
3. OR have users consent during first sign-in

### Error: "Invalid client secret"

**Fix:** The client secret expired or is incorrect:
1. Generate a new client secret in Azure Portal
2. Update `AZURE_AD_CLIENT_SECRET` in Vercel:
   ```bash
   vercel env rm AZURE_AD_CLIENT_SECRET production
   vercel env add AZURE_AD_CLIENT_SECRET production
   ```
3. Redeploy: `vercel --prod`

### Still getting "Server configuration error"

**Check Vercel logs:**
```bash
vercel logs https://noc-email-report-generator-3ieabtp0r-iig-reports-projects.vercel.app --follow
```

Then try signing in again and watch for specific error messages.

---

## ✅ Quick Verification Checklist

Before testing, verify:

- [ ] Redirect URI added in Azure AD
- [ ] All 6 Microsoft Graph permissions granted
- [ ] Client secret is valid (not expired)
- [ ] Application is deployed (vercel ls shows "Ready")
- [ ] Environment variables are set in Vercel:
  - [ ] NEXTAUTH_SECRET
  - [ ] NEXTAUTH_URL
  - [ ] ENCRYPTION_KEY
  - [ ] AZURE_AD_CLIENT_ID
  - [ ] AZURE_AD_CLIENT_SECRET
  - [ ] AZURE_AD_TENANT_ID
  - [ ] MONGODB_URI

---

## 📞 Support

If authentication still fails after following these steps:

1. Check browser console (F12) for JavaScript errors
2. Check Vercel logs for server-side errors
3. Verify Azure AD app registration settings
4. Ensure your Microsoft account has necessary permissions

---

**Last Updated:** October 29, 2025
**Application Version:** 1.0.0
