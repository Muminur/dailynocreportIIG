# User Training Guide

## Training Program Overview

This guide provides a structured training program for new users of the NOC Email Report Generator.

---

## Training Modules

### Module 1: Introduction (15 minutes)

#### Objectives
- Understand what the system does
- Learn the benefits
- Overview of key features

#### Content
**What is the NOC Email Report Generator?**
- Automated email parsing system
- Converts emails to structured reports
- 6x faster than manual process
- 85% accurate auto-categorization

**Key Benefits:**
- Time savings (30 min → 5 min)
- Consistent report format
- Reduced errors
- Professional exports

**System Overview:**
- Web-based (no installation needed)
- Microsoft account sign-in
- Cloud-based (access anywhere)
- Auto-save (never lose work)

#### Hands-On Exercise
1. Open application URL
2. Explore landing page
3. Review feature list
4. Open documentation

---

### Module 2: Getting Started (20 minutes)

#### Objectives
- Learn to sign in
- Navigate the dashboard
- Understand the interface

#### Content
**Signing In:**
1. Click "Sign in with Microsoft"
2. Enter organizational credentials
3. Grant permissions (first time only)
4. Access dashboard

**Dashboard Overview:**
- Header (logo, profile dropdown)
- Statistics cards (if reports exist)
- Date picker for email fetching
- Reports list
- Navigation

**User Profile:**
- View your information
- Sign out option
- Session duration (24 hours)

#### Hands-On Exercise
1. Sign in to the application
2. Explore the dashboard
3. Click on profile dropdown
4. Review your information

**Common Issues:**
- Redirect loop? Check browser cookies
- Can't sign in? Contact IT for permissions
- Session expired? Sign in again

---

### Module 3: Generating Your First Report (30 minutes)

#### Objectives
- Fetch emails for a specific date
- Generate a report
- Understand the report structure

#### Content

**Step 1: Select Date**
- Use date picker
- Select yesterday or past date
- System uses GMT+6 timezone
- Click to confirm selection

**Step 2: Fetch Emails**
- Click "Fetch Emails" button
- Wait for progress (10-30 seconds typical)
- Review fetched email list
- Verify correct date range

**What's happening:**
- System queries Microsoft Graph API
- Fetches inbox + sent items
- Applies date filter (GMT+6)
- Caches for future use

**Step 3: Generate Report**
- Review fetched emails
- Click "Generate Report" button
- Wait for processing (1-2 minutes)
- Report opens in editor

**What's happening:**
- Parsing email subjects & bodies
- Extracting key information
- Auto-categorizing by keywords
- Calculating statistics
- Creating report entries

**Step 4: Review Generated Report**
- Check entry count
- Review categories
- Verify statistics
- Note any uncategorized entries

#### Hands-On Exercise
1. Select yesterday's date
2. Fetch emails
3. Count how many emails fetched
4. Generate report
5. Review the generated report

**Practice Tips:**
- Start with a date you know has emails
- Don't worry about accuracy yet
- Just get comfortable with the process
- It gets faster with practice

---

### Module 4: Editing Reports (45 minutes)

#### Objectives
- Edit report entries
- Understand auto-save
- Manage rows (add/delete/reorder)
- Interpret statistics

#### Content

**Inline Editing:**
- Click any cell to edit
- Changes save automatically
- Wait for "Saved" indicator
- 2-second auto-save delay

**Editable Fields:**

1. **Category Dropdown**
   - Backhaul
   - Upstreams
   - IPT Client
   - ISP Client
   - Uncategorized

2. **Date/Time Picker**
   - Click to open picker
   - Select date and time
   - Uses GMT+6 timezone

3. **Text Fields**
   - Client/Vendor: Client name
   - Cause: Issue description
   - Downtime: Duration string
   - Remarks: Additional notes

4. **Type Dropdown**
   - Service
   - Complain

**Row Management:**

**Add New Row:**
- Click "Add Entry" button
- New row appears at bottom
- Fill in all fields
- Auto-save kicks in

**Delete Row:**
- Click trash icon
- Confirm deletion
- Row removed immediately
- Can't undo (be careful!)

**Reorder Rows:**
- Use ↑ "Move Up" button
- Use ↓ "Move Down" button
- Rows swap positions
- Auto-save updates order

**Auto-Save Feature:**
- Saves 2 seconds after you stop typing
- Watch status indicator:
  - "Saving..." = in progress
  - "Saved" = all changes saved
  - "Error" = failed to save
- Last saved time displayed
- No manual save needed

**Statistics Panel:**
- **Total Services:** Count of Service entries
- **New Complaints:** New issues reported
- **Recurring Complaints:** Repeat clients
- **Unresolved:** Open complaints
- **Resolved:** Closed complaints

#### Hands-On Exercise

**Exercise 1: Edit a Category**
1. Find an "Uncategorized" entry
2. Click the Category dropdown
3. Select appropriate category
4. Wait for "Saved"

**Exercise 2: Add New Entry**
1. Click "Add Entry"
2. Fill in all fields:
   - Category: ISP Client
   - Date/Time: Today, 10:00 AM
   - Client: Test Client
   - Cause: Test issue
   - Downtime: 1 hour
   - Type: Complain
   - Remarks: Training exercise
3. Wait for auto-save

**Exercise 3: Delete Entry**
1. Find the entry you just added
2. Click trash icon
3. Confirm deletion

**Exercise 4: Reorder Entries**
1. Select any entry
2. Click "Move Up" or "Move Down"
3. Watch it swap positions
4. Check "Saved" status

**Practice Tips:**
- Wait for "Saved" before moving on
- Use consistent client naming
- Fill all fields completely
- Add meaningful remarks

---

### Module 5: Understanding Categories (20 minutes)

#### Objectives
- Learn what each category means
- Understand categorization keywords
- Know when to manually recategorize

#### Content

**Category Definitions:**

**1. Backhaul**
- Network backbone infrastructure
- Core network issues
- Transmission problems
- **Keywords:** backhaul, transmission, fiber cut, core, backbone, infrastructure

**2. Upstreams**
- Upstream provider issues
- ISP connectivity problems
- Bandwidth issues
- **Keywords:** upstream, isp down, provider issue, bandwidth, peering, connectivity

**3. IPT Client**
- Internet Protocol Telephony
- VoIP services
- SIP trunk issues
- **Keywords:** ipt, voip, sip, telephone, call, voice

**4. ISP Client**
- Internet Service Provider customers
- End-user internet issues
- Customer complaints
- **Keywords:** customer, client, subscriber, internet down, user, connection

**5. Uncategorized**
- System couldn't determine category
- Ambiguous emails
- **Action Required:** Manually categorize these

**Auto-Categorization:**
- Based on keywords in email
- Checks subject first, then body
- ~85% accurate
- **Always review and correct**

**Best Practices:**
1. Review all auto-categorized entries
2. Manually categorize uncategorized entries
3. Use consistent category assignment
4. When in doubt, ask supervisor

#### Hands-On Exercise
1. Review your generated report
2. Find 3 uncategorized entries
3. Read the cause/remarks
4. Assign appropriate categories
5. Verify statistics update

---

### Module 6: Exporting Reports (15 minutes)

#### Objectives
- Export XLSX reports
- Export PDF reports
- Know which format to use when

#### Content

**XLSX Export:**
- Multi-sheet Excel workbook
- Summary sheet with statistics
- All entries sheet
- Category-wise sheets
- Formatted with colors and borders
- File name: `NOC_Report_YYYY-MM-DD.xlsx`

**PDF Export:**
- Professional formatted document
- Header with date and title
- Statistics summary
- Complete data table
- Ready for printing
- File name: `NOC_Report_YYYY-MM-DD.pdf`

**How to Export:**
1. Open report in editor
2. Wait for "Saved" status
3. Click "Export as XLSX" or "Export as PDF"
4. Wait for generation (3-10 seconds)
5. File downloads automatically
6. Check downloads folder

**Which Format to Use:**

**Use XLSX When:**
- Sharing with technical teams
- Further analysis needed
- Data manipulation required
- Sharing for review/editing

**Use PDF When:**
- Formal reports
- Printing required
- Archive purposes
- Management presentations

**Both Formats:**
- For important reports
- End-of-week/month reports
- Backup purposes

#### Hands-On Exercise
1. Open your generated report
2. Verify it's saved
3. Export as XLSX
4. Open the downloaded file
5. Review all sheets
6. Export as PDF
7. Open the PDF
8. Compare both formats

---

### Module 7: Best Practices & Tips (30 minutes)

#### Objectives
- Learn efficient workflows
- Understand common pitfalls
- Master time-saving tips

#### Content

**Daily Workflow:**
```
Morning Routine (5-10 minutes):
1. Sign in
2. Select yesterday's date
3. Fetch emails
4. Generate report
5. Quick review
6. Export XLSX
7. Share with team
```

**Efficiency Tips:**

**1. Consistent Naming**
- Use same name for same client
- "ABC Corp" not "ABC", "ABC Corporation", "abc corp"
- Helps with recurring complaint detection

**2. Complete Remarks**
- Add resolution status
- Note follow-up actions
- Document workarounds
- Reference ticket numbers

**3. Review Before Export**
- Check all categories
- Verify client names
- Ensure remarks filled
- Validate statistics

**4. Daily Generation**
- Don't skip days
- Generate for previous day
- Consistent reports = better trends

**5. Cache Management**
- Re-fetch if emails missing
- Cache lasts 30 days
- Fresh fetch for recent dates

**Common Pitfalls:**

**❌ Don't:**
- Click fetch multiple times
- Close tab while "Saving..."
- Generate without reviewing
- Skip manual categorization
- Leave remarks empty
- Use inconsistent naming

**✅ Do:**
- Wait for each step to complete
- Review auto-categorizations
- Add meaningful remarks
- Use consistent naming
- Export both formats
- Backup important reports

#### Hands-On Exercise

**Complete Workflow Practice:**
1. Select a date from last week
2. Fetch emails
3. Generate report
4. Review all entries
5. Correct any miscategorizations
6. Fill in all remarks
7. Ensure consistent naming
8. Verify statistics
9. Export both XLSX and PDF
10. Time yourself!

**Target:** Complete in under 10 minutes

---

### Module 8: Troubleshooting (20 minutes)

#### Objectives
- Solve common issues
- Know when to get help
- Understand error messages

#### Content

**Common Issues:**

**Issue: Can't Sign In**
- Check internet connection
- Try incognito mode
- Clear browser cache
- Verify Microsoft credentials
- Contact IT for permissions

**Issue: Emails Not Fetching**
- Check internet connection
- Wait (might be rate limited)
- Try different date
- Sign out and back in
- Check date is not in future

**Issue: Report Not Saving**
- Check internet connection
- Wait for auto-save
- Refresh if stuck on "Saving..."
- Don't close tab prematurely

**Issue: Export Fails**
- Ensure report is saved
- Check downloads folder
- Try other format
- Check browser download permissions

**Issue: Wrong Categorization**
- Expected! ~85% accurate
- Manually correct
- Add to remarks for context
- Report persistent issues

**Error Messages:**

- **"Authentication required"** → Sign in again
- **"Failed to fetch emails"** → Check connection, retry
- **"Report not found"** → Check report ID, sign in
- **"Export generation failed"** → Try again, check logs

**Getting Help:**

**Self-Help:**
1. Check FAQ
2. Read troubleshooting guide
3. Try in different browser
4. Sign out and in

**Contact Support:**
1. Describe the issue
2. Include screenshots
3. Note error messages
4. Provide steps to reproduce

#### Hands-On Exercise
**Scenario Practice:**
1. Simulate slow connection (wait longer)
2. Try exporting immediately after editing
3. Practice error recovery
4. Navigate help documentation

---

## Training Assessment

### Knowledge Check

**Questions:**
1. How long should report generation take? (1-2 minutes)
2. What's the auto-save delay? (2 seconds)
3. Name all 5 categories (Backhaul, Upstreams, IPT Client, ISP Client, Uncategorized)
4. What timezone does the system use? (GMT+6)
5. How accurate is auto-categorization? (~85%)
6. What does "Saved" indicator mean? (All changes saved)
7. Name both export formats (XLSX, PDF)
8. How long does session last? (24 hours)
9. Where do fetched emails come from? (Inbox + Sent Items)
10. What's the recommended workflow time? (5-10 minutes)

**Practical Test:**
1. Sign in successfully
2. Fetch emails for a date
3. Generate report
4. Edit 3 entries
5. Add 1 new entry
6. Delete 1 entry
7. Reorder entries
8. Export as XLSX
9. Export as PDF
10. Complete in under 15 minutes

---

## Training Resources

**Documentation:**
- User Guide: Complete reference
- Quick Start: 5-minute guide
- FAQ: Common questions
- Troubleshooting: Problem solving

**Support:**
- Email: [support email]
- Slack: #noc-app-support
- Office hours: Mon-Fri 9-5 GMT+6
- Administrator: [contact]

**Practice Environment:**
- Use test dates
- Generate practice reports
- Experiment with features
- Can't break anything!

---

## Certification

Upon completing all modules and passing the assessment:

**Certificate of Completion**
- NOC Email Report Generator User
- Issued by: [Organization]
- Date: [Completion Date]
- Valid: Indefinitely

---

**Training Version:** 1.0  
**Last Updated:** October 29, 2025  
**Next Review:** Quarterly

