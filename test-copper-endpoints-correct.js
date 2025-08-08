const axios = require('axios');

const COPPER_API_KEY = '84f6e8d1b030589f85df038f6fc7f78f';
const COPPER_USER_EMAIL = 'glenn@avistamail.net';

console.log('=== Testing Correct Copper API Endpoints ===');
console.log('API Key:', COPPER_API_KEY);
console.log('User Email:', COPPER_USER_EMAIL);

const copperApi = axios.create({
  baseURL: 'https://api.copper.com/developer_api/v1',
  headers: {
    'X-PW-AccessToken': COPPER_API_KEY,
    'X-PW-Application': 'developer_api',
    'X-PW-UserEmail': COPPER_USER_EMAIL,
    'Content-Type': 'application/json',
  },
});

async function testEndpoint(endpoint, method = 'GET', data = null) {
  try {
    console.log(`\n🔍 Testing ${method} ${endpoint}...`);
    
    let response;
    if (method === 'POST') {
      response = await copperApi.post(endpoint, data);
    } else {
      response = await copperApi.get(endpoint);
    }
    
    console.log(`✅ SUCCESS: ${method} ${endpoint}`);
    console.log('Status:', response.status);
    console.log('Data length:', response.data.length || 'N/A');
    
    if (response.data && response.data.length > 0) {
      console.log('First item:', {
        id: response.data[0].id,
        name: response.data[0].name
      });
    }
    
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${method} ${endpoint}`);
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error:', error.message);
    
    if (error.response?.data) {
      console.log('Response data:', error.response.data);
    }
    
    return false;
  }
}

async function testAllEndpoints() {
  // Test basic endpoints first
  await testEndpoint('/people');
  await testEndpoint('/companies');
  
  // Test search endpoints
  await testEndpoint('/people/search', 'POST', {});
  await testEndpoint('/people/search', 'POST', { person_filter_id: 1779467 });
  
  // Test filter endpoints
  await testEndpoint('/person_filters');
  await testEndpoint('/person_filters/1779467');
  
  // Test alternative endpoints
  await testEndpoint('/contacts');
  await testEndpoint('/contacts/search', 'POST', {});
}

testAllEndpoints(); 