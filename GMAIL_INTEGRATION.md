# Gmail Integration: Tasks & Email Management

This document describes the Gmail integration for the tasks page, which provides secure OAuth authentication and email management capabilities.

## Overview

The Gmail integration provides:
- **Secure OAuth 2.0 Authentication** with Google
- **Email Display** showing subject, sender, date, and snippet
- **Email Management** including mark as read/unread and delete
- **Real-time Updates** with refresh functionality
- **Query Filtering** for different email views
- **Token Management** with automatic refresh and secure storage

## Architecture

### Gmail API Integration (`lib/google.ts`)

The Gmail API integration provides comprehensive email management:

```typescript
interface EmailSummary {
  id: string
  subject: string
  sender: string
  senderEmail: string
  date: string
  snippet: string
  isRead: boolean
  hasAttachments: boolean
}
```

### Key Functions

- `getGmailMessagesWithDetails()` - Fetch emails with full details
- `markMessageAsRead()` - Mark email as read
- `markMessageAsUnread()` - Mark email as unread
- `deleteGmailMessage()` - Delete email
- `getGmailMessages()` - Get basic message list

### Custom Hook (`app/hooks/useGmail.ts`)

A React hook that provides easy access to Gmail operations:

```typescript
const {
  emails,
  loading,
  error,
  isAuthenticated,
  fetchEmails,
  markAsRead,
  markAsUnread,
  deleteEmail,
  refreshEmails,
  clearError
} = useGmail({ accessToken, maxResults, query })
```

### OAuth Utilities (`lib/oauth.ts`)

Secure OAuth 2.0 implementation:

```typescript
class SecureTokenStorage {
  static storeTokens(tokens: OAuthTokens): void
  static getValidAccessToken(): Promise<string | null>
  static clearTokens(): void
  static isTokenExpired(): boolean
}
```

## OAuth Authentication Flow

### 1. OAuth Setup

1. **Google Console Configuration**:
   - Create a project in Google Cloud Console
   - Enable Gmail API
   - Configure OAuth consent screen
   - Create OAuth 2.0 credentials

2. **Environment Variables**:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
   ```

### 2. Authentication Flow

1. **User clicks "OAuth Setup"** → Redirects to Google OAuth
2. **Google OAuth** → User authorizes the application
3. **Callback** → Google redirects with authorization code
4. **Token Exchange** → Exchange code for access/refresh tokens
5. **Token Storage** → Securely store tokens in localStorage
6. **Email Access** → Use access token to fetch emails

### 3. Token Management

- **Automatic Refresh**: Tokens are automatically refreshed when expired
- **Secure Storage**: Tokens stored in localStorage with expiration tracking
- **Error Handling**: Graceful handling of token expiration and errors

## Component Integration

### GmailInbox Component (`app/components/GmailInbox.tsx`)

The main email display component:

```typescript
interface GmailInboxProps {
  accessToken?: string
  maxResults?: number
  query?: string
}
```

### Features

- **Email List**: Displays emails with subject, sender, date, and snippet
- **Read/Unread Status**: Visual indicators for email status
- **Attachment Indicators**: Shows when emails have attachments
- **Email Actions**: Mark as read/unread, delete emails
- **Email Details Modal**: Click to view full email details
- **Refresh Functionality**: Manual refresh of email list

### Tasks Page (`app/pages/tasks.tsx`)

The main page that integrates all Gmail functionality:

- **Authentication Configuration**: OAuth setup and token management
- **Email Settings**: Query filters and result count configuration
- **Security Information**: Privacy and security details
- **Feature Overview**: Complete feature documentation

## Email Query Filters

The integration supports various Gmail query filters:

| Filter | Description | Query |
|--------|-------------|-------|
| Inbox | All inbox emails | `in:inbox` |
| Unread | Unread emails only | `is:unread` |
| Important | Important emails | `is:important` |
| Attachments | Emails with attachments | `has:attachment` |
| Sent | Emails sent by user | `from:me` |
| Work Label | Emails with work label | `label:work` |
| Personal Label | Emails with personal label | `label:personal` |

## Security Features

### Token Security

1. **Secure Storage**: Tokens stored in localStorage with encryption
2. **Automatic Expiration**: Tokens automatically refreshed when expired
3. **Scope Limitation**: Minimal required OAuth scopes
4. **State Validation**: OAuth state parameter for CSRF protection

### Data Privacy

1. **Read-Only by Default**: Only reads email metadata
2. **No External Storage**: No data sent to external servers
3. **User Control**: Users can disconnect anytime
4. **Local Processing**: All data processing happens locally

### Error Handling

1. **Network Errors**: Graceful handling of network failures
2. **Token Errors**: Automatic token refresh on expiration
3. **API Errors**: User-friendly error messages
4. **Fallback Behavior**: Continues working with cached data

## Usage Examples

### Basic Usage

```typescript
import GmailInbox from '@/app/components/GmailInbox'

function MyComponent() {
  return (
    <GmailInbox 
      accessToken="your_access_token"
      maxResults={10}
      query="in:inbox"
    />
  )
}
```

### With OAuth Integration

```typescript
import { useGmail } from '@/app/hooks/useGmail'
import { SecureTokenStorage } from '@/lib/oauth'

function MyComponent() {
  const { emails, loading, error, isAuthenticated } = useGmail({
    accessToken: await SecureTokenStorage.getValidAccessToken()
  })

  return (
    <div>
      {isAuthenticated ? (
        <GmailInbox accessToken={accessToken} />
      ) : (
        <div>Please authenticate with Gmail</div>
      )}
    </div>
  )
}
```

## API Reference

### Gmail API Functions

#### `getGmailMessagesWithDetails()`
Fetches emails with full details including headers and metadata.

```typescript
const emails = await getGmailMessagesWithDetails(
  accessToken: string,
  maxResults: number = 10,
  query: string = 'in:inbox'
): Promise<EmailSummary[]>
```

#### `markMessageAsRead()`
Marks an email as read by removing the UNREAD label.

```typescript
await markMessageAsRead(
  accessToken: string,
  messageId: string
): Promise<void>
```

#### `markMessageAsUnread()`
Marks an email as unread by adding the UNREAD label.

```typescript
await markMessageAsUnread(
  accessToken: string,
  messageId: string
): Promise<void>
```

#### `deleteGmailMessage()`
Permanently deletes an email from Gmail.

```typescript
await deleteGmailMessage(
  accessToken: string,
  messageId: string
): Promise<void>
```

### OAuth Functions

#### `generateGoogleOAuthUrl()`
Generates the OAuth URL for Google authentication.

```typescript
const oauthUrl = generateGoogleOAuthUrl(
  scopes: string[] = ['https://www.googleapis.com/auth/gmail.readonly']
): string
```

#### `SecureTokenStorage.storeTokens()`
Securely stores OAuth tokens with expiration tracking.

```typescript
SecureTokenStorage.storeTokens(tokens: OAuthTokens): void
```

#### `SecureTokenStorage.getValidAccessToken()`
Gets a valid access token, refreshing if necessary.

```typescript
const token = await SecureTokenStorage.getValidAccessToken(): Promise<string | null>
```

## Error Handling

### Common Errors

1. **Authentication Errors**
   - Invalid access token
   - Expired access token
   - Missing OAuth scopes

2. **API Errors**
   - Rate limiting
   - Quota exceeded
   - Network connectivity issues

3. **Token Errors**
   - Refresh token expired
   - Invalid refresh token
   - OAuth configuration issues

### Error Recovery

The integration implements several error recovery mechanisms:

- **Automatic Retry**: Retries failed API calls
- **Token Refresh**: Automatically refreshes expired tokens
- **Graceful Degradation**: Continues working with cached data
- **User Feedback**: Clear error messages and status indicators

## Performance Considerations

### Optimization Strategies

1. **Caching**: Caches email data to reduce API calls
2. **Pagination**: Loads emails in batches
3. **Lazy Loading**: Only loads email details when needed
4. **Debounced Updates**: Prevents excessive API calls

### Best Practices

1. **Minimize API Calls**: Use caching and batching
2. **Handle Rate Limits**: Implement exponential backoff
3. **Optimize Queries**: Use specific Gmail query filters
4. **Monitor Usage**: Track API quota usage

## Troubleshooting

### Common Issues

1. **"Gmail not authenticated"**
   - Check OAuth configuration
   - Verify access token validity
   - Ensure proper scopes are granted

2. **"Failed to fetch emails"**
   - Check network connectivity
   - Verify API quotas
   - Ensure Gmail API is enabled

3. **"Token refresh failed"**
   - Check refresh token validity
   - Verify OAuth configuration
   - Re-authenticate if necessary

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
// Add to your component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Gmail status:', { isAuthenticated, error, emails: emails.length })
  }
}, [isAuthenticated, error, emails])
```

## Future Enhancements

### Planned Features

1. **Email Composition**: Send emails through Gmail API
2. **Advanced Filtering**: More sophisticated email queries
3. **Email Templates**: Pre-defined email templates
4. **Bulk Operations**: Process multiple emails at once
5. **Email Analytics**: Track email metrics and trends
6. **Integration APIs**: Connect with other business systems
7. **Real-time Notifications**: WebSocket-based email notifications
8. **Email Scheduling**: Schedule emails for later sending

### API Improvements

1. **Batch API**: Efficient bulk operations
2. **Webhook Support**: Real-time email notifications
3. **Advanced Search**: Full-text search capabilities
4. **Label Management**: Create and manage Gmail labels
5. **Attachment Handling**: Download and process attachments 