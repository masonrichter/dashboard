const axios = require('axios');

const COPPER_API_KEY = '84f6e8d1b030589f85df038f6fc7f78f';
const COPPER_BASE_URL = 'https://api.copper.com';
const COPPER_USER_EMAIL = 'glenn@avistamail.net';

console.log('Testing Copper API...');
console.log('API Key:', COPPER_API_KEY ? 'SET' : 'NOT SET');
console.log('Base URL:', COPPER_BASE_URL);
console.log('User Email:', COPPER_USER_EMAIL);

const copperApi = axios.create({
  baseURL: COPPER_BASE_URL,
  headers: {
    'X-PW-AccessToken': COPPER_API_KEY,
    'X-PW-Application': 'developer_api',
    'X-PW-UserEmail': COPPER_USER_EMAIL,
    'Content-Type': 'application/json',
  },
});

async function testCopperAPI() {
  try {
    console.log('\n🔍 Testing /v1/people endpoint...');
    const response = await copperApi.get('/v1/people');
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Data length:', response.data.length);
    if (response.data.length > 0) {
      console.log('First contact:', {
        id: response.data[0].id,
        name: response.data[0].name,
        emails: response.data[0].emails
      });
    }
  } catch (error) {
    console.log('❌ FAILED /v1/people');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error:', error.message);
    if (error.response?.data) {
      console.log('Response data:', error.response.data);
    }
    
    // Try other endpoints
    const endpoints = ['/people', '/contacts', '/v2/people', '/v2/contacts'];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔍 Testing ${endpoint} endpoint...`);
        const response = await copperApi.get(endpoint);
        console.log(`✅ SUCCESS ${endpoint}!`);
        console.log('Status:', response.status);
        console.log('Data length:', response.data.length);
        return;
      } catch (endpointError) {
        console.log(`❌ FAILED ${endpoint}`);
        console.log('Status:', endpointError.response?.status);
        console.log('Status Text:', endpointError.response?.statusText);
      }
    }
    
    // Try companies as fallback
    try {
      console.log('\n🔍 Testing /companies endpoint...');
      const response = await copperApi.get('/companies');
      console.log('✅ SUCCESS /companies!');
      console.log('Status:', response.status);
      console.log('Data length:', response.data.length);
    } catch (companyError) {
      console.log('❌ FAILED /companies');
      console.log('Status:', companyError.response?.status);
      console.log('Status Text:', companyError.response?.statusText);
    }
  }
}

testCopperAPI(); 