const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testDataStreams() {
  try {
    console.log('🔍 Testing Google Analytics Data Streams...');
    
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
    const headers = {
      'Authorization': `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json',
    };

    // Test different property ID formats
    const propertyFormats = [
      `properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}`,
      process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
    ];

    for (const propertyId of propertyFormats) {
      console.log(`\n📊 Testing property format: ${propertyId}`);
      
      try {
        // First, try to get the property metadata to see available data streams
        const metadataResponse = await axios.get(
          `${baseUrl}/${propertyId}/metadata`,
          { headers }
        );
        
        console.log('✅ Successfully accessed property metadata');
        console.log('Available metrics:', metadataResponse.data.metrics?.length || 0);
        console.log('Available dimensions:', metadataResponse.data.dimensions?.length || 0);
        
        // Now test with a simple query
        const today = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0];
        
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
          console.log(`✅ Found data with property format: ${propertyId}`);
          console.log(`   Page Views: ${metrics[0].value}`);
          console.log(`   Users: ${metrics[1].value}`);
          return propertyId; // This format works!
        } else {
          console.log(`❌ No data found with property format: ${propertyId}`);
        }
        
      } catch (error) {
        console.log(`❌ Error with property format ${propertyId}: ${error.response?.data?.error?.message || error.message}`);
      }
    }

    // If we get here, try to list all properties the service account has access to
    console.log('\n🔍 Trying to list all accessible properties...');
    try {
      const response = await axios.get(`${baseUrl}/properties`, { headers });
      console.log('✅ Successfully listed properties');
      console.log('Available properties:', response.data);
    } catch (error) {
      console.log('❌ Could not list properties:', error.response?.data?.error?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDataStreams();
