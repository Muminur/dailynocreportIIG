# Microsoft Azure AD Application Setup Guide

Complete step-by-step guide to register and configure your Azure AD application for OAuth authentication with the NOC Email Report Generator.

---

## 📋 Prerequisites

- Microsoft Azure account with admin access
- Access to Azure Portal (portal.azure.com)
- Basic understanding of OAuth 2.0

---

## 🚀 Step 1: Access Azure Portal

1. Navigate to [Azure Portal](https://portal.azure.com/)
2. Sign in with your Microsoft account
3. Search for "Azure Active Directory" in the search bar
4. Click on "Azure Active Directory" from the results

---

## 📝 Step 2: Register New Application

1. In the Azure AD overview page, click on **App registrations** in the left sidebar
2. Click **+ New registration** at the top
3. Fill in the application details:

   **Name:**
   ```
   NOC Email Report Generator
   ```

   **Supported account types:**
   - Choose one of the following based on your needs:
     - **Single tenant**: Only users in your organization (recommended for internal use)
     - **Multi-tenant**: Users in any organization's Azure AD
     - **Personal Microsoft accounts**: Include consumer accounts

   **Redirect URI:**
   - Select **Web** from the dropdown
   - Enter the redirect URI:
     ```
     Development: http://localhost:3000/api/auth/callback/azure-ad
     Production: https://yourdomain.com/api/auth/callback/azure-ad
     ```
     ⚠️ **Note**: You can add multiple redirect URIs later

4. Click **Register**

---



## 🔑 Step 3: Get Application Credentials

### 3.1 Application (Client) ID

1. After registration, you'll be redirected to the app overview page
2. Copy the **Application (client) ID**
3. Save it as `AZURE_AD_CLIENT_ID` in your `.env.local` file:
   ```bash
   AZURE_AD_CLIENT_ID=your-client-id-here
   ```

### 3.2 Directory (Tenant) ID

1. On the same overview page, copy the **Directory (tenant) ID**
2. Save it as `AZURE_AD_TENANT_ID` in your `.env.local` file:
   ```bash
   AZURE_AD_TENANT_ID=your-tenant-id-here
   ```

### 3.3 Client Secret

1. Click on **Certificates & secrets** in the left sidebar
2. Under **Client secrets** tab, click **+ New client secret**
3. Add a description (e.g., "Production Secret")
4. Choose expiration period:
   - **180 days (6 months)**
   - **365 days (12 months)**
   - **730 days (24 months)** ⭐ Recommended
   - **Custom**
5. Click **Add**
6. **IMPORTANT**: Copy the **Value** immediately (you won't be able to see it again!)
7. Save it as `AZURE_AD_CLIENT_SECRET` in your `.env.local` file:
   ```bash
   AZURE_AD_CLIENT_SECRET=your-client-secret-here
   ```

⚠️ **Security Note**: Never commit the client secret to version control. Store it securely.

---

## 🔐 Step 4: Configure API Permissions

1. Click on **API permissions** in the left sidebar
2. You should see `User.Read` permission already added by default
3. Click **+ Add a permission**

### Add Microsoft Graph Permissions:

1. Select **Microsoft Graph**
2. Choose **Delegated permissions**
3. Search and select the following permissions:

   **Required Permissions:**
   - ✅ **User.Read** - Read user profile (already added)
   - ✅ **Mail.Read** - Read user's emails
   - ✅ **offline_access** - Maintain access to data (for token refresh)

   **Optional (for future features):**
   - **Mail.ReadWrite** - If you need to mark emails as read
   - **Mail.Send** - If you need to send reports via email

4. Click **Add permissions**

### Grant Admin Consent:

1. After adding permissions, click **Grant admin consent for [Your Organization]**
2. Click **Yes** to confirm
3. You should see green checkmarks ✅ next to all permissions

---

## 🌐 Step 5: Configure Redirect URIs (Multiple Environments)

1. Click on **Authentication** in the left sidebar
2. Under **Platform configurations** → **Web**, you should see your redirect URI
3. Add additional redirect URIs for different environments:

   **Development:**
   ```
   http://localhost:3000/api/auth/callback/azure-ad
   ```

   **Staging (if applicable):**
   ```
   https://staging.yourdomain.com/api/auth/callback/azure-ad
   ```

   **Production:**
   ```
   https://yourdomain.com/api/auth/callback/azure-ad
   ```

4. Scroll down to **Implicit grant and hybrid flows**
5. ✅ Check **ID tokens** (for hybrid flow support)
6. Click **Save**

---

## ⚙️ Step 6: Advanced Settings (Optional but Recommended)

### Token Configuration

1. Click on **Token configuration** in the left sidebar
2. Click **+ Add optional claim**
3. Select **ID** token type
4. Add these claims:
   - `email`
   - `preferred_username`
5. Click **Add**

### Branding

1. Click on **Branding & properties** in the left sidebar
2. Add your application details:
   - **Name**: NOC Email Report Generator
   - **Logo**: Upload your app logo (256x256 PNG)
   - **Home page URL**: https://yourdomain.com
   - **Terms of service URL**: (optional)
   - **Privacy statement URL**: (optional)
3. Click **Save**

---

## 🔒 Step 7: Security Recommendations

### 1. Enable Multi-Factor Authentication (MFA)
- Strongly recommended for production environments
- Configure under Azure AD → Security → Authentication methods

### 2. Set Up Conditional Access Policies
- Azure AD → Security → Conditional Access
- Create policies based on:
  - User location
  - Device compliance
  - Risk level

### 3. Monitor Sign-ins
- Azure AD → Monitoring → Sign-in logs
- Set up alerts for suspicious activities

### 4. Rotate Client Secrets Regularly
- Best practice: Rotate every 6-12 months
- Set up reminder before expiration
- Use Azure Key Vault for production

---

## 📄 Step 8: Update Environment Variables

Create or update your `.env.local` file in the project root:

```bash
# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here  # Generate with: openssl rand -base64 32

# Microsoft Azure OAuth Configuration
AZURE_AD_TENANT_ID=your-tenant-id-from-azure-portal
AZURE_AD_CLIENT_ID=your-client-id-from-azure-portal
AZURE_AD_CLIENT_SECRET=your-client-secret-from-azure-portal

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/noc-reports

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

---

## ✅ Step 9: Test the Configuration

1. Ensure your `.env.local` file has all required variables
2. Start your development server:
   ```bash
   npm run dev
   ```
3. Navigate to `http://localhost:3000`
4. Click "Sign In" and test the Microsoft OAuth flow
5. Verify you can:
   - Sign in successfully
   - See your profile information
   - Access the dashboard
   - Sign out

---

## 🐛 Troubleshooting

### Error: "AADSTS50011: The reply URL specified in the request does not match"

**Solution:**
- Check that your redirect URI in `.env.local` exactly matches the one in Azure AD
- Ensure there are no trailing slashes
- Verify you're using the correct port number

### Error: "AADSTS65001: The user or administrator has not consented"

**Solution:**
- Go to Azure AD → App registrations → Your app → API permissions
- Click "Grant admin consent"
- Ask your Azure AD admin to grant consent

### Error: "AADSTS700016: Application not found in the directory"

**Solution:**
- Verify `AZURE_AD_TENANT_ID` is correct
- Check that the application is registered in the correct tenant
- Ensure you're signing in with an account from the correct tenant

### Error: "Invalid client secret"

**Solution:**
- Generate a new client secret in Azure AD
- Update `AZURE_AD_CLIENT_SECRET` in `.env.local`
- Restart your development server

### Permissions Not Working

**Solution:**
- Ensure admin consent has been granted
- Check that the permissions are "Delegated" not "Application"
- Wait a few minutes for Azure AD to propagate changes
- Clear browser cache and try signing in again

---

## 📚 Additional Resources

- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [NextAuth.js Azure AD Provider Docs](https://next-auth.js.org/providers/azure-ad)
- [Microsoft Graph API Reference](https://docs.microsoft.com/en-us/graph/api/overview)
- [OAuth 2.0 and OpenID Connect](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-protocols)

---

## 🔄 Updating for Production

When deploying to production:

1. **Add production redirect URI** in Azure AD
2. **Update `.env` variables** on your hosting platform (not `.env.local`)
3. **Set up custom domain** if using one
4. **Enable logging and monitoring**
5. **Set up secret rotation schedule**
6. **Configure rate limiting** if needed
7. **Test thoroughly** before going live

---

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#-troubleshooting) section above
2. Review Azure AD sign-in logs for error details
3. Consult Microsoft documentation
4. Contact your Azure AD administrator

---

**Last Updated:** October 24, 2025  
**Version:** 1.0

