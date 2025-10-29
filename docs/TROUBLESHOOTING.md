# Troubleshooting Guide

Comprehensive troubleshooting guide for the NOC Email Report Generator.

---

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Email Fetching Problems](#email-fetching-problems)
3. [Report Generation Errors](#report-generation-errors)
4. [Database Issues](#database-issues)
5. [Export Problems](#export-problems)
6. [Performance Issues](#performance-issues)
7. [Deployment Issues](#deployment-issues)
8. [Common Error Messages](#common-error-messages)

---

## Authentication Issues

### Cannot Sign In - Redirect Loop

**Symptoms:**
- Clicking "Sign in with Microsoft" redirects back to sign-in page
- Infinite redirect loop
- No error message

**Possible Causes:**
1. Incorrect `NEXTAUTH_URL` in environment
2. Azure AD redirect URI mismatch
3. Browser cookies disabled
4. Session cookie not being set

**Solutions:**

**1. Verify NEXTAUTH_URL:**
```bash
# Check .env.local
cat .env.local | grep NEXTAUTH_URL

# Should match your actual URL exactly:
# Development: http://localhost:3000
# Production: https://your-domain.com (no trailing slash)
```

**2. Check Azure AD Redirect URI:**
- Go to Azure Portal → App registrations → Your app
- Check Authentication → Redirect URIs
- Must match exactly: `https://your-domain.com/api/auth/callback/microsoft`

**3. Test in Different Browser:**
```bash
# Try incognito/private mode
# Clear cookies: Application → Cookies → Clear
```

**4. Check NextAuth Configuration:**
```bash
# View application logs
pm2 logs noc-app | grep "auth"

# Look for errors related to callback or session
```

---

### Error: "Configuration" or "Missing Configuration"

**Symptoms:**
- Error message: "There is a problem with the server configuration"
- Cannot start authentication

**Possible Causes:**
- Missing environment variables
- Invalid `NEXTAUTH_SECRET`
- Azure AD credentials incorrect

**Solutions:**

**1. Verify All Required Variables:**
```bash
# Check all auth-related variables exist
cat .env.local | grep -E "NEXTAUTH|AZURE"

# Required:
# NEXTAUTH_URL
# NEXTAUTH_SECRET
# AZURE_AD_TENANT_ID
# AZURE_AD_CLIENT_ID
# AZURE_AD_CLIENT_SECRET
```

**2. Regenerate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
# Update in .env.local
# Restart application
pm2 restart noc-app
```

**3. Test Azure AD Credentials:**
- Sign in to Azure Portal with same credentials
- Verify tenant ID, client ID, client secret
- Regenerate client secret if expired

---

### Token Expired or Invalid

**Symptoms:**
- Signed in but API calls fail with 401
- "Token expired" error
- Forced to sign in again repeatedly

**Possible Causes:**
- Access token expired (1-hour lifetime)
- Refresh token expired or invalid
- Token refresh mechanism failed

**Solutions:**

**1. Check Token Expiry in Database:**
```javascript
// MongoDB shell
use noc-reports
db.users.find({ email: "user@example.com" }, { tokenExpiry: 1 })

// If expired, user needs to sign in again
```

**2. Verify Refresh Token Flow:**
```bash
# Check logs for refresh attempts
pm2 logs noc-app | grep -i "refresh"

# Look for errors in token refresh
```

**3. Manual Fix - Clear User Tokens:**
```javascript
// Force user to re-authenticate
db.users.updateOne(
  { email: "user@example.com" },
  { 
    $set: { 
      accessToken: null, 
      refreshToken: null, 
      tokenExpiry: new Date() 
    } 
  }
)
```

---

## Email Fetching Problems

### Emails Not Fetching - API Error

**Symptoms:**
- "Failed to fetch emails" error
- Spinner spins indefinitely
- No emails returned

**Possible Causes:**
1. Microsoft Graph API rate limiting
2. Network connectivity issues
3. Invalid access token
4. Date format incorrect

**Solutions:**

**1. Check Rate Limiting:**
```bash
# Look for 429 errors in logs
pm2 logs noc-app | grep "429"

# If rate limited, wait 5-10 minutes and retry
```

**2. Verify Network Connectivity:**
```bash
# Test Graph API connectivity
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://graph.microsoft.com/v1.0/me

# Should return user info, not an error
```

**3. Check Date Format:**
```javascript
// Date must be YYYY-MM-DD format
// Correct: "2025-10-29"
// Wrong: "10/29/2025", "29-10-2025"
```

**4. Test with Specific Date:**
```bash
# Try a date you know has emails
# Example: yesterday's date
```

**5. Check Application Logs:**
```bash
pm2 logs noc-app --lines 50 | grep -i "email\|graph"
```

---

### Emails Fetching But Incomplete

**Symptoms:**
- Only some emails fetched
- Missing expected emails
- Fetched count seems low

**Possible Causes:**
- Pagination limit reached
- Email filter too restrictive
- Timezone issues (GMT+6)
- Emails in different folder

**Solutions:**

**1. Check Pagination Limit:**
```typescript
// Current limit: 100 pages * 50 emails = 5000 emails max
// See src/lib/email/email-fetcher.ts

// If you need more, increase MAX_PAGES
const CONFIG = {
  MAX_PAGES: 150,  // Increase this
};
```

**2. Verify Timezone Conversion:**
```javascript
// GMT+6 timezone
// 2025-10-29 in GMT+6 = 2025-10-28 18:00:00 UTC to 2025-10-29 18:00:00 UTC

// Check if emails are just outside the window
```

**3. Check Both Inbox and Sent Items:**
```bash
# App fetches from both folders
# Verify emails exist in either folder for that date
```

---

### Cache Issues - Stale Data

**Symptoms:**
- New emails not appearing
- Old data showing up
- "From cache" always true

**Possible Causes:**
- Email cache not expiring
- Cache timestamp incorrect
- Database cache entries stale

**Solutions:**

**1. Clear Email Cache:**
```javascript
// MongoDB shell
use noc-reports
db.email_cache.deleteMany({ 
  userId: ObjectId("YOUR_USER_ID") 
})

// Or clear cache for specific date
db.email_cache.deleteMany({ 
  userId: ObjectId("YOUR_USER_ID"),
  receivedDateTime: { 
    $gte: ISODate("2025-10-29T00:00:00Z"),
    $lt: ISODate("2025-10-30T00:00:00Z")
  }
})
```

**2. Verify TTL Index:**
```javascript
// Check TTL index exists
db.email_cache.getIndexes()

// Should have index with expireAfterSeconds: 2592000 (30 days)

// If missing, create it:
db.email_cache.createIndex(
  { createdAt: 1 }, 
  { expireAfterSeconds: 2592000 }
)
```

---

## Report Generation Errors

### Report Generation Fails

**Symptoms:**
- "Failed to generate report" error
- Generation hangs indefinitely
- Partial report created

**Possible Causes:**
1. Email parsing errors
2. Database connection issues
3. Memory exhaustion
4. Invalid email format

**Solutions:**

**1. Check Application Logs:**
```bash
pm2 logs noc-app --err --lines 100 | grep -i "generate\|parse"
```

**2. Test Email Parser:**
```bash
# Run unit tests
npm test -- tests/lib/email/parser.test.ts

# Check for failures
```

**3. Verify Database Connection:**
```javascript
// MongoDB shell - test connection
use noc-reports
db.runCommand({ ping: 1 })  // Should return { ok: 1 }
```

**4. Check Memory Usage:**
```bash
# If Node.js runs out of memory
pm2 monit

# Increase memory limit if needed
pm2 delete noc-app
pm2 start npm --name "noc-app" --node-args="--max-old-space-size=4096" -- start
```

---

### Wrong Categorization

**Symptoms:**
- Emails categorized incorrectly
- Too many "Uncategorized" entries
- Categories don't make sense

**Expected Behavior:**
- Auto-categorization is ~85% accurate
- Manual review and correction expected

**Solutions:**

**1. Understand Categorization Logic:**
```typescript
// Categorization is keyword-based
// Keywords in src/lib/email/parser.ts

// Backhaul: "backhaul", "transmission", "fiber cut", "core"
// Upstreams: "upstream", "isp down", "provider issue", "bandwidth"
// IPT Client: "ipt", "voip", "sip", "telephone"
// ISP Client: "customer", "client", "subscriber", "internet down"
```

**2. Manually Correct Categories:**
- In report editor, use category dropdown
- Changes save automatically

**3. Improve Keywords (Development):**
```typescript
// Edit src/lib/email/parser.ts
// Add your organization-specific keywords
```

---

### Statistics Incorrect

**Symptoms:**
- Statistics don't add up
- Recurring complaints wrong
- Resolved/Unresolved counts off

**Possible Causes:**
- Manual edits not recalculated
- Client name inconsistencies
- Statistics formula error

**Solutions:**

**1. Verify Calculation Logic:**
```typescript
// Statistics calculated from entries
// Total Services: count where type === "Service"
// New Complaints: Total complaints - Recurring
// Recurring: Based on client name matching previous reports
```

**2. Check Client Name Consistency:**
```javascript
// Recurring complaints detected by exact client name match
// "ABC Corp" vs "ABC Corporation" = different clients

// Solution: Use consistent naming
```

**3. Force Recalculation:**
```bash
# Edit any entry in the report
# Auto-save triggers statistics recalculation
```

---

## Database Issues

### Cannot Connect to MongoDB

**Symptoms:**
- "MongoNetworkError: connection refused"
- Application won't start
- "ECONNREFUSED" errors

**Possible Causes:**
- MongoDB not running
- Incorrect connection string
- Network/firewall issues
- Authentication failure

**Solutions:**

**1. Verify MongoDB is Running:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# If stopped, start it
sudo systemctl start mongod

# Check if listening
sudo lsof -i :27017
```

**2. Test Connection String:**
```bash
# Test connection manually
mongosh "mongodb://localhost:27017/noc-reports"

# Or with authentication
mongosh "mongodb://user:pass@localhost:27017/noc-reports?authSource=admin"
```

**3. Check Firewall:**
```bash
# If MongoDB on different server
sudo ufw status
sudo ufw allow from YOUR_APP_SERVER_IP to any port 27017
```

**4. Verify Connection String Format:**
```bash
# Local: mongodb://localhost:27017/noc-reports
# Auth: mongodb://user:pass@host:port/db?authSource=admin
# Atlas: mongodb+srv://user:pass@cluster.mongodb.net/db
```

---

### Slow Database Queries

**Symptoms:**
- Slow page loads
- Report list takes long to load
- Database operations timeout

**Possible Causes:**
- Missing indexes
- Large collections
- Inefficient queries
- MongoDB overloaded

**Solutions:**

**1. Verify Indexes:**
```javascript
// MongoDB shell
use noc-reports

// Check indexes on each collection
db.users.getIndexes()
db.reports.getIndexes()
db.email_cache.getIndexes()

// Create missing indexes (see PLANNING.md for full list)
```

**2. Identify Slow Queries:**
```javascript
// Enable profiling
db.setProfilingLevel(1, { slowms: 100 })

// View slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 }).limit(10)
```

**3. Optimize Queries:**
```javascript
// Use explain() to analyze queries
db.reports.find({ userId: ObjectId("...") }).explain("executionStats")

// Look for:
// - executionStats.executionTimeMillis (should be < 100ms)
// - totalKeysExamined vs totalDocsExamined (should be close)
```

**4. Clear Old Cache:**
```javascript
// Delete old email cache (30+ days)
db.email_cache.deleteMany({ 
  createdAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) } 
})
```

---

## Export Problems

### Export Fails - No Download

**Symptoms:**
- Click export button, nothing happens
- Error message appears
- Download starts but file is corrupt

**Possible Causes:**
1. Large report (500+ entries)
2. Browser blocking download
3. Server timeout
4. Memory issues

**Solutions:**

**1. Check Report Size:**
```javascript
// For large reports, export may take 10-30 seconds
// Be patient, wait for download

// If consistently failing, reduce report size:
// - Split into multiple reports
// - Remove unnecessary entries
```

**2. Check Browser Console:**
```bash
# Open Developer Tools (F12)
# Check Console tab for errors
# Check Network tab for failed requests
```

**3. Try Other Format:**
```bash
# If XLSX fails, try PDF
# If PDF fails, try XLSX
# They use different generation methods
```

**4. Increase Server Timeout:**
```javascript
// In next.config.js (development)
module.exports = {
  async headers() {
    return [
      {
        source: '/api/reports/:path*/export',
        headers: [
          { key: 'Access-Control-Max-Age', value: '600' },
        ],
      },
    ]
  },
}
```

---

### Export File Corrupt or Empty

**Symptoms:**
- Downloaded file won't open
- File size is 0 bytes
- Excel/PDF shows error

**Possible Causes:**
- Export generation failed
- Incomplete download
- Special characters in data

**Solutions:**

**1. Check Application Logs:**
```bash
pm2 logs noc-app | grep -i "export\|xlsx\|pdf"
```

**2. Verify Report Has Data:**
```javascript
// MongoDB shell
use noc-reports
db.reports.findOne({ _id: ObjectId("REPORT_ID") })

// Verify entries array is not empty
```

**3. Test with Small Report:**
```bash
# Create a test report with just 2-3 entries
# Try exporting
# If works, issue is with large data or specific entries
```

**4. Check for Special Characters:**
```javascript
// Some special characters may cause issues
// Check entries for: <, >, &, ", '
// These should be escaped automatically, but verify
```

---

## Performance Issues

### Slow Page Loads

**Symptoms:**
- Dashboard takes > 5 seconds to load
- Report editor slow
- API calls timeout

**Possible Causes:**
- Poor internet connection
- Server overloaded
- Database slow
- Large reports

**Solutions:**

**1. Check Network:**
```bash
# Test connection speed
curl -o /dev/null -w "Time: %{time_total}s\n" https://your-domain.com/

# Should be < 2 seconds
```

**2. Check Server Resources:**
```bash
# CPU, memory, disk
htop
free -m
df -h

# If high usage, investigate and optimize
```

**3. Database Performance:**
```javascript
// Check MongoDB stats
use noc-reports
db.stats()
db.serverStatus()

// Look for slow operations
db.currentOp({ "secs_running": { "$gt": 5 } })
```

**4. Enable Compression:**
```javascript
// In next.config.js
module.exports = {
  compress: true,
}
```

---

### High Memory Usage

**Symptoms:**
- Application crashes with "Out of memory"
- PM2 shows high memory
- Server becomes unresponsive

**Possible Causes:**
- Memory leak
- Large report processing
- Too many concurrent users

**Solutions:**

**1. Increase Node.js Memory:**
```bash
pm2 delete noc-app
pm2 start npm --name "noc-app" \
  --node-args="--max-old-space-size=4096" \
  -- start
```

**2. Monitor Memory:**
```bash
pm2 monit
# Watch memory usage over time
```

**3. Restart Periodically:**
```bash
# Add cron job to restart daily at low-traffic time
crontab -e
# 0 3 * * * pm2 restart noc-app
```

---

## Deployment Issues

### Build Fails

**Symptoms:**
- `npm run build` errors
- TypeScript errors
- Module not found errors

**Solutions:**

**1. Clear Cache and Rebuild:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**2. Check Node Version:**
```bash
node --version  # Should be 20.x
npm --version   # Should be 10.x
```

**3. Fix TypeScript Errors:**
```bash
npm run type-check
# Fix all errors before building
```

---

### Application Won't Start in Production

**Symptoms:**
- PM2 shows "errored" status
- Port already in use
- Environment variables missing

**Solutions:**

**1. Check PM2 Logs:**
```bash
pm2 logs noc-app --err --lines 100
```

**2. Verify Port Availability:**
```bash
sudo lsof -i :3000
# If something using port 3000, kill it or use different port
```

**3. Check Environment Variables:**
```bash
cat .env.local
# Verify all required variables present
```

---

## Common Error Messages

### "Authentication required"

**Meaning:** User not signed in or session expired  
**Solution:** Sign in again

### "Report not found"

**Meaning:** Report ID invalid or doesn't belong to user  
**Solution:** Check report ID, ensure signed in as correct user

### "Failed to fetch emails"

**Meaning:** Microsoft Graph API call failed  
**Solution:** Check internet, wait if rate limited, verify token

### "Database connection failed"

**Meaning:** Cannot connect to MongoDB  
**Solution:** Verify MongoDB running, check connection string

### "Export generation failed"

**Meaning:** XLSX/PDF generation error  
**Solution:** Check logs, try other format, verify report data

---

## Getting Help

### Self-Diagnosis Steps

1. **Check application logs:**
   ```bash
   pm2 logs noc-app --lines 100
   ```

2. **Check browser console:**
   - F12 → Console tab
   - Look for errors

3. **Verify environment:**
   ```bash
   node --version
   npm --version
   mongosh --version
   ```

4. **Test in isolation:**
   - Sign out and sign in
   - Try different browser
   - Test on different device

### Collecting Information for Support

When reporting issues, include:

1. **Error message** (exact text or screenshot)
2. **Steps to reproduce**
3. **Browser and version**
4. **Application logs** (last 50 lines)
5. **Network tab** (if API issue)
6. **What you've tried** to fix it

### Contact Support

- System Administrator
- Development Team
- Create GitHub Issue (if applicable)

---

## Prevention Tips

### Best Practices

1. **Regular Updates:**
   - Keep application updated
   - Update dependencies: `npm update`

2. **Monitor Resources:**
   - Check disk space: `df -h`
   - Monitor memory: `free -m`
   - Watch logs: `pm2 logs`

3. **Backups:**
   - Daily database backups
   - Version control for code

4. **Testing:**
   - Test after deployments
   - Verify all features work
   - Check in multiple browsers

5. **Documentation:**
   - Keep deployment docs updated
   - Document custom configurations
   - Note any workarounds

---

**Still having issues?** Contact your system administrator with the information you've gathered.

---

**Last Updated:** October 29, 2025

