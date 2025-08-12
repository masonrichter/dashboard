const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testPermissions() {
  try {
    console.log('🔍 Testing Google Analytics Permissions and Data Streams...');
    
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

    console.log(`\n📊 Testing property: ${propertyId}`);
    console.log(`Service Account: ${process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_EMAIL}`);

    // Test different metrics to see if any work
    const testMetrics = [
      'screenPageViews',
      'totalUsers', 
      'sessions',
      'eventCount',
      'userEngagementDuration',
      'newUsers',
      'activeUsers',
      'totalRevenue',
      'transactions',
      'itemRevenue'
    ];

    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];

    for (const metric of testMetrics) {
      try {
        console.log(`\n🔍 Testing metric: ${metric}`);
        
        const response = await axios.post(
          `${baseUrl}/${propertyId}:runReport`,
          {
            dateRanges: [
              {
                startDate: formatDate(today),
                endDate: formatDate(today),
              },
            ],
            metrics: [
              { name: metric },
            ],
          },
          { headers }
        );
        
        const data = response.data;
        const rows = data.rows || [];
        
        if (rows.length > 0) {
          const value = rows[0].metricValues[0].value;
          console.log(`✅ ${metric}: ${value}`);
        } else {
          console.log(`❌ ${metric}: No data`);
        }
        
      } catch (error) {
        console.log(`❌ ${metric}: Error - ${error.response?.data?.error?.message || error.message}`);
      }
    }

    // Test with a much broader date range
    console.log('\n🔍 Testing with broader date range (last year)...');
    try {
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      
      const response = await axios.post(
        `${baseUrl}/${propertyId}:runReport`,
        {
          dateRanges: [
            {
              startDate: formatDate(lastYear),
              endDate: formatDate(today),
            },
          ],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'totalUsers' },
          ],
        },
        { headers }
      );
      
      const data = response.data;
      const rows = data.rows || [];
      
      if (rows.length > 0) {
        const metrics = rows[0].metricValues;
        console.log(`✅ Last year: Found data!`);
        console.log(`   Page Views: ${metrics[0].value}`);
        console.log(`   Users: ${metrics[1].value}`);
      } else {
        console.log(`❌ Last year: No data found`);
      }
      
    } catch (error) {
      console.log(`❌ Last year: Error - ${error.response?.data?.error?.message || error.message}`);
    }

    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('1. Check if the service account has "Viewer" permissions on the property');
    console.log('2. Check if the service account has access to specific data streams');
    console.log('3. Verify that data is being collected in the property');
    console.log('4. Check if there are any data retention or privacy settings blocking access');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPermissions();
