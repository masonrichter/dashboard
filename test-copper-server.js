const axios = require('axios');

const COPPER_API_KEY = '84f6e8d1b030589f85df038f6fc7f78f';
const COPPER_BASE_URL = 'https://api.copper.com';
const COPPER_USER_EMAIL = 'glenn@avistamail.net';

console.log('=== Server-side Copper API Test ===');
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
    console.log('\n🔍 Testing /companies endpoint...');
    const response = await copperApi.get('/companies');
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Data type:', typeof response.data);
    console.log('Data length:', response.data.length);
    
    // Log the first 500 characters to see what we're getting
    console.log('\n📋 First 500 characters of response:');
    console.log(response.data.substring(0, 500));
    
    // Try to parse as JSON if it looks like JSON
    if (typeof response.data === 'string' && response.data.trim().startsWith('[')) {
      try {
        const jsonData = JSON.parse(response.data);
        console.log('\n✅ Successfully parsed as JSON!');
        console.log('JSON data length:', jsonData.length);
        if (jsonData.length > 0) {
          console.log('First item:', jsonData[0]);
        }
      } catch (parseError) {
        console.log('\n❌ Failed to parse as JSON:', parseError.message);
      }
    }
    
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error:', error.message);
    if (error.response?.data) {
      console.log('Response data (first 500 chars):', String(error.response.data).substring(0, 500));
    }
  }
}

testCopperAPI(); 