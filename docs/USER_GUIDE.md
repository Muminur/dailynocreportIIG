# NOC Email Report Generator - User Guide

## Welcome! 👋

This guide will help you understand and use the NOC Email Report Generator efficiently. This application automates the creation of daily Network Operations Center (NOC) reports by intelligently parsing emails from your Microsoft Outlook account.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Generating Reports](#generating-reports)
4. [Editing Reports](#editing-reports)
5. [Exporting Reports](#exporting-reports)
6. [Understanding Statistics](#understanding-statistics)
7. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### First-Time Login

1. **Navigate to the Application**
   - Open your web browser
   - Go to the application URL (e.g., `https://your-noc-app.com`)

2. **Sign In with Microsoft**
   - Click the **"Sign in with Microsoft"** button
   - You'll be redirected to Microsoft's login page
   - Enter your organizational email and password
   - Grant permissions when prompted (Mail.Read, User.Read)

3. **Access Your Dashboard**
   - After successful authentication, you'll be redirected to your dashboard
   - This is your main workspace

### System Requirements

- **Browser**: Modern web browser (Chrome, Firefox, Edge, Safari)
- **Internet Connection**: Stable connection required
- **Microsoft Account**: Valid organizational Microsoft account with email access
- **Permissions**: Mail.Read and User.Read permissions granted

---

## Dashboard Overview

### Main Components

1. **Header**
   - **Logo & Title**: NOC Email Report Generator branding
   - **User Profile**: Your name and email
   - **Sign Out**: Click your profile to access sign-out option

2. **Statistics Cards** (if reports exist)
   - **Total Reports**: Number of reports you've created
   - **This Month**: Reports created in the current month
   - **Average Time**: Average time to generate a report

3. **Action Section**
   - **Date Picker**: Select date for email fetching
   - **Fetch Emails Button**: Retrieve emails for selected date
   - **Generate Report Button**: Create report from fetched emails

4. **Reports List**
   - View all your previously generated reports
   - Click on a report to view/edit it

---

## Generating Reports

### Step-by-Step Process

#### Step 1: Select Date

1. Click on the **date picker** input field
2. Select the date you want to generate a report for
   - The system uses **GMT+6 (Asia/Dhaka)** timezone
   - You can select any past date

#### Step 2: Fetch Emails

1. Click the **"Fetch Emails"** button
2. The system will:
   - Connect to Microsoft Graph API
   - Retrieve emails from your inbox and sent items
   - Filter emails for the selected date (GMT+6)
   - Display progress as it fetches

**What happens during fetch:**
- System retrieves emails from both inbox and sent items
- Emails are cached for faster future access
- Pagination handles large email volumes automatically
- Rate limiting ensures API compliance

**Expected Time:**
- Small volume (< 50 emails): 5-10 seconds
- Medium volume (50-200 emails): 10-30 seconds
- Large volume (200+ emails): 30-60 seconds

#### Step 3: Review Fetched Emails

- After fetching, you'll see a list of retrieved emails
- Each entry shows: Subject, From, Received Date/Time
- Verify that the correct emails were fetched

#### Step 4: Generate Report

1. Click the **"Generate Report"** button
2. The system will:
   - Parse each email's subject and body
   - Categorize incidents automatically:
     - **Backhaul** - Network backbone issues
     - **Upstreams** - Upstream provider issues
     - **IPT Client** - IPT customer issues
     - **ISP Client** - ISP customer issues
     - **Uncategorized** - Cannot determine category
   - Extract key information:
     - Date/Time of incident
     - Client/Vendor name
     - Cause of issue
     - Downtime duration
   - Classify as **Service** or **Complain**
   - Calculate summary statistics

**Expected Time:** 1-2 minutes for 100-500 emails

#### Step 5: View Generated Report

- You'll be redirected to the report editor page
- The report is automatically saved to the database
- You can now view, edit, and export your report

---

## Editing Reports

### Accessing the Report Editor

1. From the dashboard, click on any report in your reports list
2. Or, after generating a new report, you're automatically taken to the editor

### Editor Interface

#### Editable Table

**Columns:**
1. **Category** - Dropdown selector (Backhaul, Upstreams, IPT Client, ISP Client, Uncategorized)
2. **Date/Time** - Date and time picker
3. **Client/Vendor** - Text input for client or vendor name
4. **Cause** - Text area for cause description
5. **Downtime** - Text input for downtime duration
6. **Type** - Dropdown (Service, Complain)
7. **Remarks** - Text area for additional notes
8. **Actions** - Move up/down, delete buttons

### Editing Entries

#### Inline Editing

1. **Click any cell** to edit its content
2. **Make your changes**
3. **Click outside** the cell or press **Tab** to save
4. **Auto-save** triggers 2 seconds after you stop typing

#### Editing Different Field Types

**Dropdown Fields (Category, Type):**
- Click the field
- Select from dropdown options
- Selection is saved automatically

**Text Fields (Client/Vendor, Cause, Downtime, Remarks):**
- Click to activate editing
- Type your changes
- Press Tab or click outside to save

**Date/Time Field:**
- Click the field
- Use the date/time picker
- Select date and time
- Changes save automatically

### Managing Rows

#### Add New Row

1. Click the **"Add Entry"** button at the bottom of the table
2. A new row is added with default values
3. Fill in the details
4. Auto-save will save it

#### Delete Row

1. Click the **trash icon** in the Actions column
2. Confirm the deletion
3. Row is removed immediately
4. Auto-save updates the report

#### Reorder Rows

1. Use **↑ Move Up** and **↓ Move Down** buttons in the Actions column
2. Rows are reordered immediately
3. Auto-save updates the order

### Auto-Save Feature

**How It Works:**
- **Automatic**: Saves occur 2 seconds after you stop editing
- **Status Indicator**: Shows "Saving...", "Saved", or "Error"
- **Last Saved Time**: Displays when the report was last saved
- **No Manual Save Needed**: Just edit and it saves automatically

**Status Messages:**
- **"Saved"** - All changes saved successfully
- **"Saving..."** - Currently saving your changes
- **"Error"** - Failed to save (check your connection)

---

## Exporting Reports

### Export Formats

The application supports two export formats:

#### 1. XLSX (Excel) Export

**Contents:**
- **Summary Sheet**: Statistics and overview
- **All Entries Sheet**: Complete data table with all entries
- **Category Sheets**: Separate sheets for each category (Backhaul, Upstreams, etc.)

**Formatting:**
- Professional styling with headers
- Borders and colors
- Optimized column widths
- Formula-based calculations

**How to Export:**
1. Open the report you want to export
2. Click **"Export as XLSX"** button
3. File downloads automatically
4. Open with Microsoft Excel or Google Sheets

**File Naming:** `NOC_Report_YYYY-MM-DD.xlsx`

#### 2. PDF Export

**Contents:**
- Header with title and date
- Summary statistics section
- Complete data table with all entries
- Formatted professionally for printing

**Features:**
- Automatic page breaks
- Page numbers
- Clean table formatting
- Company branding ready

**How to Export:**
1. Open the report you want to export
2. Click **"Export as PDF"** button
3. File downloads automatically
4. Open with any PDF reader

**File Naming:** `NOC_Report_YYYY-MM-DD.pdf`

### Export Tips

- **Before Exporting**: Ensure all edits are saved (check "Saved" status)
- **Large Reports**: May take 5-10 seconds to generate
- **Failed Download**: Check browser's download permissions
- **File Location**: Check your browser's default download folder

---

## Understanding Statistics

### Statistics Panel

Located at the top of the report editor, provides real-time metrics:

#### 1. **Total Services** 🔧
- Count of all entries classified as "Service"
- Represents maintenance, scheduled work, or service-related activities
- **Example**: Network upgrades, routine maintenance

#### 2. **New Complaints** ⚠️
- Count of new customer complaints
- First-time issues reported
- **Calculation**: Total complaints - Recurring complaints

#### 3. **Recurring Complaints** 🔄
- Complaints from clients who have reported issues before
- Based on client/vendor name matching
- Indicates persistent problems

#### 4. **Unresolved Complaints** 🔴
- Complaints that remain open
- **Default**: All complaints are considered unresolved unless manually marked
- Requires manual tracking in remarks

#### 5. **Resolved Complaints** ✅
- Complaints that have been closed/fixed
- **Calculation**: Total complaints - Unresolved
- Track resolution status in remarks field

### Statistics Update

- **Real-time**: Updates automatically as you edit entries
- **Instant Calculation**: No need to refresh
- **Always Accurate**: Reflects current state of the report

---

## Tips & Best Practices

### Email Fetching

✅ **DO:**
- Select the correct date (remember it's GMT+6 timezone)
- Wait for the fetch to complete before generating report
- Check the email list to verify correct emails were fetched

❌ **DON'T:**
- Click fetch multiple times (it will queue requests)
- Close the browser during fetch operation
- Generate report before fetch completes

### Report Generation

✅ **DO:**
- Review generated entries for accuracy
- Manually categorize "Uncategorized" entries
- Add remarks for context
- Use consistent naming for clients/vendors

❌ **DON'T:**
- Generate multiple reports for the same date (use edit instead)
- Delete entries without verification
- Leave important fields empty

### Editing

✅ **DO:**
- Wait for "Saved" status before navigating away
- Use consistent terminology across entries
- Fill in all relevant fields
- Add detailed remarks for complex issues
- Use proper date/time format

❌ **DON'T:**
- Close the tab while "Saving..." is displayed
- Edit too quickly (wait for auto-save)
- Use special characters in client names unnecessarily

### Exporting

✅ **DO:**
- Ensure report is saved before exporting
- Choose appropriate format for your audience:
  - **XLSX** - For further analysis, sharing with technical teams
  - **PDF** - For formal reports, printing, archives
- Verify export completed successfully
- Check downloaded file before sharing

❌ **DON'T:**
- Export while edits are being saved
- Share exports without reviewing first
- Rely solely on exports (database is the source of truth)

### General Best Practices

1. **Regular Updates**: Generate reports daily for consistency
2. **Review Before Sharing**: Always review generated reports before distributing
3. **Categorization**: Manually review auto-categorized entries for accuracy
4. **Naming Conventions**: Use consistent client/vendor names for better recurring complaint detection
5. **Remarks Field**: Use for important context, resolution status, follow-up notes
6. **Backup**: Download important reports in both formats
7. **Data Quality**: Accurate data in = accurate reports out

---

## Common Workflows

### Daily Report Generation Workflow

**Morning Routine:**
1. Sign in to the application
2. Select yesterday's date
3. Fetch emails
4. Generate report
5. Review and edit entries
6. Export as XLSX
7. Share with team

**Estimated Time:** 5-10 minutes (vs 30+ minutes manually)

### End-of-Week Review

1. Access each daily report from the past week
2. Review recurring complaints
3. Export all reports as PDF
4. Compile weekly summary
5. Share with management

### Monthly Reporting

1. Access all reports for the month
2. Analyze statistics trends
3. Export key reports
4. Generate monthly summary
5. Archive exports

---

## Keyboard Shortcuts

- **Tab**: Move to next cell in table
- **Shift + Tab**: Move to previous cell
- **Enter**: Edit cell content
- **Esc**: Cancel editing (before auto-save)
- **Ctrl/Cmd + S**: Manual save (auto-save makes this optional)

---

## Troubleshooting

### Issue: Emails Not Fetching

**Possible Causes:**
- Network connection lost
- Microsoft Graph API rate limit reached
- Invalid date selected
- Token expired

**Solutions:**
1. Check internet connection
2. Wait 5 minutes and try again
3. Verify date is not in the future
4. Sign out and sign in again

### Issue: Report Not Saving

**Possible Causes:**
- Network connection lost
- Database connection issue
- Too many simultaneous edits

**Solutions:**
1. Check "Saving..." status
2. Wait for auto-save to complete
3. Refresh page if stuck on "Saving..."
4. Check internet connection

### Issue: Export Fails

**Possible Causes:**
- Large report (500+ entries)
- Browser blocking download
- Network timeout

**Solutions:**
1. Wait longer (large reports take time)
2. Check browser download permissions
3. Try the other format (XLSX vs PDF)
4. Try smaller date range

### Issue: Wrong Categorization

**Expected Behavior:**
- Auto-categorization is ~85% accurate
- Some emails require manual categorization
- "Uncategorized" is a fallback

**Solutions:**
1. Manually edit the category dropdown
2. Use consistent keywords in email subjects (for future)
3. Add to remarks for context

---

## Support & Feedback

### Getting Help

1. **Check this guide first** for common solutions
2. **Contact your administrator** for access issues
3. **Report bugs** to the development team
4. **Request features** through appropriate channels

### Providing Feedback

Your feedback helps improve the system:
- **What works well?**
- **What could be better?**
- **What features are missing?**
- **Any bugs encountered?**

---

## Glossary

**Terms Used in the Application:**

- **Backhaul**: Network infrastructure connecting the core network to smaller subnetworks
- **Upstreams**: Internet service providers or connectivity providers
- **IPT Client**: Internet Protocol Telephony customer
- **ISP Client**: Internet Service Provider customer
- **Service**: Scheduled maintenance, planned work, or service-related activity
- **Complain**: Customer-reported issue or incident
- **Recurring**: Issue from a client who has reported problems before
- **Unresolved**: Issue that remains open or unfixed
- **GMT+6**: Asia/Dhaka timezone (Bangladesh Standard Time)

---

## Version Information

**Application Version**: 1.0.0  
**Last Updated**: October 2025  
**Guide Version**: 1.0

---

**Questions?** Contact your system administrator or refer to the [FAQ](./FAQ.md) for more information.

