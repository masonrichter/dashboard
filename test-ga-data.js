const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testGoogleAnalyticsData() {
  try {
    console.log('🔍 Testing Google Analytics Data Availability...');
    
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

    // Test different date ranges to see if we can find any data
    const dateRanges = [
      { name: 'Last 7 days', startDate: '2024-12-01', endDate: '2024-12-31' },
      { name: 'Last 30 days', startDate: '2024-11-01', endDate: '2024-12-31' },
      { name: 'Last 90 days', startDate: '2024-09-01', endDate: '2024-12-31' },
      { name: 'Last 6 months', startDate: '2024-06-01', endDate: '2024-12-31' },
      { name: 'Last year', startDate: '2024-01-01', endDate: '2024-12-31' },
      { name: 'All time', startDate: '2020-01-01', endDate: '2024-12-31' },
    ];

    console.log(`\n📊 Testing property: ${propertyId}`);
    
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

    // Test if we can get any data at all by trying to list available metrics
    console.log('\n🔍 Testing available metrics...');
    try {
      const response = await axios.get(`${baseUrl}/properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}/metadata`, { headers });
      console.log('✅ Successfully accessed property metadata');
      console.log('Available metrics:', response.data.dimensions?.length || 0, 'dimensions and', response.data.metrics?.length || 0, 'metrics');
    } catch (error) {
      console.log('❌ Could not access property metadata:', error.response?.data?.error?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGoogleAnalyticsData();
