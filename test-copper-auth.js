const axios = require('axios');

const COPPER_API_KEY = '84f6e8d1b030589f85df038f6fc7f78f';
const COPPER_USER_EMAIL = 'glenn@avistamail.net';

console.log('=== Testing Copper API Authentication ===');
console.log('API Key:', COPPER_API_KEY ? 'SET' : 'NOT SET');
console.log('User Email:', COPPER_USER_EMAIL);

// Test different base URLs
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
    // Try to get user info first
    console.log('Testing /user endpoint...');
    const userResponse = await copperApi.get('/user');
    console.log('✅ User endpoint SUCCESS!');
    console.log('User data:', userResponse.data);
    return true;
  } catch (userError) {
    console.log('❌ User endpoint failed:', userError.response?.status);
    
    // Try companies endpoint
    try {
      console.log('Testing /companies endpoint...');
      const companiesResponse = await copperApi.get('/companies');
      console.log('✅ Companies endpoint SUCCESS!');
      console.log('Status:', companiesResponse.status);
      console.log('Content-Type:', companiesResponse.headers['content-type']);
      
      if (typeof companiesResponse.data === 'string' && companiesResponse.data.includes('<!DOCTYPE html>')) {
        console.log('❌ Returns HTML (authentication failed)');
        return false;
      } else {
        console.log('✅ Returns data (authentication successful)');
        console.log('Data length:', companiesResponse.data.length || 'N/A');
        return true;
      }
    } catch (companiesError) {
      console.log('❌ Companies endpoint failed:', companiesError.response?.status);
      return false;
    }
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