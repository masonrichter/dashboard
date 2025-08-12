import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_SHEETS_SPREADSHEET_ID = '1Lrx7N1dLu4HUmjCrgkaYS03aL6QAPawKE3_agmKwUfA'

export async function GET(request: NextRequest) {
  try {
    const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    
    if (!GOOGLE_SHEETS_API_KEY) {
      return NextResponse.json({
        error: 'GOOGLE_SHEETS_API_KEY not set',
        status: 'missing_api_key'
      })
    }

    // Test the Google Sheets API
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_SPREADSHEET_ID}/values/A:H?key=${GOOGLE_SHEETS_API_KEY}`
    )
    
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({
        error: 'Failed to fetch from Google Sheets',
        status: 'api_error',
        details: errorData
      })
    }

    const data = await response.json()
    const sheetData = data.values || []
    
    return NextResponse.json({
      status: 'success',
      rowCount: sheetData.length,
      firstRow: sheetData[0] || [],
      sampleData: sheetData.slice(1, 3) // First 2 data rows
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Test failed',
      status: 'error',
      details: error.message
    })
  }
}
