// Test script for client sync to Google Sheets
const testClientData = {
  id: 12345,
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1-555-0123",
  company: "Test Company",
  title: "CEO",
  address: "123 Test Street",
  city: "Test City",
  details: "This is a test client with extra details that should be synced to Google Sheets",
  tags: ["test", "client", "demo"],
  lastModified: new Date().toISOString()
}

async function testClientSync() {
  try {
    console.log('Testing client sync to Google Sheets...')
    
    const response = await fetch('http://localhost:3003/api/clients/sync-to-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientData: testClientData }),
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Success:', result.message)
    } else {
      console.log('❌ Error:', result.error)
      console.log('Details:', result.details)
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

// Run the test
testClientSync()
