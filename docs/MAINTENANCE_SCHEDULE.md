# Maintenance Schedule

## Overview

This document outlines the maintenance schedule and procedures for the NOC Email Report Generator.

---

## Daily Maintenance

### Morning Check (9:00 AM GMT+6)

**Duration:** 10-15 minutes

- [ ] Check application status (uptime monitoring)
- [ ] Review overnight error logs
- [ ] Verify backup completion
- [ ] Check system resources (CPU, memory, disk)
- [ ] Monitor active users
- [ ] Review support tickets

**Commands:**
```bash
# Check application status
pm2 status noc-app

# View recent logs
pm2 logs noc-app --lines 50

# Check system resources
htop
df -h

# Check MongoDB status
mongosh --eval "db.serverStatus()"
```

### Evening Check (5:00 PM GMT+6)

**Duration:** 10 minutes

- [ ] Review day's error rate
- [ ] Check performance metrics
- [ ] Verify all support tickets addressed
- [ ] Review user feedback
- [ ] Check scheduled tasks completed

---

## Weekly Maintenance

### Monday Morning (10:00 AM GMT+6)

**Duration:** 30-45 minutes

#### System Health Check
- [ ] Review error trends (past week)
- [ ] Analyze slow queries
- [ ] Check disk usage trends
- [ ] Review API rate limits usage
- [ ] Test backup restoration (monthly rotation)

#### Database Maintenance
```bash
# Check collection stats
mongosh noc-reports --eval "
  db.users.stats();
  db.reports.stats();
  db.email_cache.stats();
"

# Review slow queries
mongosh noc-reports --eval "
  db.system.profile.find({millis:{$gt:100}}).sort({ts:-1}).limit(10);
"

# Check index usage
mongosh noc-reports --eval "
  db.reports.aggregate([{$indexStats:{}}]);
"
```

#### Security Updates
```bash
# Check for security vulnerabilities
npm audit

# Update dependencies (if safe)
npm update

# Review environment variables
cat .env.local | grep -v "SECRET\|KEY\|PASSWORD"
```

---

## Monthly Maintenance

### First Sunday of Month (2:00 AM GMT+6)

**Duration:** 2-3 hours  
**Downtime:** Expected (announce in advance)

#### Application Updates
- [ ] Review release notes for dependencies
- [ ] Update Next.js (if new stable version)
- [ ] Update all npm packages
- [ ] Run full test suite
- [ ] Build and deploy

```bash
# Check outdated packages
npm outdated

# Update packages
npm update

# Run tests
npm test
npm run type-check
npm run lint

# Build
npm run build

# Deploy
# Follow deployment guide
```

#### Database Optimization
- [ ] Reindex collections
- [ ] Compact collections
- [ ] Archive old data (if policy exists)
- [ ] Analyze query performance

```javascript
// Reindex
use noc-reports
db.users.reIndex();
db.reports.reIndex();
db.email_cache.reIndex();

// Compact (requires downtime)
db.runCommand({compact: 'reports'});
db.runCommand({compact: 'email_cache'});

// Remove old cache (> 30 days handled by TTL)
db.email_cache.countDocuments();
```

#### Security Audit
- [ ] Review access logs
- [ ] Rotate secrets (quarterly)
- [ ] Review user permissions
- [ ] Check SSL certificate expiry
- [ ] Update firewall rules (if needed)

```bash
# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Review Nginx logs for suspicious activity
sudo tail -1000 /var/log/nginx/noc-app-access.log | grep -E "401|403|404"

# Review failed login attempts
mongosh noc-reports --eval "
  db.users.find({lastLogin:{$lt:new Date(Date.now()-30*24*60*60*1000)}});
"
```

#### Backup Verification
- [ ] Test restore from latest backup
- [ ] Verify backup integrity
- [ ] Check backup storage space
- [ ] Archive old backups

```bash
# Test restore (use test database)
mongorestore --uri="mongodb://localhost:27017/noc-reports-test" /backups/latest/

# Verify backup size
du -sh /backups/latest/

# Archive old backups
find /backups/ -name "backup_*.tar.gz" -mtime +90 -exec mv {} /backups/archive/ \;
```

---

## Quarterly Maintenance

### End of Quarter (Saturday, 2:00 AM GMT+6)

**Duration:** 4-6 hours  
**Downtime:** Expected (announce 1 week in advance)

#### Major Updates
- [ ] Review and plan major version updates
- [ ] Update to latest LTS versions
- [ ] Database migration (if schema changes)
- [ ] Infrastructure updates

#### Performance Optimization
- [ ] Analyze 3-month performance data
- [ ] Optimize slow queries
- [ ] Review caching strategies
- [ ] Optimize bundle sizes
- [ ] Review and optimize images/assets

#### Capacity Planning
- [ ] Review growth trends
- [ ] Analyze resource usage
- [ ] Plan infrastructure scaling
- [ ] Estimate costs for next quarter

#### Comprehensive Security Review
- [ ] Full penetration testing
- [ ] Dependency vulnerability scan
- [ ] Access control audit
- [ ] Secret rotation
- [ ] SSL/TLS configuration review

---

## Annual Maintenance

### End of Year (Last Saturday of December)

**Duration:** 1 day  
**Downtime:** 4-6 hours  
**Announce:** 1 month in advance

#### Major Platform Updates
- [ ] Update to latest stable Next.js version
- [ ] Update to latest Node.js LTS
- [ ] Update MongoDB (if new stable version)
- [ ] Review and update all major dependencies

#### Data Management
- [ ] Archive reports older than 1 year (if policy)
- [ ] Clean up test/staging data
- [ ] Optimize database schema
- [ ] Review data retention policies

#### Infrastructure Review
- [ ] Review hosting costs
- [ ] Optimize infrastructure
- [ ] Plan for next year's growth
- [ ] Budget allocation

#### Documentation Update
- [ ] Update all documentation
- [ ] Review and update user guides
- [ ] Update API documentation
- [ ] Update troubleshooting guides
- [ ] Review and update this maintenance schedule

---

## Emergency Maintenance

### Triggers
- Critical security vulnerability
- Data loss risk
- System outage
- Performance degradation

### Procedure

1. **Assess Severity**
   - Critical: Immediate action
   - High: Within 4 hours
   - Medium: Within 24 hours

2. **Communication**
   - Notify team
   - Notify users (if downtime)
   - Post status updates

3. **Execute Fix**
   - Follow runbook
   - Document actions
   - Test thoroughly

4. **Post-Incident**
   - Document incident
   - Update runbooks
   - Conduct review
   - Implement preventive measures

---

## Maintenance Windows

### Preferred Windows
- **Daily**: Before 9 AM or after 6 PM GMT+6
- **Weekly**: Monday 10 AM - 11 AM GMT+6
- **Monthly**: First Sunday 2 AM - 5 AM GMT+6
- **Quarterly**: Saturday 2 AM - 8 AM GMT+6

### Announcement Requirements

| Impact | Notice Required | Channels |
|--------|----------------|----------|
| No downtime | Day before | Slack |
| < 15 min | 3 days | Slack + Email |
| 15-60 min | 1 week | Slack + Email + In-app |
| > 60 min | 2 weeks | All channels + Meeting |

---

## Maintenance Checklist Templates

### Pre-Maintenance
```
- [ ] Maintenance window scheduled
- [ ] Users notified
- [ ] Team briefed
- [ ] Backups verified
- [ ] Rollback plan ready
- [ ] Monitoring dashboards open
- [ ] Emergency contacts verified
```

### During Maintenance
```
- [ ] Application stopped (if needed)
- [ ] Backup created
- [ ] Updates applied
- [ ] Tests run
- [ ] Application restarted
- [ ] Smoke tests passed
- [ ] Monitoring normal
```

### Post-Maintenance
```
- [ ] Application stable
- [ ] All features working
- [ ] Performance normal
- [ ] Error rate normal
- [ ] Users notified (completion)
- [ ] Documentation updated
- [ ] Lessons learned documented
```

---

## Monitoring During Maintenance

### Key Metrics to Watch

**Application:**
- Response times
- Error rates
- Memory usage
- CPU usage

**Database:**
- Query times
- Connection count
- Lock waits
- Replication lag (if applicable)

**User Impact:**
- Active sessions
- Failed requests
- Support tickets

---

## Rollback Procedures

### When to Rollback
- Critical bugs introduced
- Performance degradation > 50%
- Data integrity issues
- Security concerns
- User-blocking issues

### Rollback Steps
```bash
# 1. Stop application
pm2 stop noc-app

# 2. Restore previous version
git checkout <previous-commit>
npm install
npm run build

# 3. Restore database (if schema changed)
mongorestore --drop /backups/pre-maintenance/

# 4. Start application
pm2 start noc-app

# 5. Verify
curl https://your-domain.com/api/health

# 6. Notify team and users
```

---

## Maintenance Log Template

```
Date: YYYY-MM-DD
Time: HH:MM - HH:MM GMT+6
Type: Daily / Weekly / Monthly / Quarterly / Emergency
Downtime: Yes / No (Duration)
Performed by: [Name]

Tasks Completed:
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

Issues Encountered:
- Issue 1: [Description] - [Resolution]

Tests Performed:
- [ ] Smoke tests
- [ ] Performance tests
- [ ] Security checks

Results:
- Application Status: Normal / Issues
- Performance: Normal / Degraded / Improved
- Error Rate: Normal / Elevated
- User Impact: None / Minimal / Significant

Notes:
[Additional notes]

Next Scheduled Maintenance:
[Date and Type]
```

---

## Contact Information

**Primary Contact:** [Name, Email, Phone]  
**Backup Contact:** [Name, Email, Phone]  
**Emergency Contact:** [Name, Email, Phone]  
**Database Admin:** [Name, Email, Phone]  
**Infrastructure:** [Name, Email, Phone]

---

## Tools & Scripts

**Monitoring:**
- Uptime: [Tool/URL]
- Performance: [Tool/URL]
- Logs: [Tool/URL]

**Maintenance Scripts:**
```
scripts/
├── daily-health-check.sh
├── weekly-maintenance.sh
├── monthly-optimization.sh
├── backup-verify.sh
└── rollback.sh
```

---

**Last Updated:** October 29, 2025  
**Version:** 1.0.0  
**Next Review:** January 2026

