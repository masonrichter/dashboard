# Google Analytics Setup for Wix Website

This guide will help you connect your Wix website's Google Analytics to your dashboard.

## 🔧 **Step 1: Get Your Google Analytics Property ID**

1. **Go to Google Analytics**: https://analytics.google.com/
2. **Select your property** (the one connected to your Wix site)
3. **Copy the Property ID**:
   - Go to Admin (gear icon) > Property Settings
   - Copy the "Property ID" (format: `123456789`)

## 🔑 **Step 2: Get Google Analytics API Key**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**:
   - Create a new project or select existing project
   - Make sure you're in the correct project
3. **Enable Google Analytics Data API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Analytics Data API"
   - Click "Enable"
4. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

## 📝 **Step 3: Add Environment Variables**

Add these to your `.env.local` file:

```env
# Google Analytics Configuration
GOOGLE_ANALYTICS_PROPERTY_ID=your_property_id_here
GOOGLE_ANALYTICS_API_KEY=your_api_key_here
```

## 🚀 **Step 4: Test the Integration**

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Visit your analytics page**:
   ```
   http://localhost:3001/analytics
   ```

3. **Test the API endpoint**:
   ```
   http://localhost:3001/api/google-analytics
   ```

## 📊 **What You'll See**

Your analytics page will now display:

### **Key Metrics**
- ✅ **Page Views Today**: Real-time page view count
- ✅ **Visitors Today**: Unique visitors today
- ✅ **Total Page Views**: All-time page views
- ✅ **Total Visitors**: All-time unique visitors

### **Charts & Data**
- ✅ **Top Pages**: Most visited pages on your Wix site
- ✅ **Traffic Sources**: Where your visitors come from
- ✅ **Recent Activity**: Live visitor activity
- ✅ **Auto-refresh**: Updates every 30 seconds

## 🔄 **Real-time Updates**

- **Auto-refresh**: Data updates automatically every 30 seconds
- **Manual refresh**: Click "Refresh Data" button
- **Live data**: Shows real visitor activity from your Wix site

## 🛠️ **Enable Real Data**

Once you have the API credentials set up:

1. **Update the API route** in `app/api/google-analytics/route.ts`
2. **Uncomment the real integration code** (lines 45-95)
3. **Restart the server** to load new environment variables

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Property ID not configured"**
   - Check that `GOOGLE_ANALYTICS_PROPERTY_ID` is set correctly
   - Verify the Property ID format (numbers only)

2. **"API key not valid"**
   - Ensure Google Analytics Data API is enabled
   - Check that the API key is correct
   - Verify the API key has proper permissions

3. **"No data showing"**
   - Check that your Wix site has Google Analytics properly connected
   - Verify there's recent traffic to your site
   - Check the Property ID matches your Wix site's analytics

### **Debug Steps:**

1. **Test the API endpoint directly**:
   ```bash
   curl http://localhost:3001/api/google-analytics
   ```

2. **Check environment variables**:
   ```bash
   grep -r "GOOGLE_ANALYTICS" .env*
   ```

3. **Verify Google Analytics setup**:
   - Check that Google Analytics is properly connected to your Wix site
   - Ensure there's recent traffic data

Your analytics page will now pull real data from your Wix website's Google Analytics! 🎉
