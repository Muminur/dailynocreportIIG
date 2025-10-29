# API Documentation

## Overview

The NOC Email Report Generator exposes several API endpoints for authentication, email fetching, report management, and export functionality. All endpoints are built with Next.js API Routes.

**Base URL:** `https://your-domain.com/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Email APIs](#email-apis)
3. [Report APIs](#report-apis)
4. [Export APIs](#export-apis)
5. [Database APIs](#database-apis)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## Authentication

### Microsoft OAuth Flow

The application uses NextAuth.js v5 with Microsoft Azure AD provider.

#### Sign In

**Endpoint:** `GET /api/auth/signin`

**Description:** Initiates Microsoft OAuth 2.0 authentication flow.

**Request:**
```http
GET /api/auth/signin HTTP/1.1
Host: your-domain.com
```

**Response:**
Redirects to Microsoft login page.

---

#### Callback

**Endpoint:** `GET /api/auth/callback/microsoft`

**Description:** OAuth callback endpoint. Handles the authorization code exchange.

**Request:**
```http
GET /api/auth/callback/microsoft?code=...&state=... HTTP/1.1
Host: your-domain.com
```

**Response:**
Redirects to dashboard with session cookie.

---

#### Sign Out

**Endpoint:** `GET /api/auth/signout`

**Description:** Terminates user session.

**Request:**
```http
GET /api/auth/signout HTTP/1.1
Host: your-domain.com
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "url": "/"
}
```

---

#### Session

**Endpoint:** `GET /api/auth/session`

**Description:** Retrieves current session information.

**Request:**
```http
GET /api/auth/session HTTP/1.1
Host: your-domain.com
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "user": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "image": null
  },
  "expires": "2025-10-30T12:00:00.000Z",
  "accessToken": "eyJhbG..."
}
```

**Response (Not Authenticated):**
```json
{}
```

---

## Email APIs

### Fetch Emails

**Endpoint:** `POST /api/emails/fetch`

**Description:** Fetches emails from Microsoft Outlook for a specific date.

**Authentication:** Required

**Request:**
```http
POST /api/emails/fetch HTTP/1.1
Host: your-domain.com
Cookie: next-auth.session-token=...
Content-Type: application/json

{
  "date": "2025-10-29"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | string | Yes | Date in YYYY-MM-DD format (GMT+6) |

**Response:**
```json
{
  "success": true,
  "emails": [
    {
      "id": "AAMkAGI...",
      "subject": "Service Down - Client ABC",
      "from": "noc@example.com",
      "receivedDateTime": "2025-10-29T08:30:00Z",
      "body": "Client ABC experiencing service issues...",
      "hasAttachments": false
    }
  ],
  "count": 42,
  "fromCache": false
}
```

**Error Response:**
```json
{
  "error": "Authentication required",
  "message": "Please sign in to fetch emails"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid date format
- `401` - Not authenticated
- `429` - Rate limit exceeded
- `500` - Server error

---

## Report APIs

### Generate Report

**Endpoint:** `POST /api/reports/generate`

**Description:** Generates a NOC report from fetched emails.

**Authentication:** Required

**Request:**
```http
POST /api/reports/generate HTTP/1.1
Host: your-domain.com
Cookie: next-auth.session-token=...
Content-Type: application/json

{
  "date": "2025-10-29",
  "emails": [ /* array of email objects */ ],
  "timezone": "Asia/Dhaka"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | string | Yes | Report date (YYYY-MM-DD) |
| emails | array | Yes | Array of email objects |
| timezone | string | No | Timezone (default: Asia/Dhaka) |

**Response:**
```json
{
  "success": true,
  "reportId": "6720abc123def456...",
  "report": {
    "_id": "6720abc123def456...",
    "userId": "6720...",
    "date": "2025-10-29T00:00:00.000Z",
    "timezone": "Asia/Dhaka",
    "entries": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "category": "ISP Client",
        "dateTime": "2025-10-29T08:30:00.000Z",
        "clientVendor": "ABC Corporation",
        "cause": "Fiber cut on main link",
        "downtime": "2 hours",
        "type": "Complain",
        "remarks": "Resolved by rerouting",
        "emailId": "AAMkAGI...",
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
    "createdAt": "2025-10-29T10:00:00.000Z",
    "updatedAt": "2025-10-29T10:00:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `401` - Not authenticated
- `500` - Server error

---

### Get Report

**Endpoint:** `GET /api/reports/[id]`

**Description:** Retrieves a specific report by ID.

**Authentication:** Required

**Request:**
```http
GET /api/reports/6720abc123def456 HTTP/1.1
Host: your-domain.com
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "success": true,
  "report": {
    "_id": "6720abc123def456...",
    "userId": "6720...",
    "date": "2025-10-29T00:00:00.000Z",
    "entries": [ /* ... */ ],
    "statistics": { /* ... */ },
    "createdAt": "2025-10-29T10:00:00.000Z",
    "updatedAt": "2025-10-29T10:15:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "error": "Not found",
  "message": "Report not found or you don't have access"
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `403` - Forbidden (not your report)
- `404` - Report not found
- `500` - Server error

---

### Update Report

**Endpoint:** `PATCH /api/reports/[id]`

**Description:** Updates an existing report (used by auto-save).

**Authentication:** Required

**Request:**
```http
PATCH /api/reports/6720abc123def456 HTTP/1.1
Host: your-domain.com
Cookie: next-auth.session-token=...
Content-Type: application/json

{
  "entries": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "category": "ISP Client",
      "dateTime": "2025-10-29T08:30:00.000Z",
      "clientVendor": "ABC Corporation - Updated",
      "cause": "Fiber cut on main link",
      "downtime": "2 hours",
      "type": "Complain",
      "remarks": "Resolved by rerouting. Issue closed.",
      "isEdited": true
    }
  ],
  "statistics": {
    "totalServices": 5,
    "totalNewComplaints": 12,
    "recurringComplaints": 3,
    "complaintsUnresolved": 9,
    "complaintsResolved": 3
  }
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| entries | array | No | Updated report entries |
| statistics | object | No | Updated statistics |

**Response:**
```json
{
  "success": true,
  "report": { /* updated report */ },
  "message": "Report updated successfully"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `401` - Not authenticated
- `403` - Forbidden
- `404` - Report not found
- `500` - Server error

---

### List Reports

**Endpoint:** `GET /api/reports/list`

**Description:** Retrieves all reports for the authenticated user.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Number of reports to return (default: 50) |
| offset | number | No | Pagination offset (default: 0) |
| sort | string | No | Sort field (default: "date") |
| order | string | No | Sort order: "asc" or "desc" (default: "desc") |

**Request:**
```http
GET /api/reports/list?limit=10&sort=date&order=desc HTTP/1.1
Host: your-domain.com
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "success": true,
  "reports": [
    {
      "_id": "6720abc...",
      "date": "2025-10-29T00:00:00.000Z",
      "statistics": {
        "totalServices": 5,
        "totalNewComplaints": 12,
        "recurringComplaints": 3,
        "complaintsUnresolved": 10,
        "complaintsResolved": 2
      },
      "createdAt": "2025-10-29T10:00:00.000Z",
      "entriesCount": 17
    }
  ],
  "count": 1,
  "total": 15
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `500` - Server error

---

## Export APIs

### Export Report

**Endpoint:** `GET /api/reports/[id]/export?format=xlsx|pdf`

**Description:** Exports a report in XLSX or PDF format.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| format | string | Yes | Export format: "xlsx" or "pdf" |

**Request:**
```http
GET /api/reports/6720abc123def456/export?format=xlsx HTTP/1.1
Host: your-domain.com
Cookie: next-auth.session-token=...
```

**Response:**
Binary file download with appropriate MIME type.

**Response Headers:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="NOC_Report_2025-10-29.xlsx"
```

**For PDF:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="NOC_Report_2025-10-29.pdf"
```

**Error Response:**
```json
{
  "error": "Invalid format",
  "message": "Format must be 'xlsx' or 'pdf'"
}
```

**Status Codes:**
- `200` - Success (binary file)
- `400` - Invalid format
- `401` - Not authenticated
- `403` - Forbidden
- `404` - Report not found
- `500` - Export generation failed

---

## Database APIs

### Initialize Database

**Endpoint:** `POST /api/db/init`

**Description:** Initializes database indexes and collections.

**Authentication:** None (Development only)

**Environment:** Development/Staging only

**Request:**
```http
POST /api/db/init HTTP/1.1
Host: localhost:3000
```

**Response:**
```json
{
  "success": true,
  "message": "Database initialized successfully",
  "indexes": [
    "users.email",
    "users.microsoftId",
    "reports.userId_date",
    "email_cache.userId_emailId",
    "email_cache.createdAt_ttl"
  ]
}
```

**Status Codes:**
- `200` - Success
- `403` - Forbidden (production environment)
- `500` - Server error

---

### Test Database Connection

**Endpoint:** `GET /api/db/test`

**Description:** Tests MongoDB connection.

**Authentication:** None (Development only)

**Environment:** Development/Staging only

**Request:**
```http
GET /api/db/test HTTP/1.1
Host: localhost:3000
```

**Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "database": "noc-reports",
  "collections": ["users", "reports", "email_cache"],
  "stats": {
    "dataSize": 1048576,
    "indexes": 10
  }
}
```

**Status Codes:**
- `200` - Success
- `403` - Forbidden (production environment)
- `500` - Connection failed

---

## Error Handling

### Error Response Format

All API errors follow this consistent format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": { /* Optional additional details */ },
  "statusCode": 400
}
```

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Validation Errors

When request validation fails (Zod schema):

```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": {
    "issues": [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": ["date"],
        "message": "Expected string, received number"
      }
    ]
  },
  "statusCode": 400
}
```

---

## Rate Limiting

### Microsoft Graph API

**Limits:**
- 100,000 requests per 10 minutes per application
- Handles: Automatic retry with exponential backoff
- Response Headers:
  ```
  Retry-After: 60
  ```

**Application Handling:**
- Retry up to 3 times
- Exponential backoff: 1s, 2s, 4s
- Returns 429 if all retries fail

### Internal API Rate Limits

**Current Limits:**
- `/api/emails/fetch`: 10 requests per minute per user
- `/api/reports/generate`: 5 requests per minute per user
- `/api/reports/[id]` (PATCH): 30 requests per minute per user
- `/api/reports/[id]/export`: 10 requests per minute per user

**Implementation:** Debouncing and client-side throttling

**Future:** Redis-based rate limiting planned

---

## Data Models

### Report Entry

```typescript
interface ReportEntry {
  id: string;                    // UUID
  category: 'Backhaul' | 'Upstreams' | 'IPT Client' | 'ISP Client' | 'Uncategorized';
  dateTime: Date;                // ISO 8601 string
  clientVendor: string;          // Client or vendor name
  cause: string;                 // Incident cause
  downtime: string;              // Downtime duration
  type: 'Service' | 'Complain';  // Entry type
  remarks: string;               // Additional notes
  emailId?: string;              // Source email ID (optional)
  isManuallyAdded: boolean;      // User added manually
  isEdited: boolean;             // User modified
}
```

### Report

```typescript
interface Report {
  _id: string;                   // MongoDB ObjectId
  userId: string;                // User ObjectId
  date: Date;                    // Report date (ISO 8601)
  timezone: string;              // Timezone (e.g., "Asia/Dhaka")
  entries: ReportEntry[];        // Array of entries
  statistics: Statistics;        // Calculated statistics
  createdAt: Date;               // ISO 8601 string
  updatedAt: Date;               // ISO 8601 string
  lastModifiedBy?: string;       // User email
}
```

### Statistics

```typescript
interface Statistics {
  totalServices: number;         // Count of "Service" entries
  totalNewComplaints: number;    // New complaints
  recurringComplaints: number;   // Complaints from repeat clients
  complaintsUnresolved: number;  // Open complaints
  complaintsResolved: number;    // Closed complaints
}
```

### Email Object

```typescript
interface Email {
  id: string;                    // Microsoft Graph email ID
  subject: string;               // Email subject
  from: string;                  // Sender email
  receivedDateTime: Date;        // ISO 8601 string
  body: string;                  // Email body content
  hasAttachments: boolean;       // Has attachments flag
}
```

---

## Authentication Flow

### OAuth 2.0 Flow

```
1. User clicks "Sign in with Microsoft"
   → GET /api/auth/signin

2. Application redirects to Microsoft
   → https://login.microsoftonline.com/.../oauth2/v2.0/authorize
   → Params: client_id, redirect_uri, scope, response_type=code

3. User authenticates with Microsoft
   → Enters credentials
   → Grants permissions

4. Microsoft redirects back to application
   → GET /api/auth/callback/microsoft?code=...&state=...

5. Application exchanges code for token
   → POST https://login.microsoftonline.com/.../oauth2/v2.0/token
   → Receives: access_token, refresh_token, id_token

6. Application creates session
   → Stores encrypted tokens in database
   → Sets session cookie
   → Redirects to /dashboard

7. Subsequent requests include session cookie
   → Middleware validates session
   → Provides user info to API routes
```

### Token Refresh

Automatic token refresh occurs when:
- Access token expires (typically after 1 hour)
- Request to Microsoft Graph API returns 401

**Process:**
1. Detect expired token
2. Retrieve refresh token from database
3. Exchange refresh token for new access token
4. Update database with new tokens
5. Retry original request

---

## Timezone Handling

All date/time operations respect **GMT+6 (Asia/Dhaka)** timezone.

### Date Conversion

**Client sends:**
```json
{
  "date": "2025-10-29"
}
```

**Server interprets as:**
```
2025-10-29 00:00:00 GMT+6
= 2025-10-28 18:00:00 UTC
```

**Email filter applied:**
```
receivedDateTime >= 2025-10-28T18:00:00Z
AND receivedDateTime < 2025-10-29T18:00:00Z
```

### Functions Used

```typescript
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

const DHAKA_TZ = 'Asia/Dhaka';

// Convert UTC to GMT+6
const localTime = toZonedTime(utcDate, DHAKA_TZ);

// Convert GMT+6 to UTC
const utcTime = fromZonedTime(localDate, DHAKA_TZ);

// Format in GMT+6
const formatted = formatInTimeZone(date, DHAKA_TZ, 'yyyy-MM-dd HH:mm:ss');
```

---

## Webhooks & Events

**Current Status:** Not implemented

**Planned Features:**
- Webhook for new report generation
- Webhook for report updates
- Event notifications for errors

---

## API Versioning

**Current Version:** v1 (implicit, no version in URL)

**Future Versioning:** When breaking changes are introduced, API will use version prefix:
- `/api/v1/...`
- `/api/v2/...`

---

## Development & Testing

### Testing API Endpoints

**Using cURL:**

```bash
# Get session
curl -X GET http://localhost:3000/api/auth/session \
  -H "Cookie: next-auth.session-token=..."

# Fetch emails
curl -X POST http://localhost:3000/api/emails/fetch \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-29"}'

# Generate report
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json" \
  -d @report-payload.json
```

**Using Postman:**
1. Import endpoints as collection
2. Set up environment variables
3. Use cookie authentication
4. Test endpoints

---

## Performance Considerations

### Caching

**Email Cache:**
- 30-day TTL on cached emails
- Cache key: `userId + emailId`
- Reduces Microsoft Graph API calls

**Query Optimization:**
- Indexed queries for reports list
- Projection to limit returned fields
- Pagination for large datasets

### Best Practices

1. **Fetch Emails:** Cache-first strategy
2. **Report Updates:** Debounce auto-save (2 seconds)
3. **Exports:** Generate on-demand, no caching
4. **Statistics:** Calculate in-memory, no DB calls

---

## Security Considerations

### Authentication

- All API routes (except auth endpoints) require valid session
- Session validated on every request
- Tokens encrypted with AES-256-GCM
- Sessions expire after 24 hours

### Authorization

- Users can only access their own reports
- Email fetching limited to authenticated user's mailbox
- MongoDB queries include `userId` filter

### Input Validation

- All request bodies validated with Zod schemas
- SQL injection: Not applicable (MongoDB)
- XSS: Sanitized on client render
- CSRF: Protected by NextAuth

---

## Troubleshooting

### Common Issues

**Issue: 401 Unauthorized**
- **Cause:** No session or expired session
- **Solution:** Sign in again

**Issue: 429 Too Many Requests**
- **Cause:** Microsoft Graph API rate limit
- **Solution:** Wait and retry (handled automatically)

**Issue: 500 on report generation**
- **Cause:** Email parsing error or database issue
- **Solution:** Check logs, verify email format

**Issue: Export fails**
- **Cause:** Large report (500+ entries)
- **Solution:** Increase timeout, optimize export

---

## Changelog

### Version 1.0.0 (October 2025)
- Initial API release
- All endpoints functional
- Authentication, email fetching, reports, exports
- Rate limiting and error handling

---

## Support

For API support:
- Check application logs: `pm2 logs noc-app`
- Review MongoDB queries
- Test with development environment
- Contact development team

---

**Last Updated:** October 29, 2025  
**API Version:** 1.0.0

