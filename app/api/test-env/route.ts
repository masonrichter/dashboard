import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('=== Environment Variables Test ===')
  console.log('COPPER_API_KEY:', process.env.COPPER_API_KEY ? 'SET' : 'NOT SET')
  console.log('COPPER_BASE_URL:', process.env.COPPER_BASE_URL)
  console.log('COPPER_USER_EMAIL:', process.env.COPPER_USER_EMAIL)
  console.log('==================================')
  
  return NextResponse.json({
    copperApiKey: process.env.COPPER_API_KEY ? 'SET' : 'NOT SET',
    copperBaseUrl: process.env.COPPER_BASE_URL,
    copperUserEmail: process.env.COPPER_USER_EMAIL,
  })
} 