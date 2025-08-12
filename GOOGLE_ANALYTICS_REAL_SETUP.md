# Real Google Analytics Integration Setup

This guide will help you connect your Wix website's Google Analytics to display real data in your dashboard.

## 🔧 **Step 1: Get Your Google Analytics Property ID**

1. **Go to Google Analytics**: https://analytics.google.com/
2. **Select your property** (the one connected to your Wix site)
3. **Copy the Property ID**:
   - Go to Admin (gear icon) > Property Settings
   - Copy the "Property ID" (format: `123456789`)

## 🔑 **Step 2: Set Up Google Cloud Project & API**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**:
   - Create a new project or select existing project
   - Make sure you're in the correct project
3. **Enable Google Analytics Data API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Analytics Data API"
   - Click "Enable"
4. **Create Service Account** (Recommended for server-side access):
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Give it a name like "Analytics Dashboard"
   - Click "Create and Continue"
   - Skip role assignment, click "Continue"
   - Click "Done"
5. **Generate Service Account Key**:
   - Click on your new service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose "JSON" format
   - Download the JSON file

## 🔐 **Step 3: Grant Access to Google Analytics**

1. **Go back to Google Analytics**
2. **Add Service Account as User**:
   - Go to Admin > Property > Property Access Management
   - Click the "+" button
   - Add the service account email (from the JSON file)
   - Give it "Viewer" permissions
   - Click "Add"

## 📝 **Step 4: Add Environment Variables**

Add these to your `.env.local` file:

```env
# Google Analytics Configuration
GOOGLE_ANALYTICS_PROPERTY_ID=your_property_id_here
GOOGLE_ANALYTICS_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_ANALYTICS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
```

**Important**: 
- Replace `your_property_id_here` with your actual Property ID
- Replace the service account email with the one from your JSON file
- Copy the private key from the JSON file (including the `\n` characters)

## 🚀 **Step 5: Update API Route for Service Account**

The current API route uses API key authentication, but for better security and access, you should use service account authentication. Here's how to update it:

### Option A: Use Service Account (Recommended)

Update your `app/api/google-analytics/route.ts` to use service account authentication:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';

const GOOGLE_ANALYTICS_PROPERTY_ID = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
const GOOGLE_ANALYTICS_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_ANALYTICS_PRIVATE_KEY = process.env.GOOGLE_ANALYTICS_PRIVATE_KEY;

export async function GET(request: NextRequest) {
  try {
    if (!GOOGLE_ANALYTICS_PROPERTY_ID) {
      return NextResponse.json(
        { error: 'Google Analytics Property ID not configured' },
        { status: 500 }
      );
    }

    if (!GOOGLE_ANALYTICS_SERVICE_ACCOUNT_EMAIL || !GOOGLE_ANALYTICS_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Google Analytics service account not configured' },
        { status: 500 }
      );
    }

    // Get access token using service account
    const auth = new GoogleAuth({
      credentials: {
        client_email: GOOGLE_ANALYTICS_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_ANALYTICS_PRIVATE_KEY,
      },
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // Get date ranges
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Fetch real Google Analytics data
    const analyticsData = await fetchGoogleAnalyticsData(
      GOOGLE_ANALYTICS_PROPERTY_ID,
      accessToken.token!,
      today,
      startOfWeek,
      startOfMonth
    );

    return NextResponse.json(analyticsData);
  } catch (error: any) {
    console.error('Error fetching Google Analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google Analytics data', details: error.message },
      { status: 500 }
    );
  }
}

async function fetchGoogleAnalyticsData(
  propertyId: string,
  accessToken: string,
  today: Date,
  startOfWeek: Date,
  startOfMonth: Date
) {
  const baseUrl = 'https://analyticsdata.googleapis.com/v1beta';
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  // Rest of the function remains the same...
}
```

### Option B: Use API Key (Simpler but less secure)

If you prefer to use API key authentication:

1. **Create API Key**:
   - Go to Google Cloud Console > APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - Copy the API key

2. **Add to environment variables**:
   ```env
   GOOGLE_ANALYTICS_API_KEY=your_api_key_here
   ```

## 📦 **Step 6: Install Required Dependencies**

If using service account authentication, install the Google Auth library:

```bash
npm install google-auth-library
```

## 🚀 **Step 7: Test the Integration**

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Visit your analytics page**:
   ```
   http://localhost:3002/analytics
   ```

3. **Test the API endpoint**:
   ```
   http://localhost:3002/api/google-analytics
   ```

## 📊 **What You'll See**

Your analytics page will now display:

### **Real Data from Google Analytics**
- ✅ **Page Views Today**: Real page view count from your Wix site
- ✅ **Visitors Today**: Real unique visitors today
- ✅ **Total Page Views**: All-time page views from your site
- ✅ **Total Visitors**: All-time unique visitors from your site

### **Charts & Data**
- ✅ **Top Pages**: Most visited pages on your Wix site
- ✅ **Traffic Sources**: Where your visitors come from
- ✅ **Auto-refresh**: Updates every 30 seconds

## 🔄 **Real-time Updates**

- **Auto-refresh**: Data updates automatically every 30 seconds
- **Manual refresh**: Click "Refresh Data" button
- **Live data**: Shows real visitor activity from your Wix site

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **"Property ID not configured"**
   - Check that `GOOGLE_ANALYTICS_PROPERTY_ID` is set correctly
   - Verify the Property ID format (numbers only)

2. **"Service account not configured"**
   - Ensure service account email and private key are set
   - Check that the private key includes `\n` characters

3. **"API key not valid"**
   - Ensure Google Analytics Data API is enabled
   - Check that the API key is correct
   - Verify the API key has proper permissions

4. **"No data showing"**
   - Check that your Wix site has Google Analytics properly connected
   - Verify there's recent traffic to your site
   - Check the Property ID matches your Wix site's analytics
   - Ensure the service account has access to the property

### **Debug Steps:**

1. **Test the API endpoint directly**:
   ```bash
   curl http://localhost:3002/api/google-analytics
   ```

2. **Check environment variables**:
   ```bash
   grep -r "GOOGLE_ANALYTICS" .env*
   ```

3. **Verify Google Analytics setup**:
   - Check that Google Analytics is properly connected to your Wix site
   - Ensure there's recent traffic data
   - Verify the service account has "Viewer" access to the property

## 🔒 **Security Notes**

- **Service Account**: More secure, recommended for production
- **API Key**: Simpler but less secure, good for development
- **Environment Variables**: Never commit these to version control
- **Access Control**: Only grant necessary permissions to service accounts

Your analytics page will now pull real data from your Wix website's Google Analytics! 🎉

## 📈 **Next Steps**

Once you have real data flowing:

1. **Customize the dashboard** to show the metrics most important to you
2. **Add more date ranges** (last 30 days, last quarter, etc.)
3. **Set up alerts** for important metrics
4. **Export data** to other tools
5. **Add real-time visitor tracking** (requires additional setup)
