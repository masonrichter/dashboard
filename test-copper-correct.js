const axios = require('axios');

const COPPER_API_KEY = '84f6e8d1b030589f85df038f6fc7f78f';
const COPPER_USER_EMAIL = 'glenn@avistamail.net';

console.log('=== Testing Copper API with Correct Structure ===');
console.log('API Key:', COPPER_API_KEY);
console.log('User Email:', COPPER_USER_EMAIL);

// Test different base URL structures
const baseUrls = [
  'https://api.copper.com',
  'https://api.copper.com/developer_api/v1',
  'https://api.copper.com/v1'
];

async function testBaseUrl(baseUrl) {
  console.log(`\n🔍 Testing base URL: ${baseUrl}`);
  
  const copperApi = axios.create({
    baseURL: baseUrl,
    headers: {
      'X-PW-AccessToken': COPPER_API_KEY,
      'X-PW-Application': 'developer_api',
      'X-PW-UserEmail': COPPER_USER_EMAIL,
      'Content-Type': 'application/json',
    },
  });

  try {
    // Test the people/search endpoint with the filter ID
    console.log('Testing /people/search endpoint with filter ID 1779467...');
    const response = await copperApi.post('/people/search', {
      person_filter_id: 1779467
    });
    
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Data length:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('First contact:', {
        id: response.data[0].id,
        name: response.data[0].name,
        emails: response.data[0].emails?.length || 0
      });
    }
    
    return true;
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error:', error.message);
    
    if (error.response?.data) {
      console.log('Response data (first 200 chars):', String(error.response.data).substring(0, 200));
    }
    
    return false;
  }
}

async function testAllBaseUrls() {
  for (const baseUrl of baseUrls) {
    const success = await testBaseUrl(baseUrl);
    if (success) {
      console.log(`\n🎯 WORKING BASE URL FOUND: ${baseUrl}`);
      return baseUrl;
    }
  }
  console.log('\n❌ No working base URL found');
  return null;
}

testAllBaseUrls(); 