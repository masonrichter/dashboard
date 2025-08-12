# Client Sync to Google Sheets

## Overview

This feature automatically syncs client details to a "Clients" tab in the same Google Sheets spreadsheet that the AUM data is pulled from. When users add or update extra information in the details section of a client card, that information is automatically sent to Google Sheets.

## How It Works

1. **Client Details Update**: When a user edits a client's details in the dashboard and clicks "Save", the system:
   - Updates the client information in Copper CRM
   - Automatically syncs the updated data to Google Sheets

2. **Google Sheets Integration**: The system creates a "Clients" tab in the same spreadsheet used for AUM data with the following columns:
   - Client ID
   - Name
   - Email
   - Phone
   - Company
   - Title
   - Address
   - City
   - Details (the extra information field)
   - Tags
   - Last Modified
   - Sync Date

3. **User Feedback**: Users see real-time status updates:
   - "Syncing to Google Sheets..." while the sync is in progress
   - "✅ Synced to Google Sheets successfully!" when complete
   - "⚠️ Sync to Google Sheets failed" if there's an error

## API Endpoint

**POST** `/api/clients/sync-to-sheets`

**Request Body:**
```json
{
  "clientData": {
    "id": 12345,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "company": "Company Name",
    "title": "CEO",
    "address": "123 Main St",
    "city": "City Name",
    "details": "Extra information here",
    "tags": ["tag1", "tag2"],
    "lastModified": "2024-01-15T10:30:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client details synced to Google Sheets successfully"
}
```

## Environment Variables Required

The following environment variables must be set for the sync to work:

- `GOOGLE_SHEETS_SPREADSHEET_ID`: The ID of the Google Sheets spreadsheet
- `GOOGLE_SHEETS_API_KEY`: The API key for Google Sheets access

## Features

- **Automatic Header Creation**: If the "Clients" tab doesn't exist or has no headers, they are automatically created
- **Error Handling**: Sync failures don't prevent the main save operation from completing
- **Visual Feedback**: Users see sync status in real-time
- **Non-blocking**: The sync happens in the background and doesn't block the UI

## Usage

1. Navigate to the Clients page
2. Click on any client card to open the details modal
3. Click "Edit Details" to modify client information
4. Add or update information in the "Details" field
5. Click "Save" - the system will automatically sync to Google Sheets
6. Watch for the sync status message to confirm success

## Technical Implementation

- **Frontend**: React state management for sync status and loading states
- **Backend**: Next.js API route using Google Sheets API v4
- **Authentication**: Uses API key authentication (same as AUM integration)
- **Data Format**: Structured data with proper error handling and validation

## Error Handling

- Network errors are logged but don't prevent the main save operation
- Google Sheets API errors are caught and reported to the user
- Missing environment variables result in appropriate error messages
- Invalid data is handled gracefully with fallback values
