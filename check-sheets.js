// Script to check what's in the Google Sheets
require('dotenv').config({ path: '.env.local' })

const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY

async function checkSheets() {
  try {
    console.log('🔍 Checking Google Sheets content...')
    console.log('Spreadsheet ID:', GOOGLE_SHEETS_SPREADSHEET_ID)
    console.log('API Key:', GOOGLE_SHEETS_API_KEY ? 'Set' : 'Not set')
    
    if (!GOOGLE_SHEETS_SPREADSHEET_ID || !GOOGLE_SHEETS_API_KEY) {
      console.log('❌ Missing environment variables')
      return
    }

    // Check the main sheet (AUM data)
    console.log('\n📊 Checking main sheet (AUM data)...')
    const mainResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_SPREADSHEET_ID}/values/A:H?key=${GOOGLE_SHEETS_API_KEY}`
    )
    
    if (mainResponse.ok) {
      const mainData = await mainResponse.json()
      console.log('✅ Main sheet accessible')
      console.log('Rows in main sheet:', mainData.values ? mainData.values.length : 0)
      if (mainData.values && mainData.values.length > 0) {
        console.log('First few rows:')
        mainData.values.slice(0, 3).forEach((row, index) => {
          console.log(`Row ${index + 1}:`, row)
        })
      }
    } else {
      console.log('❌ Main sheet not accessible:', mainResponse.status)
    }

    // Check the Clients tab
    console.log('\n👥 Checking Clients tab...')
    const clientsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_SPREADSHEET_ID}/values/Clients!A:L?key=${GOOGLE_SHEETS_API_KEY}`
    )
    
    if (clientsResponse.ok) {
      const clientsData = await clientsResponse.json()
      console.log('✅ Clients tab accessible')
      console.log('Rows in Clients tab:', clientsData.values ? clientsData.values.length : 0)
      if (clientsData.values && clientsData.values.length > 0) {
        console.log('All rows in Clients tab:')
        clientsData.values.forEach((row, index) => {
          console.log(`Row ${index + 1}:`, row)
        })
      } else {
        console.log('No data found in Clients tab')
      }
    } else {
      console.log('❌ Clients tab not accessible:', clientsResponse.status)
      const errorText = await clientsResponse.text()
      console.log('Error details:', errorText)
    }

  } catch (error) {
    console.log('❌ Error checking sheets:', error.message)
  }
}

// Run the check
checkSheets()
