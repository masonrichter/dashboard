# Dashboard Summary Component

This document describes the comprehensive dashboard summary functionality that combines data from Google Sheets (AUM), MailerLite (campaign stats), and Buffer (social media analytics).

## Overview

The DashboardSummary component provides a unified view of key business metrics by integrating data from three different services:

1. **Google Sheets** - Assets Under Management (AUM) data
2. **MailerLite** - Email campaign performance statistics
3. **Buffer** - Social media engagement analytics

## Features

### 1. AUM Widget (Google Sheets Integration)
- **Total AUM**: Sum of all client assets under management
- **Client Count**: Number of active clients
- **Average AUM**: Mean assets per client
- **Growth Rate**: Percentage change over time
- **Currency Formatting**: Proper USD formatting with commas

### 2. Email Campaign Widget (MailerLite Integration)
- **Total Campaigns**: Number of campaigns created
- **Sent Campaigns**: Number of campaigns actually sent
- **Open Rate**: Average email open rate percentage
- **Click Rate**: Average click-through rate percentage
- **Total Opens**: Cumulative email opens
- **Total Clicks**: Cumulative email clicks

### 3. Social Media Widget (Buffer Integration)
- **Total Posts**: Number of social media posts
- **Total Likes**: Cumulative likes across all platforms
- **Total Comments**: Cumulative comments received
- **Total Shares**: Cumulative shares/retweets
- **Average Engagement**: Mean engagement per post
- **Platform Breakdown**: Data from LinkedIn, Twitter, Facebook, etc.

## Data Sources

### Google Sheets (AUM Data)
- **Function**: `calculateTotalAUM()` in `lib/google.ts`
- **Data Structure**: Client data with AUM values
- **Format**: Handles various currency formats ($1,234,567 or 1234567)
- **Fallback**: Mock data when API is unavailable

### MailerLite (Email Campaigns)
- **Function**: `getCampaignPerformanceSummaryWithFallback()` in `lib/mailerlite.ts`
- **Data Structure**: Campaign statistics and performance metrics
- **Metrics**: Open rates, click rates, subscriber counts
- **Fallback**: Mock campaign data when API is unavailable

### Buffer (Social Media Analytics)
- **Function**: `getBufferAnalyticsSummaryWithFallback()` in `lib/buffer.ts`
- **Data Structure**: Post interactions and engagement metrics
- **Metrics**: Likes, comments, shares, engagement rates
- **Fallback**: Mock social media data when API is unavailable

## Component Structure

### Main Dashboard Grid
- **4 Primary Widgets**: AUM, Email Campaigns, Social Engagement, Active Clients
- **Loading States**: Skeleton loaders while data is being fetched
- **Error Handling**: Error messages with retry options
- **Real-time Updates**: Refresh button to reload all data

### Detailed Metrics Section
- **3 Detailed Panels**: Email Performance, Social Media Analytics, AUM Details
- **Comprehensive Data**: Extended metrics for each service
- **Visual Indicators**: Icons and color coding for different metrics

## Technical Implementation

### State Management
```typescript
interface DashboardStats {
  aum: {
    totalAUM: number
    clientCount: number
    averageAUM: number
    loading: boolean
    error: string | null
  }
  email: {
    totalCampaigns: number
    totalSent: number
    averageOpenRate: number
    averageClickRate: number
    totalOpens: number
    totalClicks: number
    loading: boolean
    error: string | null
  }
  social: {
    totalPosts: number
    totalLikes: number
    totalComments: number
    totalShares: number
    averageEngagement: number
    loading: boolean
    error: string | null
  }
}
```

### Data Loading Functions
- `loadAUMData()`: Fetches AUM data from Google Sheets
- `loadEmailData()`: Fetches campaign stats from MailerLite
- `loadSocialData()`: Fetches analytics from Buffer

### Error Handling
- **API Failures**: Graceful fallback to mock data
- **Network Issues**: Clear error messages with retry options
- **Loading States**: Visual feedback during data fetching
- **Partial Failures**: Individual widget error handling

## Setup Requirements

### Environment Variables
```bash
# Google Sheets API
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# MailerLite API
MAILERLITE_API_KEY=your_mailerlite_api_key

# Buffer API
BUFFER_ACCESS_TOKEN=your_buffer_access_token
```

### Service Configuration
1. **Google Sheets**: Set up client data spreadsheet with AUM column
2. **MailerLite**: Configure email campaigns and subscriber lists
3. **Buffer**: Connect social media accounts and schedule posts

## Usage

### Basic Implementation
```tsx
import DashboardSummary from '@/app/components/DashboardSummary'

export default function Dashboard() {
  return (
    <div>
      <DashboardSummary />
    </div>
  )
}
```

### Custom Configuration
The component automatically handles:
- API authentication
- Data fetching and caching
- Error states and fallbacks
- Loading indicators
- Real-time updates

## Data Flow

1. **Component Mount**: Triggers `loadDashboardData()`
2. **Parallel Loading**: All three data sources load simultaneously
3. **State Updates**: Individual widgets update as data arrives
4. **Error Handling**: Failed requests show error states
5. **Fallback Data**: Mock data used when APIs are unavailable

## Performance Considerations

- **Parallel Loading**: All API calls happen simultaneously
- **Caching**: Data is cached in component state
- **Lazy Loading**: Data only loads when component mounts
- **Error Boundaries**: Individual widget failures don't break the entire dashboard

## Future Enhancements

Potential improvements could include:
- **Real-time Updates**: WebSocket connections for live data
- **Historical Data**: Charts showing trends over time
- **Custom Time Ranges**: Date picker for different periods
- **Export Functionality**: Download dashboard data as CSV/PDF
- **Custom Widgets**: User-configurable dashboard layout
- **Alerts**: Notifications for significant metric changes
- **Drill-down Views**: Click widgets to see detailed breakdowns

## Troubleshooting

### Common Issues

1. **"Failed to load AUM data"**:
   - Check Google Sheets API configuration
   - Verify spreadsheet ID and permissions
   - Ensure AUM column exists in client data

2. **"Failed to load email data"**:
   - Verify MailerLite API key
   - Check campaign permissions
   - Ensure campaigns exist in account

3. **"Failed to load social data"**:
   - Check Buffer API token
   - Verify social media account connections
   - Ensure posts exist in Buffer

### Debug Mode
Enable console logging to see detailed API responses and error messages.

## Mock Data

The component includes comprehensive mock data for development and testing:
- **AUM Data**: $2.45M total, 47 clients, $52K average
- **Email Data**: 5 campaigns, 68.5% open rate, 12.3% click rate
- **Social Data**: 15 posts, 342 likes, 89 comments, 156 shares

This ensures the dashboard works even when APIs are not configured or available. 