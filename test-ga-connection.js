const { GoogleAuth } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function testGoogleAnalyticsConnection() {
  try {
    console.log('Testing Google Analytics Connection...');
    console.log('Property ID:', process.env.GOOGLE_ANALYTICS_PROPERTY_ID);
    console.log('Service Account Email:', process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_EMAIL);
    console.log('Private Key exists:', !!process.env.GOOGLE_ANALYTICS_PRIVATE_KEY);

    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    console.log('✅ Successfully obtained access token');
    console.log('Token preview:', accessToken.token?.substring(0, 20) + '...');

    // Test listing properties
    const axios = require('axios');
    const baseUrl = 'https://analyticsdata.googleapis.com/v1beta';
    const headers = {
      'Authorization': `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json',
    };

    console.log('\n🔍 Testing property access...');
    
    try {
      const propertiesResponse = await axios.get(`${baseUrl}/properties`, { headers });
      console.log('✅ Successfully listed properties');
      console.log('Available properties:', propertiesResponse.data);
    } catch (error) {
      console.log('❌ Could not list properties');
      console.log('Error:', error.response?.data || error.message);
    }

    // Test specific property access
    const propertyId = `properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}`;
    console.log(`\n🔍 Testing access to property: ${propertyId}`);
    
    try {
      const testResponse = await axios.post(
        `${baseUrl}/${propertyId}:runReport`,
        {
          dateRanges: [
            {
              startDate: '2024-01-01',
              endDate: '2024-12-31',
            },
          ],
          metrics: [
            { name: 'screenPageViews' },
          ],
        },
        { headers }
      );
      
      console.log('✅ Successfully accessed property');
      console.log('Response data:', testResponse.data);
    } catch (error) {
      console.log('❌ Could not access property');
      console.log('Error:', error.response?.data || error.message);
      
      if (error.response?.status === 403) {
        console.log('\n🔧 SOLUTION: The service account needs access to this property.');
        console.log('Go to Google Analytics > Admin > Property Access Management');
        console.log('Add this email: analytics-dashboard@wix-analytics-468715.iam.gserviceaccount.com');
        console.log('Give it "Viewer" permissions');
      }
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testGoogleAnalyticsConnection();
