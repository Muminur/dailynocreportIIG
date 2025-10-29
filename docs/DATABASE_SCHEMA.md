# Database Schema Documentation

Complete MongoDB database schema documentation for the NOC Email Report Generator.

---

## Overview

**Database Name:** `noc-reports`  
**Database Type:** MongoDB 6.0+  
**Collections:** 3 main collections

**Collections:**
1. `users` - User accounts and authentication data
2. `reports` - Generated NOC reports with entries
3. `email_cache` - Cached email data from Microsoft Graph API

---

## Collections

### 1. users

Stores user account information, authentication tokens, and session data.

#### Schema

```typescript
interface UserDocument {
  _id: ObjectId;                    // MongoDB ObjectId
  email: string;                    // User email (unique)
  name: string;                     // User full name
  microsoftId: string;              // Microsoft Azure AD user ID (unique)
  accessToken: string;              // Encrypted Microsoft Graph access token
  refreshToken: string;             // Encrypted Microsoft OAuth refresh token
  tokenExpiry: Date;                // Access token expiration timestamp
  lastLogin: Date;                  // Last successful login timestamp
  createdAt: Date;                  // Account creation timestamp
  updatedAt: Date;                  // Last update timestamp
}
```

#### Example Document

```json
{
  "_id": ObjectId("6720abc123def456..."),
  "email": "john.doe@example.com",
  "name": "John Doe",
  "microsoftId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "accessToken": "encrypted_token_here...",
  "refreshToken": "encrypted_token_here...",
  "tokenExpiry": ISODate("2025-10-29T12:00:00.000Z"),
  "lastLogin": ISODate("2025-10-29T08:00:00.000Z"),
  "createdAt": ISODate("2025-10-01T10:00:00.000Z"),
  "updatedAt": ISODate("2025-10-29T08:00:00.000Z")
}
```

#### Indexes

```javascript
// Unique email index
db.users.createIndex({ email: 1 }, { unique: true })

// Unique Microsoft ID index
db.users.createIndex({ microsoftId: 1 }, { unique: true })

// Last login index (for analytics)
db.users.createIndex({ lastLogin: -1 })
```

#### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Primary key |
| email | String | Yes | User email, unique constraint |
| name | String | Yes | Display name from Microsoft |
| microsoftId | String | Yes | Microsoft user ID, unique |
| accessToken | String | Yes | AES-256-GCM encrypted token |
| refreshToken | String | Yes | AES-256-GCM encrypted token |
| tokenExpiry | Date | Yes | Token expiry (1 hour from issue) |
| lastLogin | Date | Yes | Last successful authentication |
| createdAt | Date | Yes | Account creation |
| updatedAt | Date | Yes | Last modification |

#### Operations

**Create/Update User (Upsert):**
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { 
    $set: {
      name: "User Name",
      microsoftId: "...",
      accessToken: "...",
      refreshToken: "...",
      tokenExpiry: new Date(),
      lastLogin: new Date(),
      updatedAt: new Date()
    },
    $setOnInsert: {
      createdAt: new Date()
    }
  },
  { upsert: true }
)
```

**Find by Email:**
```javascript
db.users.findOne({ email: "user@example.com" })
```

**Update Tokens:**
```javascript
db.users.updateOne(
  { _id: ObjectId("...") },
  {
    $set: {
      accessToken: "new_encrypted_token",
      refreshToken: "new_encrypted_token",
      tokenExpiry: new Date(Date.now() + 3600000),
      updatedAt: new Date()
    }
  }
)
```

---

### 2. reports

Stores generated NOC reports with all entries, statistics, and metadata.

#### Schema

```typescript
interface ReportDocument {
  _id: ObjectId;                    // MongoDB ObjectId
  userId: ObjectId;                 // Reference to users._id
  date: Date;                       // Report date (start of day in GMT+6)
  timezone: string;                 // Timezone string (e.g., "Asia/Dhaka")
  entries: ReportEntry[];           // Array of report entries
  statistics: Statistics;           // Calculated statistics
  createdAt: Date;                  // Report creation timestamp
  updatedAt: Date;                  // Last update timestamp
  lastModifiedBy: string;           // Email of last modifier
}

interface ReportEntry {
  id: string;                       // UUID v4
  category: CategoryType;           // Entry category
  dateTime: Date;                   // Incident date/time
  clientVendor: string;             // Client or vendor name
  cause: string;                    // Incident cause
  downtime: string;                 // Downtime duration
  type: EntryType;                  // "Service" or "Complain"
  remarks: string;                  // Additional notes
  emailId?: string;                 // Source email ID (optional)
  isManuallyAdded: boolean;         // User added manually
  isEdited: boolean;                // User modified from original
}

type CategoryType = 
  | "Backhaul" 
  | "Upstreams" 
  | "IPT Client" 
  | "ISP Client" 
  | "Uncategorized";

type EntryType = "Service" | "Complain";

interface Statistics {
  totalServices: number;            // Count of Service entries
  totalNewComplaints: number;       // New complaints
  recurringComplaints: number;      // Complaints from repeat clients
  complaintsUnresolved: number;     // Open complaints
  complaintsResolved: number;       // Closed complaints
}
```

#### Example Document

```json
{
  "_id": ObjectId("6720def456abc789..."),
  "userId": ObjectId("6720abc123def456..."),
  "date": ISODate("2025-10-29T00:00:00.000Z"),
  "timezone": "Asia/Dhaka",
  "entries": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "category": "ISP Client",
      "dateTime": ISODate("2025-10-29T08:30:00.000Z"),
      "clientVendor": "ABC Corporation",
      "cause": "Fiber cut on main link",
      "downtime": "2 hours",
      "type": "Complain",
      "remarks": "Resolved by rerouting traffic",
      "emailId": "AAMkAGI1...",
      "isManuallyAdded": false,
      "isEdited": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "category": "Backhaul",
      "dateTime": ISODate("2025-10-29T10:15:00.000Z"),
      "clientVendor": "Core Network",
      "cause": "Scheduled maintenance",
      "downtime": "30 minutes",
      "type": "Service",
      "remarks": "Router firmware upgrade",
      "isManuallyAdded": false,
      "isEdited": false
    }
  ],
  "statistics": {
    "totalServices": 5,
    "totalNewComplaints": 12,
    "recurringComplaints": 3,
    "complaintsUnresolved": 10,
    "complaintsResolved": 2
  },
  "createdAt": ISODate("2025-10-29T10:00:00.000Z"),
  "updatedAt": ISODate("2025-10-29T11:30:00.000Z"),
  "lastModifiedBy": "john.doe@example.com"
}
```

#### Indexes

```javascript
// Compound index for user reports by date
db.reports.createIndex({ userId: 1, date: -1 })

// Index on email IDs in entries (for deduplication)
db.reports.createIndex({ "entries.emailId": 1 })

// Index on creation date (for listings)
db.reports.createIndex({ createdAt: -1 })
```

#### Field Details

**Report Level:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Primary key |
| userId | ObjectId | Yes | Foreign key to users |
| date | Date | Yes | Report date (midnight GMT+6) |
| timezone | String | Yes | Timezone identifier |
| entries | Array | Yes | Array of entry objects |
| statistics | Object | Yes | Calculated metrics |
| createdAt | Date | Yes | Creation timestamp |
| updatedAt | Date | Yes | Last update timestamp |
| lastModifiedBy | String | No | Email of last editor |

**Entry Level:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (UUID) | Yes | Unique entry identifier |
| category | String (enum) | Yes | One of 5 categories |
| dateTime | Date | Yes | Incident timestamp |
| clientVendor | String | Yes | Client/vendor name |
| cause | String | Yes | Incident description |
| downtime | String | Yes | Duration string |
| type | String (enum) | Yes | "Service" or "Complain" |
| remarks | String | Yes | Additional notes |
| emailId | String | No | Source email ID |
| isManuallyAdded | Boolean | Yes | Manually created |
| isEdited | Boolean | Yes | Modified after creation |

**Statistics:**

| Field | Type | Description |
|-------|------|-------------|
| totalServices | Number | Count where type = "Service" |
| totalNewComplaints | Number | New complaints (non-recurring) |
| recurringComplaints | Number | From repeat clients |
| complaintsUnresolved | Number | Open complaints |
| complaintsResolved | Number | Closed complaints |

#### Operations

**Create Report:**
```javascript
db.reports.insertOne({
  userId: ObjectId("..."),
  date: ISODate("2025-10-29T00:00:00.000Z"),
  timezone: "Asia/Dhaka",
  entries: [ /* ... */ ],
  statistics: { /* ... */ },
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Find User's Reports:**
```javascript
db.reports.find({ userId: ObjectId("...") })
  .sort({ date: -1 })
  .limit(50)
```

**Find Report by ID:**
```javascript
db.reports.findOne({ 
  _id: ObjectId("..."),
  userId: ObjectId("...")  // Ensure user owns report
})
```

**Update Report (Auto-save):**
```javascript
db.reports.updateOne(
  { _id: ObjectId("...") },
  {
    $set: {
      entries: [ /* updated entries */ ],
      statistics: { /* recalculated stats */ },
      updatedAt: new Date(),
      lastModifiedBy: "user@example.com"
    }
  }
)
```

**Delete Report:**
```javascript
db.reports.deleteOne({ 
  _id: ObjectId("..."),
  userId: ObjectId("...")
})
```

---

### 3. email_cache

Caches fetched emails from Microsoft Graph API to reduce API calls and improve performance.

#### Schema

```typescript
interface EmailCacheDocument {
  _id: ObjectId;                    // MongoDB ObjectId
  userId: ObjectId;                 // Reference to users._id
  emailId: string;                  // Microsoft Graph email ID (unique per user)
  subject: string;                  // Email subject line
  from: string;                     // Sender email address
  body: string;                     // Email body content
  receivedDateTime: Date;           // Email received timestamp
  hasAttachments: boolean;          // Has attachments flag
  createdAt: Date;                  // Cache entry creation
}
```

#### Example Document

```json
{
  "_id": ObjectId("6720ghi789jkl012..."),
  "userId": ObjectId("6720abc123def456..."),
  "emailId": "AAMkAGI1AAAA=",
  "subject": "Service Down - ABC Corp",
  "from": "noc@provider.com",
  "body": "We are experiencing service issues with ABC Corp...",
  "receivedDateTime": ISODate("2025-10-29T08:30:00.000Z"),
  "hasAttachments": false,
  "createdAt": ISODate("2025-10-29T10:00:00.000Z")
}
```

#### Indexes

```javascript
// Compound unique index for user + email ID
db.email_cache.createIndex(
  { userId: 1, emailId: 1 }, 
  { unique: true }
)

// Index for date range queries
db.email_cache.createIndex({ 
  userId: 1, 
  receivedDateTime: -1 
})

// TTL index for automatic cleanup (30 days)
db.email_cache.createIndex(
  { createdAt: 1 }, 
  { expireAfterSeconds: 2592000 }  // 30 days in seconds
)
```

#### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Primary key |
| userId | ObjectId | Yes | Foreign key to users |
| emailId | String | Yes | Microsoft Graph email ID |
| subject | String | Yes | Email subject |
| from | String | Yes | Sender email |
| body | String | Yes | Email body (plain text) |
| receivedDateTime | Date | Yes | When email was received |
| hasAttachments | Boolean | Yes | Attachment flag |
| createdAt | Date | Yes | Cache timestamp (for TTL) |

#### Operations

**Create Cache Entry:**
```javascript
db.email_cache.insertOne({
  userId: ObjectId("..."),
  emailId: "AAMkAGI1AAAA=",
  subject: "...",
  from: "...",
  body: "...",
  receivedDateTime: ISODate("..."),
  hasAttachments: false,
  createdAt: new Date()
})
```

**Find by Email ID:**
```javascript
db.email_cache.findOne({
  userId: ObjectId("..."),
  emailId: "AAMkAGI1AAAA="
})
```

**Find by Date Range:**
```javascript
db.email_cache.find({
  userId: ObjectId("..."),
  receivedDateTime: {
    $gte: ISODate("2025-10-29T00:00:00.000Z"),
    $lt: ISODate("2025-10-30T00:00:00.000Z")
  }
}).sort({ receivedDateTime: -1 })
```

**Bulk Insert (Ignore Duplicates):**
```javascript
// Insert many, skip duplicates (code handles E11000 errors)
for (const email of emails) {
  try {
    await db.email_cache.insertOne(email)
  } catch (err) {
    if (err.code !== 11000) throw err
    // Ignore duplicate key errors
  }
}
```

#### TTL (Time To Live)

The `email_cache` collection uses MongoDB's TTL feature to automatically delete old entries.

**Configuration:**
- **TTL Duration:** 2,592,000 seconds (30 days)
- **TTL Field:** `createdAt`
- **Cleanup:** MongoDB runs TTL cleanup every 60 seconds

**Behavior:**
- Emails cached > 30 days ago are automatically deleted
- Reduces database size
- Forces fresh fetch from Microsoft Graph API for old dates

---

## Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
│                 │
│ _id (PK)        │◄─────────┐
│ email (unique)  │          │
│ microsoftId     │          │
│ tokens...       │          │
└─────────────────┘          │
                             │
                             │ userId (FK)
                             │
┌─────────────────┐          │
│    reports      │          │
│                 │          │
│ _id (PK)        │          │
│ userId (FK)     │──────────┤
│ date            │          │
│ entries []      │          │
│ statistics {}   │          │
└─────────────────┘          │
                             │
                             │
┌─────────────────┐          │
│  email_cache    │          │
│                 │          │
│ _id (PK)        │          │
│ userId (FK)     │──────────┘
│ emailId (unique)│
│ subject         │
│ body            │
└─────────────────┘
```

### Foreign Key Constraints

MongoDB doesn't enforce foreign key constraints. Application code must ensure referential integrity.

**Ensuring Integrity:**

```typescript
// When deleting user, also delete related data
async function deleteUser(userId: ObjectId) {
  await db.collection('users').deleteOne({ _id: userId })
  await db.collection('reports').deleteMany({ userId })
  await db.collection('email_cache').deleteMany({ userId })
}
```

---

## Data Size Estimates

### Storage Calculations

**Average Document Sizes:**
- `users`: ~1 KB per user
- `reports`: ~50 KB per report (assuming 100 entries)
- `email_cache`: ~2 KB per email

**Example Calculations:**

**Scenario:** 10 users, daily reports, 30-day cache

```
Users:        10 users × 1 KB                    = 10 KB
Reports:      10 users × 365 reports × 50 KB     = 182.5 MB/year
Email Cache:  10 users × 500 emails × 2 KB       = 10 MB (30-day rolling)

Total (1 year): ~200 MB
```

**Scenario:** 100 users, daily reports, 30-day cache

```
Users:        100 users × 1 KB                   = 100 KB
Reports:      100 users × 365 reports × 50 KB    = 1.83 GB/year
Email Cache:  100 users × 500 emails × 2 KB      = 100 MB (30-day rolling)

Total (1 year): ~2 GB
```

### Indexes Overhead

MongoDB indexes add ~10-20% overhead:
- Estimated index size: 20-40 MB per GB of data

### Growth Rate

- **Daily:** ~150 KB per active user
- **Monthly:** ~4.5 MB per active user
- **Yearly:** ~55 MB per active user

---

## Backup & Restore

### Backup Commands

**Full Database:**
```bash
mongodump --uri="mongodb://localhost:27017/noc-reports" --out=/backups/backup_$(date +%Y%m%d)
```

**Specific Collection:**
```bash
mongodump --uri="mongodb://localhost:27017/noc-reports" --collection=reports --out=/backups/reports_backup
```

**Compressed Backup:**
```bash
mongodump --uri="mongodb://localhost:27017/noc-reports" --gzip --out=/backups/backup_$(date +%Y%m%d)
```

### Restore Commands

**Full Database:**
```bash
mongorestore --uri="mongodb://localhost:27017/noc-reports" /backups/backup_20251029/noc-reports/
```

**Specific Collection:**
```bash
mongorestore --uri="mongodb://localhost:27017/noc-reports" --collection=reports /backups/reports_backup/noc-reports/reports.bson
```

---

## Maintenance

### Regular Maintenance Tasks

**1. Index Maintenance:**
```javascript
// Rebuild indexes (during low-traffic period)
db.users.reIndex()
db.reports.reIndex()
db.email_cache.reIndex()
```

**2. Check Collection Stats:**
```javascript
db.users.stats()
db.reports.stats()
db.email_cache.stats()
```

**3. Compact Collections:**
```javascript
// Reclaim disk space (requires downtime)
db.runCommand({ compact: 'reports' })
```

**4. Monitor Slow Queries:**
```javascript
// Enable profiling
db.setProfilingLevel(1, { slowms: 100 })

// Check slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 })
```

---

## Security

### Access Control

**Create Application User:**
```javascript
use noc-reports
db.createUser({
  user: "nocapp",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "noc-reports" }
  ]
})
```

### Encryption

**At-Rest Encryption:**
- Use MongoDB Enterprise or MongoDB Atlas with encryption enabled
- Or use disk-level encryption (LUKS, dm-crypt)

**In-Transit Encryption:**
- Always use TLS/SSL for MongoDB connections
- Connection string: `mongodb://...?ssl=true`

**Application-Level Encryption:**
- User tokens encrypted with AES-256-GCM before storage
- Encryption key stored in environment variable

---

## Performance Optimization

### Query Optimization

**Use Indexes:**
```javascript
// Good: Uses index
db.reports.find({ userId: ObjectId("...") }).sort({ date: -1 })

// Bad: No index, full collection scan
db.reports.find({ "entries.cause": /fiber cut/i })
```

**Projection (Select Specific Fields):**
```javascript
// Return only needed fields
db.reports.find(
  { userId: ObjectId("...") },
  { date: 1, statistics: 1, entriesCount: { $size: "$entries" } }
)
```

**Pagination:**
```javascript
// Efficient pagination
db.reports.find({ userId: ObjectId("...") })
  .sort({ date: -1 })
  .skip(offset)
  .limit(limit)
```

### Connection Pooling

**Recommended Settings:**
```javascript
const options = {
  maxPoolSize: 10,      // Max connections
  minPoolSize: 2,       // Min connections
  maxIdleTimeMS: 30000, // Close idle connections after 30s
}
```

---

## Migration Scripts

### Adding New Field

```javascript
// Add new field to all reports
db.reports.updateMany(
  { newField: { $exists: false } },
  { $set: { newField: "default value" } }
)
```

### Renaming Field

```javascript
// Rename field in all documents
db.reports.updateMany(
  {},
  { $rename: { "oldFieldName": "newFieldName" } }
)
```

### Data Type Change

```javascript
// Convert string to number
db.reports.find({ "statistics.totalServices": { $type: "string" } }).forEach(doc => {
  db.reports.updateOne(
    { _id: doc._id },
    { $set: { "statistics.totalServices": parseInt(doc.statistics.totalServices) } }
  )
})
```

---

## Monitoring Queries

### Database Size

```javascript
// Database stats
db.stats(1024*1024)  // Size in MB

// Collection sizes
db.users.stats(1024*1024).size
db.reports.stats(1024*1024).size
db.email_cache.stats(1024*1024).size
```

### Active Connections

```javascript
db.serverStatus().connections
```

### Current Operations

```javascript
// Show operations running > 5 seconds
db.currentOp({ "secs_running": { "$gt": 5 } })
```

---

## Troubleshooting

### Check Index Usage

```javascript
db.reports.aggregate([{ $indexStats: {} }])
```

### Find Missing Indexes

```javascript
// If query is slow, explain it
db.reports.find({ userId: ObjectId("...") }).explain("executionStats")

// Look for:
// - executionTimeMillis > 100 (slow)
// - COLLSCAN (no index used)
```

---

**Last Updated:** October 29, 2025  
**Schema Version:** 1.0.0

