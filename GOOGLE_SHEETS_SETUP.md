# Google Sheets Setup for Multi-User Collaboration

## Overview
This document explains how to set up Google Sheets for multi-user collaboration in the Rose Stone expense tracking app.

## Required Google Sheets Structure

### Personal Expenses Sheet
Create a Google Sheet with the following columns (Row 1 as headers):

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Date | Title | Amount | Category | Type | Description | User ID | User Initials | User Email | Created At | Updated At |

### Business Expenses Sheet
Create another Google Sheet with the same structure:

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Date | Title | Amount | Category | Type | Description | User ID | User Initials | User Email | Created At | Updated At |

## Column Descriptions

- **Date**: Expense date (YYYY-MM-DD format)
- **Title**: Expense title/description
- **Amount**: Expense amount (numeric)
- **Category**: Category ID (references the category system)
- **Type**: "personal" or "business"
- **Description**: Additional notes (optional)
- **User ID**: Google user ID of who added the expense
- **User Initials**: User's initials (e.g., "JD" for John Doe)
- **User Email**: User's email address
- **Created At**: Timestamp when expense was created
- **Updated At**: Timestamp when expense was last modified

## Sharing Setup

### Step 1: Create the Sheets
1. Create two new Google Sheets
2. Name them appropriately (e.g., "Rose Stone - Personal Expenses", "Rose Stone - Business Expenses")
3. Set up the column headers as shown above

### Step 2: Share with Collaborators
1. Click the "Share" button in the top-right corner
2. Add email addresses of users you want to collaborate with
3. Set permissions to "Editor" for full access
4. Click "Send"

### Step 3: Get Sheet IDs
1. Copy the sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
   - The SHEET_ID is the long string between `/d/` and `/edit`

### Step 4: Configure in App
1. Go to Settings in the Rose Stone app
2. Click "Connect Google Drive"
3. Enter the sheet IDs and names
4. Sign in with Google to authenticate

## Multi-User Features

### User Identification
- Each expense entry includes the user who created it
- User initials are displayed as badges on each expense
- Hover over initials to see full email address

### Real-time Collaboration
- Multiple users can add expenses simultaneously
- All users see expenses from all collaborators
- User information is preserved for each expense

### Data Integrity
- User ID prevents accidental data conflicts
- Timestamps track when expenses were created/modified
- Each user's contributions are clearly marked

## Security Considerations

### Access Control
- Only users with sheet access can view/add expenses
- Sheet owner can remove users at any time
- All changes are tracked with user information

### Data Privacy
- User emails are stored in the sheets
- Consider using a shared Google account for sensitive data
- Regular backups recommended

## Troubleshooting

### Common Issues
1. **Permission Denied**: Ensure user has "Editor" access to both sheets
2. **Authentication Failed**: Re-sign in with Google in the app
3. **Data Not Syncing**: Check internet connection and sheet IDs

### Support
- Check Google Sheets API quotas
- Verify sheet sharing permissions
- Ensure all users are signed in with Google accounts

## Example Data

Here's what a populated sheet might look like:

| Date | Title | Amount | Category | Type | Description | User ID | User Initials | User Email | Created At | Updated At |
|------|-------|--------|----------|------|-------------|---------|---------------|------------|------------|------------|
| 2024-01-15 | Coffee | 4.50 | 1 | personal | Morning coffee | 123456789 | JD | john@example.com | 2024-01-15T08:30:00Z | 2024-01-15T08:30:00Z |
| 2024-01-15 | Gas | 45.00 | 2 | business | Company car fuel | 987654321 | JS | jane@example.com | 2024-01-15T09:15:00Z | 2024-01-15T09:15:00Z |

This setup ensures that multiple users can collaborate effectively while maintaining clear attribution and data integrity.


