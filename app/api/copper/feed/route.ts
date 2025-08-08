import { NextResponse } from 'next/server'

// Replace with your actual Copper API details
const COPPER_API_TOKEN = 'a486bc68985ec28b22ea3328e0b2ee06'
const COPPER_USER_EMAIL = 'glenn@avistamail.net'
const API_URL = 'https://api.copper.com/developer_api/v1'

export async function GET() {
  if (!COPPER_API_TOKEN || !COPPER_USER_EMAIL) {
    return NextResponse.json({ error: 'Copper API credentials are not set.' }, { status: 500 })
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'X-PW-AccessToken': COPPER_API_TOKEN,
        'X-PW-Application': 'developer_api',
        'X-PW-UserEmail': COPPER_USER_EMAIL,
        'Content-Type': 'application/json',
      },
      // You can customize this payload to filter the feed
      body: JSON.stringify({
        // For example, to get recent activity feed
        page_size: 10,
        sort_by: 'created_at',
        sort_direction: 'desc',
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Copper API Error:', errorText)
      throw new Error('Failed to fetch data from Copper API')
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}