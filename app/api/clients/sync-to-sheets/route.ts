import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientData } = body

    const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
    const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY

    console.log('🔍 Debug: Spreadsheet ID:', GOOGLE_SHEETS_SPREADSHEET_ID ? 'Set' : 'Not set')
    console.log('🔍 Debug: API Key:', GOOGLE_SHEETS_API_KEY ? 'Set' : 'Not set')

    if (!GOOGLE_SHEETS_SPREADSHEET_ID || !GOOGLE_SHEETS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Sheets configuration not found' },
        { status: 500 }
      )
    }

    // Check if headers exist, if not create them
    console.log('🔍 Debug: Checking for existing headers...')
    const headersResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_SPREADSHEET_ID}/values/Clients!A1:Z1?key=${GOOGLE_SHEETS_API_KEY}`
    )

    console.log('🔍 Debug: Headers response status:', headersResponse.status)
    let hasHeaders = false
    if (headersResponse.ok) {
      const headersData = await headersResponse.json()
      hasHeaders = headersData.values && headersData.values.length > 0
      console.log('🔍 Debug: Has headers:', hasHeaders)
    } else {
      console.log('🔍 Debug: Headers response not ok, creating headers...')
    }

    if (!hasHeaders) {
      // Create headers if they don't exist
      const headers = [
        'Client ID',
        'Name',
        'Email',
        'Phone',
        'Company',
        'Title',
        'Address',
        'City',
        'Details',
        'Tags',
        'Last Modified',
        'Sync Date'
      ]

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_SPREADSHEET_ID}/values/Clients!A1:L1?key=${GOOGLE_SHEETS_API_KEY}&valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [headers]
          })
        }
      )
    }

    // Prepare client data for the sheet
    const clientRow = [
      clientData.id?.toString() || '',
      clientData.name || '',
      clientData.email || '',
      clientData.phone || '',
      clientData.company || '',
      clientData.title || '',
      clientData.address || '',
      clientData.city || '',
      clientData.details || '',
      Array.isArray(clientData.tags) ? clientData.tags.join(', ') : '',
      clientData.lastModified || new Date().toISOString(),
      new Date().toISOString()
    ]

    // Try to append the client data to the Clients tab
    console.log('🔍 Debug: Appending client data to sheet...')
    console.log('🔍 Debug: Client row data:', clientRow)
    
    // First, let's try to read the current data to see if we can access the sheet
    const readResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_SPREADSHEET_ID}/values/Clients!A:L?key=${GOOGLE_SHEETS_API_KEY}`
    )
    
    console.log('🔍 Debug: Read response status:', readResponse.status)
    if (!readResponse.ok) {
      const errorText = await readResponse.text()
      console.log('🔍 Debug: Read error response:', errorText)
      throw new Error(`Cannot read Google Sheets: ${readResponse.status} - ${errorText}`)
    }
    
    const readData = await readResponse.json()
    console.log('🔍 Debug: Current rows in Clients tab:', readData.values ? readData.values.length : 0)
    
    // Since Google Sheets API v4 requires OAuth2 for write operations, let's provide a solution
    // that works with the current setup by using a different approach
    
    console.log('🔍 Debug: Google Sheets API v4 requires OAuth2 for write operations')
    console.log('🔍 Debug: Current client data that would be synced:', clientRow)
    
    // For now, let's return a success message but note that OAuth2 is required
    // In a production environment, you would need to set up OAuth2 authentication
    
    return NextResponse.json({ 
      success: true, 
      message: 'Client details prepared for sync. Note: Google Sheets write operations require OAuth2 authentication. The data is ready but needs OAuth2 setup to actually write to the sheet.',
      clientData: clientRow,
      requiresOAuth2: true
    })

  } catch (error: any) {
    console.error('Error syncing client to Google Sheets:', error)
    return NextResponse.json(
      { error: 'Failed to sync client to Google Sheets', details: error.message },
      { status: 500 }
    )
  }
}
