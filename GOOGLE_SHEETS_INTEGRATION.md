# Google Sheets Integration: ClientCard

This document describes the Google Sheets integration for the ClientCard component, which allows real-time editing and synchronization of client data between the dashboard and Google Sheets.

## Overview

The ClientCard component now supports:
- **Real-time editing** of client notes, portfolio value (AUM), and meeting dates
- **Google Sheets synchronization** for persistent data storage
- **Local storage backup** for offline functionality
- **Visual status indicators** for save operations
- **Error handling** and retry mechanisms

## Architecture

### Google Sheets API Integration (`lib/google.ts`)

The Google Sheets integration provides comprehensive client data management:

```typescript
interface ClientData {
  id: string
  name: string
  email: string
  company?: string
  aum?: string
  nextMeeting?: string
  notes?: string
  customFields?: Record<string, string>
  lastUpdated: string
  tags: string[]
}
```

### Key Functions

- `readClientData()` - Read client data from Google Sheets
- `updateClientData()` - Update client data in Google Sheets
- `addClientToSheet()` - Add new client to Google Sheets
- `findClientRow()` - Find client row by ID
- `initializeClientSheet()` - Set up sheet headers

### Custom Hook (`app/hooks/useGoogleSheets.ts`)

A React hook that provides easy access to Google Sheets operations:

```typescript
const {
  loading,
  error,
  isAuthenticated,
  readClient,
  updateClient,
  addClient,
  getAllClients,
  initializeSheet,
  clearError
} = useGoogleSheets({ spreadsheetId, accessToken })
```

## Google Sheets Structure

The integration expects a Google Sheet with a "Clients" tab containing the following columns:

| Column | Header | Description |
|--------|--------|-------------|
| A | Client ID | Unique identifier for the client |
| B | Name | Client's full name |
| C | Email | Client's email address |
| D | Company | Client's company name |
| E | AUM | Assets Under Management |
| F | Next Meeting | Scheduled meeting date/time |
| G | Notes | Client notes and comments |
| H | Custom Fields | JSON string of custom fields |
| I | Last Updated | Timestamp of last update |
| J | Tags | Comma-separated list of tags |

## Component Integration

### ClientCard Props

The ClientCard component accepts additional props for Google Sheets integration:

```typescript
interface ClientCardProps {
  client: CopperContactSummary
  onUpdate?: () => void
  spreadsheetId?: string
  accessToken?: string
}
```

### Save Process

When editing client data, the component follows this process:

1. **Local Save**: Data is immediately saved to localStorage
2. **Google Sheets Save**: If authenticated, data is sent to Google Sheets
3. **Status Update**: Visual indicators show save progress
4. **Error Handling**: Errors are displayed and handled gracefully

## Features

### Real-time Editing

Users can edit:
- **Portfolio Value (AUM)**: Enter amounts like "500000" or "1.2M"
- **Next Meeting**: Select date and time using datetime picker
- **Notes**: Add detailed client notes and comments
- **Custom Fields**: Create and manage custom data fields

### Save Status Indicators

Visual feedback for save operations:
- **Saving**: Spinning indicator with "Saving..." text
- **Saved**: Green checkmark with "Saved" confirmation
- **Error**: Red warning icon with error message
- **Google Sheets**: Cloud icon when Google Sheets is connected

### Data Synchronization

- **Bidirectional Sync**: Data flows between local storage and Google Sheets
- **Conflict Resolution**: Local data takes precedence, then Google Sheets data
- **Automatic Merging**: Custom fields are merged from both sources
- **Timestamp Tracking**: Last updated timestamps are maintained

## Setup Instructions

### 1. Google Sheets Setup

1. Create a new Google Sheet
2. Add a tab named "Clients"
3. Note the spreadsheet ID from the URL

### 2. Google OAuth Setup

1. Set up Google OAuth with spreadsheets scope
2. Get an access token from the OAuth flow
3. Configure the access token in your application

### 3. Application Configuration

```typescript
<ClientCard 
  client={clientData}
  spreadsheetId="your-spreadsheet-id"
  accessToken="your-access-token"
  onUpdate={handleUpdate}
/>
```

## Usage Examples

### Basic Usage

```typescript
import ClientCard from '@/app/components/ClientCard'

function MyComponent() {
  return (
    <ClientCard 
      client={client}
      spreadsheetId="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
      accessToken="ya29.a0AfH6SMC..."
    />
  )
}
```

### With Error Handling

```typescript
function MyComponent() {
  const [error, setError] = useState<string | null>(null)

  const handleUpdate = () => {
    // Handle successful update
    console.log('Client updated successfully')
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      <ClientCard 
        client={client}
        spreadsheetId={spreadsheetId}
        accessToken={accessToken}
        onUpdate={handleUpdate}
      />
    </div>
  )
}
```

## Error Handling

### Common Errors

1. **Authentication Errors**
   - Invalid access token
   - Expired access token
   - Missing permissions

2. **Sheet Errors**
   - Spreadsheet not found
   - Invalid spreadsheet ID
   - Missing "Clients" tab

3. **Data Errors**
   - Invalid JSON in custom fields
   - Missing required fields
   - Network connectivity issues

### Error Recovery

The component implements several error recovery mechanisms:

- **Local Fallback**: Always saves to localStorage first
- **Retry Logic**: Automatic retry for transient errors
- **User Feedback**: Clear error messages and status indicators
- **Graceful Degradation**: Works offline with local storage only

## Performance Considerations

### Optimization Strategies

1. **Debounced Updates**: Prevents excessive API calls during rapid editing
2. **Batch Operations**: Groups related updates when possible
3. **Caching**: Caches client data to reduce API calls
4. **Lazy Loading**: Loads Google Sheets data only when needed

### Best Practices

1. **Minimize API Calls**: Use local storage for frequent updates
2. **Handle Offline Mode**: Ensure functionality without internet
3. **Validate Data**: Check data integrity before saving
4. **User Feedback**: Always show save status to users

## Security Considerations

### Data Protection

1. **Access Token Security**: Store tokens securely, never expose in client code
2. **Data Validation**: Validate all input data before saving
3. **Permission Scopes**: Use minimal required OAuth scopes
4. **Error Messages**: Don't expose sensitive information in error messages

### Privacy

1. **Data Minimization**: Only collect necessary client information
2. **Consent**: Ensure proper consent for data collection
3. **Retention**: Implement appropriate data retention policies
4. **Access Control**: Limit access to authorized users only

## Troubleshooting

### Common Issues

1. **"Google Sheets not authenticated"**
   - Check spreadsheet ID and access token
   - Verify OAuth permissions include spreadsheets scope

2. **"Client not found in sheet"**
   - Ensure client ID exists in the sheet
   - Check that the "Clients" tab exists

3. **"Failed to update client data"**
   - Verify network connectivity
   - Check Google Sheets API quotas
   - Ensure proper data format

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
// Add to your component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Google Sheets status:', { sheetsAuthenticated, sheetsError })
  }
}, [sheetsAuthenticated, sheetsError])
```

## Future Enhancements

### Planned Features

1. **Bulk Operations**: Update multiple clients at once
2. **Data Export**: Export client data to various formats
3. **Advanced Filtering**: Filter and search within Google Sheets
4. **Real-time Collaboration**: Multiple users editing simultaneously
5. **Data Validation**: Enhanced validation rules and constraints
6. **Audit Trail**: Track all changes and modifications
7. **Backup/Restore**: Automated backup and restore functionality
8. **Integration APIs**: Connect with other business systems

### API Improvements

1. **Webhook Support**: Real-time notifications for changes
2. **Batch API**: Efficient bulk operations
3. **Incremental Sync**: Only sync changed data
4. **Conflict Resolution**: Advanced conflict detection and resolution
5. **Data Migration**: Tools for migrating from other systems 