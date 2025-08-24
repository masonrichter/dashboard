import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { postContent, scheduledDate, platforms, media, linkedin, instagram, facebook } = await req.json()

    // NOTE: Replace this URL with your actual Make.com webhook URL
    const makeWebhookUrl = 'https://hook.us2.make.com/qhqg2pvypyxucfr4hiuor1b3gghcubn8'

    const payload = {
      postContent,
      scheduledDate,
      platforms,
      media,
      linkedin: Boolean(linkedin),
      instagram: Boolean(instagram),
      facebook: Boolean(facebook),
    }

    const makeResponse = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!makeResponse.ok) {
      const makeError = await makeResponse.json()
      console.error('Make.com Error:', makeError)
      return NextResponse.json({ message: 'Failed to send data to Make.com', error: makeError }, { status: 500 })
    }

    return NextResponse.json({ message: 'Post scheduled successfully' }, { status: 200 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 })
  }
}