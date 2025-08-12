# Quick Google Sheets Setup

To enable real-time data from your Google Sheet, follow these steps:

## 1. Get Google Sheets API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

## 2. Add Environment Variable

Add this to your `.env.local` file:

```env
GOOGLE_SHEETS_API_KEY=your_api_key_here
```

## 3. Share Your Google Sheet

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1Lrx7N1dLu4HUmjCrgkaYS03aL6QAPawKE3_agmKwUfA/edit
2. Click "Share" in the top right
3. Change to "Anyone with the link" can view
4. Click "Done"

## 4. Test the Integration

1. Restart your development server: `npm run dev`
2. Visit `http://localhost:3000/aum`
3. You should see real data from your Google Sheet!

## Features

✅ **Real-time data** from your Google Sheet  
✅ **Auto-refresh** every 30 seconds  
✅ **Manual refresh** button  
✅ **Last updated** timestamp  
✅ **Loading states** and error handling  
✅ **Automatic calculations** of totals and metrics  

Your AUM page will now automatically pull and display data from your Google Sheet! 🎉
