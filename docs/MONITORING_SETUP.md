# Production Monitoring Setup Guide

## Overview

This guide covers setting up comprehensive monitoring for the NOC Email Report Generator in production.

---

## 1. Application Performance Monitoring

### Option A: Vercel Analytics (For Vercel Deployment)

**Setup:**
```bash
# Already included in Vercel deployment
# Enable in Vercel dashboard > Analytics
```

**Metrics Tracked:**
- Page load times
- API response times
- Core Web Vitals
- User sessions

### Option B: New Relic

**Installation:**
```bash
npm install newrelic
```

**Configuration:**
```javascript
// newrelic.js
'use strict'
exports.config = {
  app_name: ['NOC Email Report Generator'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  }
}
```

**Environment Variable:**
```bash
NEW_RELIC_LICENSE_KEY=your-license-key
```

---

## 2. Error Tracking with Sentry

### Installation

```bash
npm install @sentry/nextjs
```

### Configuration

**Create `sentry.client.config.js`:**
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

**Create `sentry.server.config.js`:**
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

**Environment Variables:**
```bash
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

---

## 3. Uptime Monitoring

### Option A: UptimeRobot (Free)

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor:
   - **Type:** HTTPS
   - **URL:** `https://your-domain.com`
   - **Interval:** 5 minutes
   - **Alert Contacts:** Your email

### Option B: Pingdom

1. Sign up at [pingdom.com](https://www.pingdom.com)
2. Create uptime check
3. Configure alerts

### Health Check Endpoint

**Create `src/app/api/health/route.ts`:**
```typescript
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';

export async function GET() {
  try {
    // Check database connection
    await connectDB();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        application: 'running'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Service degraded'
      },
      { status: 503 }
    );
  }
}
```

---

## 4. Log Aggregation

### Option A: Vercel Logs (Built-in)

Access via Vercel dashboard:
- Real-time logs
- Searchable
- Export capability

### Option B: LogTail

**Installation:**
```bash
npm install @logtail/node @logtail/winston
```

**Configuration:**
```javascript
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.LOGTAIL_TOKEN);

export function log(level, message, data) {
  logtail[level](message, data);
}
```

---

## 5. Database Monitoring

### MongoDB Atlas Monitoring (If using Atlas)

**Built-in features:**
- Real-time performance metrics
- Query performance insights
- Slow query alerts
- Connection tracking
- Disk usage monitoring

**Enable Alerts:**
1. Go to Atlas Dashboard
2. Navigate to Alerts
3. Configure:
   - Connections > 80%
   - Disk usage > 80%
   - CPU > 80%
   - Slow queries > 100ms

### Self-Hosted MongoDB

**Create monitoring script `scripts/monitor-mongodb.js`:**
```javascript
const { MongoClient } = require('mongodb');

async function monitorMongoDB() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db();
  
  // Get server status
  const status = await db.admin().serverStatus();
  
  console.log('MongoDB Monitoring:');
  console.log('- Connections:', status.connections);
  console.log('- Operations/sec:', status.opcounters);
  console.log('- Memory:', status.mem);
  console.log('- Network:', status.network);
  
  await client.close();
}

monitorMongoDB().catch(console.error);
```

**Add to cron:**
```bash
*/5 * * * * node /path/to/monitor-mongodb.js >> /var/log/noc-app/mongodb-monitor.log 2>&1
```

---

## 6. Performance Monitoring Dashboard

### Create Custom Dashboard

**Create `scripts/metrics-dashboard.js`:**
```javascript
const express = require('express');
const { connectDB } = require('../src/lib/db/mongodb');

const app = express();

app.get('/metrics', async (req, res) => {
  try {
    const db = await connectDB();
    
    // Collect metrics
    const metrics = {
      timestamp: new Date(),
      database: {
        users: await db.collection('users').countDocuments(),
        reports: await db.collection('reports').countDocuments(),
        cacheSize: await db.collection('email_cache').countDocuments()
      },
      health: 'ok'
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(9090, () => {
  console.log('Metrics dashboard running on port 9090');
});
```

---

## 7. Alert Configuration

### Critical Alerts (Immediate Response)

**Configure alerts for:**
- Application downtime (> 1 minute)
- Error rate > 5%
- Database connection failures
- API response time > 2 seconds
- Authentication failures spike

### Warning Alerts (Review within hours)

**Configure alerts for:**
- Error rate 1-5%
- Slow queries (> 100ms)
- High memory usage (> 80%)
- Disk space < 20%
- Unusual traffic patterns

### Alert Channels

**Set up:**
- Email: team@example.com
- Slack: #noc-app-alerts
- SMS: For critical alerts only
- PagerDuty: For on-call rotation

---

## 8. Monitoring Checklist

### Daily Monitoring
- [ ] Check error logs
- [ ] Review performance metrics
- [ ] Verify backups completed
- [ ] Check uptime status
- [ ] Review user activity

### Weekly Monitoring
- [ ] Analyze slow queries
- [ ] Review error trends
- [ ] Check disk usage trends
- [ ] Analyze user behavior
- [ ] Review security logs

### Monthly Monitoring
- [ ] Performance trend analysis
- [ ] Cost optimization review
- [ ] Security audit
- [ ] Dependency updates
- [ ] Capacity planning

---

## 9. Key Performance Indicators (KPIs)

### Availability
- **Target:** 99.9% uptime
- **Measure:** Uptime monitoring service
- **Alert:** < 99.5%

### Performance
- **Target:** < 500ms API response
- **Measure:** APM tools
- **Alert:** > 1 second

### Errors
- **Target:** < 0.5% error rate
- **Measure:** Error tracking (Sentry)
- **Alert:** > 1%

### User Experience
- **Target:** < 3s page load
- **Measure:** Real User Monitoring
- **Alert:** > 5s

---

## 10. Monitoring Tools Summary

| Tool | Purpose | Cost | Setup Time |
|------|---------|------|------------|
| Vercel Analytics | Performance | Free tier | 5 min |
| Sentry | Error tracking | Free tier | 15 min |
| UptimeRobot | Uptime | Free | 5 min |
| MongoDB Atlas | Database | Included | Built-in |
| Custom Scripts | Metrics | Free | 30 min |

---

## Quick Start

**Minimum Viable Monitoring (15 minutes):**

1. Enable Vercel Analytics (if using Vercel)
2. Set up UptimeRobot for uptime monitoring
3. Create health check endpoint
4. Configure MongoDB Atlas alerts
5. Set up email alerts

**Recommended Production Setup (1 hour):**

1. Install Sentry for error tracking
2. Configure comprehensive alerts
3. Set up log aggregation
4. Create custom metrics dashboard
5. Configure all alert channels

---

**Last Updated:** October 29, 2025  
**Version:** 1.0.0

