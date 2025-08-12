const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testRecentData() {
  try {
    console.log('🔍 Testing Recent Google Analytics Data...');
    
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    const baseUrl = 'https://analyticsdata.googleapis.com/v1beta';
    const propertyId = `properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}`;
    const headers = {
      'Authorization': `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json',
    };

    // Get current date and recent dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);

    const formatDate = (date) => date.toISOString().split('T')[0];

    console.log(`\n📊 Testing property: ${propertyId}`);
    console.log(`Today: ${formatDate(today)}`);
    console.log(`Yesterday: ${formatDate(yesterday)}`);
    console.log(`Last Week: ${formatDate(lastWeek)}`);
    console.log(`Last Month: ${formatDate(lastMonth)}`);

    // Test different recent date ranges
    const dateRanges = [
      { name: 'Today', startDate: formatDate(today), endDate: formatDate(today) },
      { name: 'Yesterday', startDate: formatDate(yesterday), endDate: formatDate(yesterday) },
      { name: 'Last 2 days', startDate: formatDate(yesterday), endDate: formatDate(today) },
      { name: 'Last 7 days', startDate: formatDate(lastWeek), endDate: formatDate(today) },
      { name: 'Last 30 days', startDate: formatDate(lastMonth), endDate: formatDate(today) },
    ];

    for (const range of dateRanges) {
      try {
        console.log(`\n🔍 Testing ${range.name} (${range.startDate} to ${range.endDate})...`);
        
        const response = await axios.post(
          `${baseUrl}/${propertyId}:runReport`,
          {
            dateRanges: [
              {
                startDate: range.startDate,
                endDate: range.endDate,
              },
            ],
            metrics: [
              { name: 'screenPageViews' },
              { name: 'totalUsers' },
              { name: 'sessions' },
            ],
          },
          { headers }
        );
        
        const data = response.data;
        const rows = data.rows || [];
        
        if (rows.length > 0) {
          const metrics = rows[0].metricValues;
          console.log(`✅ ${range.name}: Found data!`);
          console.log(`   Page Views: ${metrics[0].value}`);
          console.log(`   Users: ${metrics[1].value}`);
          console.log(`   Sessions: ${metrics[2].value}`);
        } else {
          console.log(`❌ ${range.name}: No data found`);
        }
        
      } catch (error) {
        console.log(`❌ ${range.name}: Error - ${error.response?.data?.error?.message || error.message}`);
      }
    }

    // Test with a broader date range to see if there's any data at all
    console.log('\n🔍 Testing broader date range (last 90 days)...');
    try {
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(today.getDate() - 90);
      
      const response = await axios.post(
        `${baseUrl}/${propertyId}:runReport`,
        {
          dateRanges: [
            {
              startDate: formatDate(ninetyDaysAgo),
              endDate: formatDate(today),
            },
          ],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'totalUsers' },
            { name: 'sessions' },
          ],
        },
        { headers }
      );
      
      const data = response.data;
      const rows = data.rows || [];
      
      if (rows.length > 0) {
        const metrics = rows[0].metricValues;
        console.log(`✅ Last 90 days: Found data!`);
        console.log(`   Page Views: ${metrics[0].value}`);
        console.log(`   Users: ${metrics[1].value}`);
        console.log(`   Sessions: ${metrics[2].value}`);
      } else {
        console.log(`❌ Last 90 days: No data found`);
      }
      
    } catch (error) {
      console.log(`❌ Last 90 days: Error - ${error.response?.data?.error?.message || error.message}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRecentData();
