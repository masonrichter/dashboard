# Google Sheets AUM Integration Setup

This guide will help you connect your AUM page to your Google Sheet for real-time data.

## 📊 Your Google Sheet Structure

Your Google Sheet at [https://docs.google.com/spreadsheets/d/1Lrx7N1dLu4HUmjCrgkaYS03aL6QAPawKE3_agmKwUfA/edit](https://docs.google.com/spreadsheets/d/1Lrx7N1dLu4HUmjCrgkaYS03aL6QAPawKE3_agmKwUfA/edit) has the following structure:

| Column | Header | Description |
|--------|--------|-------------|
| A | Name | Client Name |
| B | Email | Client Email |
| C | AUM | Assets Under Management |
| D | YTD Growth | Year-to-Date Growth % |
| E | Status | Client Status |
| F | Onboarding Progress | Progress % |
| G | Last Activity | Last Activity Date |

## 🔧 Setup Steps

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://your-vercel-domain.vercel.app/auth/callback` (for production)
5. Copy the Client ID and Client Secret

### 3. Environment Variables

Add these to your `.env.local` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=1Lrx7N1dLu4HUmjCrgkaYS03aL6QAPawKE3_agmKwUfA

# For Vercel deployment, also add:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://your-vercel-domain.vercel.app/auth/callback
```

### 4. Share Your Google Sheet

1. Open your Google Sheet
2. Click "Share" in the top right
3. Add your Google account email with "Editor" permissions
4. Or make it "Anyone with the link" can view (for testing)

## 🚀 Enable Real Google Sheets Integration

Once you have OAuth set up, update the API route to use real data:

1. Open `app/api/aum/route.ts`
2. Uncomment the real integration code (lines 35-75)
3. Set up OAuth flow to get access tokens

## 📈 Data Mapping

The API will automatically map your Google Sheet data:

- **Total AUM**: Sum of all AUM values in column C
- **Client Count**: Number of rows with data
- **Average Account Size**: Total AUM / Client Count
- **Top Performers**: Top 5 clients sorted by AUM
- **Monthly Growth**: Average of YTD Growth values

## 🔄 Real-time Updates

Your AUM page will now:
- ✅ Load data from your Google Sheet on page load
- ✅ Show loading states while fetching data
- ✅ Display error messages if connection fails
- ✅ Provide a "Refresh Data" button to reload
- ✅ Calculate metrics automatically from your sheet data

## 🛠️ Additional Sheets (Optional)

You can create additional sheets in your Google Sheet for:

1. **MonthlyTrends**: Track AUM over time
2. **AssetAllocation**: Portfolio allocation data
3. **Transactions**: Recent transaction history

## 🔍 Testing

1. Visit `http://localhost:3000/aum`
2. You should see data loading from your Google Sheet
3. Check the browser console for any errors
4. Use the "Refresh Data" button to reload

## 🚨 Troubleshooting

### Common Issues:

1. **"Failed to fetch AUM data"**
   - Check if Google Sheets API is enabled
   - Verify OAuth credentials are correct
   - Ensure Google Sheet is shared properly

2. **"Access denied"**
   - Check Google Sheet sharing permissions
   - Verify OAuth scope includes `https://www.googleapis.com/auth/spreadsheets`

3. **Empty data**
   - Check if your Google Sheet has data in the expected columns
   - Verify the spreadsheet ID is correct

### Debug Steps:

1. Check browser console for errors
2. Test the API endpoint directly: `http://localhost:3000/api/aum`
3. Verify environment variables are set correctly
4. Check Google Cloud Console for API usage

## 📱 Next Steps

Once basic integration is working:

1. Add OAuth authentication flow
2. Implement real-time data updates
3. Add data validation and error handling
4. Create additional sheets for trends and transactions
5. Set up automated data refresh

Your AUM page is now ready to pull real data from your Google Sheet! 🎉
