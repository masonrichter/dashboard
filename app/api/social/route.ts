import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const makeWebhookUrl = 'https://hook.us2.make.com/qhqg2pvypyxucfr4hiuor1b3gghcubn8'
    const forwardForm = new FormData()

    // Process all fields from the incoming request
    for (const [key, value] of formData.entries()) {
      // Check if the value is a File object
      if (value instanceof File) {
        // Append the file with a consistent key and the original filename
        forwardForm.append('file', value, value.name)
      } else {
        // Append other fields normally
        forwardForm.append(key, value)
      }
    }

    // Map platform booleans to Buffer/Make profile IDs via environment variables
    const profileIds: string[] = []
    if (String(formData.get('linkedin')) === 'true' && process.env.BUFFER_LINKEDIN_PROFILE_ID) {
      profileIds.push(process.env.BUFFER_LINKEDIN_PROFILE_ID)
    }
    if (String(formData.get('instagram')) === 'true' && process.env.BUFFER_INSTAGRAM_PROFILE_ID) {
      profileIds.push(process.env.BUFFER_INSTAGRAM_PROFILE_ID)
    }
    if (String(formData.get('facebook')) === 'true' && process.env.BUFFER_FACEBOOK_PROFILE_ID) {
      profileIds.push(process.env.BUFFER_FACEBOOK_PROFILE_ID)
    }

    if (profileIds.length > 0) {
      forwardForm.append('profile_ids', JSON.stringify(profileIds))
    }

    // Debug: Log what's being sent
    console.log('Forwarding to Make.com with fields:')
    for (const [key, value] of forwardForm.entries()) {
      if (typeof value === 'string') {
        console.log(`${key}: ${value.substring(0, 50)}...`)
      } else {
        console.log(`${key}: [File] ${value.name}`)
      }
    }

    const makeResponse = await fetch(makeWebhookUrl, {
      method: 'POST',
      body: forwardForm,
      // @ts-ignore
      duplex: 'half',
    })

    if (!makeResponse.ok) {
      const errorText = await makeResponse.text()
      console.error('Make.com error:', errorText)
      return NextResponse.json({ message: 'Failed to send to Make.com', error: errorText }, { status: makeResponse.status })
    }

    const resultText = await makeResponse.text()
    return NextResponse.json({ ok: true, result: resultText })
  } catch (error) {
    console.error('API /api/social error:', error)
    return NextResponse.json({ message: 'Unexpected error', error: (error as Error).message }, { status: 500 })
  }
}