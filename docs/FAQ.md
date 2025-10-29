# Frequently Asked Questions (FAQ)

## General Questions

### Q: What is the NOC Email Report Generator?
**A:** It's an automated web application that parses Microsoft Outlook emails and generates structured NOC (Network Operations Center) daily reports. It reduces report creation time from 30+ minutes to under 2 minutes.

### Q: Who can use this application?
**A:** Any authorized user with a valid Microsoft organizational account and appropriate email access permissions (Mail.Read, User.Read).

### Q: What browsers are supported?
**A:** All modern browsers including:
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari
- Opera

### Q: Is my data secure?
**A:** Yes! The application uses:
- Microsoft OAuth 2.0 authentication
- AES-256-GCM encryption for token storage
- Secure HTTPS connections
- No email content is permanently stored (only metadata)
- Database is protected with authentication

---

## Authentication & Access

### Q: How do I sign in?
**A:** Click "Sign in with Microsoft" on the homepage. You'll be redirected to Microsoft's login page. Enter your organizational credentials and grant permissions.

### Q: What permissions does the app require?
**A:** 
- **Mail.Read**: To access and read your emails
- **User.Read**: To access your basic profile information

### Q: Why does it ask for email access?
**A:** The application needs to read your emails to parse them and generate reports. It only reads emails; it cannot send, delete, or modify them.

### Q: How long does my session last?
**A:** Your session lasts 24 hours. After that, you'll need to sign in again for security.

### Q: Can I use a personal Microsoft account?
**A:** No, you need an organizational Microsoft account (Microsoft 365/Azure AD).

### Q: What if I don't see the sign-in button?
**A:** Ensure:
- JavaScript is enabled in your browser
- You're not using a private/incognito window
- Clear browser cache and try again

---

## Email Fetching

### Q: How far back can I fetch emails?
**A:** You can fetch emails from any past date. However, very old emails (1+ year) might take longer to fetch.

### Q: What timezone does the system use?
**A:** GMT+6 (Asia/Dhaka / Bangladesh Standard Time). All date/time operations respect this timezone.

### Q: Why does fetching take so long?
**A:** Fetching time depends on:
- Number of emails for that date
- Microsoft Graph API rate limits
- Your internet connection speed
- Typical: 10-30 seconds for 50-200 emails

### Q: Can I fetch emails for today?
**A:** Yes, but it's recommended to generate reports for completed days (yesterday or earlier) for complete data.

### Q: What if no emails are found?
**A:** This means no emails were found for the selected date. Verify:
- Correct date selected
- Your email account has emails for that date
- Emails are in inbox or sent items

### Q: Does it fetch from sent items too?
**A:** Yes, it fetches from both inbox and sent items to capture complete communication.

### Q: What if fetch fails?
**A:** Common solutions:
- Check internet connection
- Wait 5 minutes (API rate limit may have been reached)
- Sign out and sign in again
- Try a different date to test

---

## Report Generation

### Q: How long does report generation take?
**A:** Typically 1-2 minutes for 100-500 emails. The system parses, categorizes, and structures all data.

### Q: Can I generate multiple reports for the same date?
**A:** Yes, but it's not recommended. Instead, edit the existing report. The system will warn if a report exists.

### Q: What are the different categories?
**A:** 
- **Backhaul**: Network backbone infrastructure issues
- **Upstreams**: Upstream provider/connectivity issues
- **IPT Client**: IPT (Internet Protocol Telephony) customer issues
- **ISP Client**: ISP (Internet Service Provider) customer issues
- **Uncategorized**: System couldn't determine the category

### Q: How accurate is the categorization?
**A:** The auto-categorization is approximately 85% accurate. The system uses keyword-based classification. Always review and manually correct any misclassifications.

### Q: What's the difference between Service and Complain?
**A:** 
- **Service**: Planned maintenance, scheduled work, or service-related activities
- **Complain**: Unplanned incidents or customer-reported issues

### Q: Can I modify the report after generation?
**A:** Absolutely! The report editor allows full editing of all fields. All changes auto-save.

### Q: What if the parser misses information?
**A:** You can manually edit any field in the report editor. The system does its best, but manual review is recommended.

---

## Editing Reports

### Q: How does auto-save work?
**A:** Changes are automatically saved 2 seconds after you stop typing. Watch for the "Saving..." and "Saved" status indicators.

### Q: Can I undo changes?
**A:** Currently, the system saves changes automatically. To "undo", you must manually revert the change before it auto-saves (within 2 seconds).

### Q: How do I add a new entry?
**A:** Click the "Add Entry" button at the bottom of the table. A new row will appear with default values. Fill in the details.

### Q: How do I delete an entry?
**A:** Click the trash icon in the Actions column of the row you want to delete. Confirm when prompted.

### Q: Can I reorder entries?
**A:** Yes, use the "Move Up" (↑) and "Move Down" (↓) buttons in the Actions column to reorder rows.

### Q: What if I navigate away while it's saving?
**A:** Wait for the "Saved" status before navigating away. If you must leave, the auto-save might complete, but it's best to wait.

### Q: Can multiple people edit the same report?
**A:** No, only one person at a time should edit a report. The system uses "last write wins" - the most recent save will overwrite previous changes.

### Q: Do my changes affect other users' reports?
**A:** No, each user has their own reports. Your edits only affect your reports.

---

## Statistics

### Q: How are statistics calculated?
**A:** Statistics are calculated in real-time from your report entries:
- **Total Services**: Count of "Service" type entries
- **New Complaints**: Total complaints minus recurring
- **Recurring Complaints**: Complaints from clients who reported issues before (matched by name)
- **Unresolved**: Complaints without resolution indicators
- **Resolved**: Total complaints minus unresolved

### Q: Do statistics update automatically?
**A:** Yes, statistics recalculate instantly as you edit entries. No refresh needed.

### Q: What determines a recurring complaint?
**A:** If the client/vendor name matches an entry from a previous report by the same user, it's marked as recurring.

### Q: Can I customize statistics?
**A:** Currently, the statistics are predefined. Feature requests can be submitted for custom metrics.

---

## Exporting

### Q: What export formats are available?
**A:** 
- **XLSX (Excel)**: Multi-sheet workbook with summary, data, and category sheets
- **PDF**: Professional formatted document ready for printing

### Q: Which format should I use?
**A:** 
- Use **XLSX** for further analysis, data manipulation, or sharing with technical teams
- Use **PDF** for formal reports, printing, or archival purposes

### Q: Why is my export taking so long?
**A:** Large reports (500+ entries) take longer to export. XLSX export is generally faster than PDF. Wait for the download to complete.

### Q: Where do exported files go?
**A:** Files download to your browser's default download folder. Check your browser settings or downloads folder.

### Q: Can I export multiple reports at once?
**A:** Currently, you must export one report at a time. Open each report and export individually.

### Q: What's the file naming convention?
**A:** 
- XLSX: `NOC_Report_YYYY-MM-DD.xlsx`
- PDF: `NOC_Report_YYYY-MM-DD.pdf`

### Q: Can I customize the export format?
**A:** The export formats are currently standardized. Feature requests for customization can be submitted.

### Q: Export failed, what should I do?
**A:** 
1. Ensure the report is fully saved
2. Check internet connection
3. Try the other format
4. Try a smaller date range
5. Check browser download permissions

---

## Performance

### Q: Why is the app slow?
**A:** Possible reasons:
- Poor internet connection
- Large number of emails being processed
- Microsoft Graph API rate limiting
- Server under heavy load

### Q: How can I make it faster?
**A:** 
- Use a stable, fast internet connection
- Generate reports during off-peak hours
- Close unnecessary browser tabs
- Use Chrome or Edge for best performance

### Q: What's the maximum number of emails it can handle?
**A:** The system has been tested with up to 5,000 emails per report. Practical limit is ~1,000 emails for optimal performance.

### Q: Can I cancel a long-running operation?
**A:** Currently, you can close the browser tab/window to stop. Better cancel functionality is planned.

---

## Troubleshooting

### Q: I can't see my reports list
**A:** 
- Ensure you've generated at least one report
- Check that you're signed in
- Refresh the page
- Clear browser cache

### Q: Auto-save stuck on "Saving..."
**A:** 
- Check internet connection
- Wait 30 seconds
- Refresh the page (your changes might be saved)
- Check MongoDB connection

### Q: Export downloads empty file
**A:** 
- Ensure report has entries
- Try the other export format
- Check report is fully loaded
- Contact administrator

### Q: Wrong date/time shown in report
**A:** The system uses GMT+6 timezone. If you're in a different timezone, times will be converted to GMT+6.

### Q: Emails not parsing correctly
**A:** 
- The parser works best with standard email formats
- Manually edit incorrectly parsed fields
- Report pattern issues to improve future parsing

### Q: Session expired message
**A:** Your 24-hour session has ended. Simply sign in again to continue.

---

## Data & Privacy

### Q: Is my email data stored permanently?
**A:** No. Only parsed metadata (subject, date, from, categorization) is stored temporarily in the cache (30-day TTL). Full email content is not stored.

### Q: Who can see my reports?
**A:** Only you can see your reports. Each user's reports are isolated and private.

### Q: Can I delete my data?
**A:** Yes. Contact your administrator to request data deletion. This will remove all your reports and cached data.

### Q: Is the connection secure?
**A:** Yes. All connections use HTTPS encryption. Authentication tokens are encrypted with AES-256-GCM.

### Q: Where is data stored?
**A:** Data is stored in a MongoDB database. Contact your administrator for specific server location details.

---

## Mobile & Tablets

### Q: Can I use this on mobile?
**A:** The application is responsive and works on tablets. Phone use is possible but not optimized. Recommended: Use on tablet or desktop.

### Q: Are there mobile apps?
**A:** Currently, no native mobile apps exist. Use the web application through your mobile browser.

---

## Features & Limitations

### Q: Can I share reports with others?
**A:** Export the report as XLSX or PDF and share the file. Direct sharing within the app is not currently available.

### Q: Can I print reports?
**A:** Yes. Export as PDF and print the PDF file for best results.

### Q: Can I customize categories?
**A:** Currently, categories are fixed. Feature requests can be submitted for custom categories.

### Q: Is there an API for integration?
**A:** Not currently available as a public API. Contact your administrator for integration possibilities.

### Q: Can I schedule automatic report generation?
**A:** Not currently. Reports must be manually generated. Automatic scheduling is a planned feature.

### Q: Can I generate reports for date ranges?
**A:** Currently, reports are generated for single days. Multi-day reports are not supported.

---

## Getting Help

### Q: Who do I contact for support?
**A:** Contact your system administrator or IT support team.

### Q: How do I report a bug?
**A:** Report bugs to your system administrator with:
- Description of the issue
- Steps to reproduce
- Screenshots if possible
- Browser and OS information

### Q: How do I request a feature?
**A:** Submit feature requests through your organization's appropriate channels (IT ticketing system, etc.).

### Q: Where can I find more documentation?
**A:** Check the `docs/` folder for:
- [User Guide](./USER_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [API Documentation](./API_DOCUMENTATION.md)

---

## Updates & Changes

### Q: How often is the app updated?
**A:** Updates are applied as needed. Check the [CHANGELOG](../CHANGELOG.md) for version history.

### Q: Will my data be affected by updates?
**A:** No. Database schema changes are backward-compatible. Your reports are safe.

### Q: How do I know what version I'm using?
**A:** Check the footer of the application or ask your administrator.

---

## Best Practices

### Q: What's the recommended workflow?
**A:** 
1. Sign in daily
2. Select previous day's date
3. Fetch emails
4. Generate report
5. Review and edit for accuracy
6. Export as needed
7. Share with team

### Q: How often should I generate reports?
**A:** Daily, preferably for the previous day when all communications are complete.

### Q: Should I review auto-categorization?
**A:** Yes! Always review auto-categorized entries. The system is ~85% accurate, so manual verification ensures quality.

### Q: What should I include in Remarks?
**A:** 
- Resolution status
- Follow-up actions required
- Context not captured in other fields
- Important notes for future reference

---

**Still have questions?** Contact your system administrator or refer to the [User Guide](./USER_GUIDE.md) for detailed instructions.

