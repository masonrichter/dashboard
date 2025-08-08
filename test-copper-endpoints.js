const axios = require('axios');

const COPPER_API_KEY = '84f6e8d1b030589f85df038f6fc7f78f';
const COPPER_BASE_URL = 'https://api.copper.com';
const COPPER_USER_EMAIL = 'glenn@avistamail.net';

console.log('=== Testing Different Copper API Endpoints ===');
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

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🔍 Testing ${endpoint}...`);
    const response = await copperApi.get(endpoint);
    console.log(`✅ SUCCESS: ${endpoint}`);
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Data type:', typeof response.data);
    
    if (typeof response.data === 'string') {
      if (response.data.includes('<!DOCTYPE html>')) {
        console.log('❌ Returns HTML (likely redirect to login page)');
      } else if (response.data.trim().startsWith('[') || response.data.trim().startsWith('{')) {
        console.log('✅ Returns JSON-like data');
        console.log('Data length:', response.data.length);
        console.log('First 200 chars:', response.data.substring(0, 200));
      } else {
        console.log('❓ Returns unknown format');
        console.log('First 200 chars:', response.data.substring(0, 200));
      }
    } else {
      console.log('✅ Returns object/array');
      console.log('Data length:', response.data.length || 'N/A');
    }
    
  } catch (error) {
    console.log(`❌ FAILED: ${endpoint}`);
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error:', error.message);
  }
}

async function testAllEndpoints() {
  const endpoints = [
    '/companies',
    '/v1/companies', 
    '/developer_api/v1/companies',
    '/people',
    '/v1/people',
    '/developer_api/v1/people',
    '/contacts',
    '/v1/contacts',
    '/developer_api/v1/contacts'
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
}

testAllEndpoints(); 