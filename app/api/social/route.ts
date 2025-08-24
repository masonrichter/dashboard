// /app/api/social/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Checks if a given URL is publicly accessible and points to an image.
 * This is done by performing a HEAD request to avoid downloading the entire image.
 * @param url The URL to check.
 * @returns A Promise that resolves to true if the URL is a public image, otherwise false.
 */
async function isImageUrlPublic(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const isImage = response.headers.get('content-type')?.startsWith('image/');
    // A 200 OK status and an image content type confirm it's a public image.
    return response.ok && !!isImage;
  } catch (error) {
    // Any fetch error (e.g., DNS issues, network problems) means the URL is not accessible.
    console.error(`Error validating URL: ${url}`, error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const makeWebhookUrl = 'https://hook.us2.make.com/qhqg2pvypyxucfr4hiuor1b3gghcubn8';

    // 1) Read JSON body
    const ct = req.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return NextResponse.json({ message: 'Unsupported content-type. Please use application/json.' }, { status: 415 });
    }

    const body = await req.json();
    const image_url = body.image_url || '';
    const text = body.text || '';
    const linkedin = !!body.linkedin;
    const instagram = !!body.instagram;
    const facebook = !!body.facebook;
    const passthrough: Record<string, string> = {};

    for (const [k, v] of Object.entries(body)) {
      if (['image_url', 'text', 'linkedin', 'instagram', 'facebook'].includes(k)) continue;
      if (typeof v === 'string') passthrough[k] = v;
    }

    // 2) Validate the image URL.
    if (image_url && !await isImageUrlPublic(image_url)) {
      return NextResponse.json(
        { message: 'Invalid or inaccessible image URL provided. Please use a publicly accessible URL.' },
        { status: 400 }
      );
    }
    
    // 3) Build Buffer profile IDs from env + booleans
    const profileIds: string[] = [];
    if (linkedin && process.env.BUFFER_LINKEDIN_PROFILE_ID) {
      profileIds.push(process.env.BUFFER_LINKEDIN_PROFILE_ID);
    }
    if (instagram && process.env.BUFFER_INSTAGRAM_PROFILE_ID) {
      profileIds.push(process.env.BUFFER_INSTAGRAM_PROFILE_ID);
    }
    if (facebook && process.env.BUFFER_FACEBOOK_PROFILE_ID) {
      profileIds.push(process.env.BUFFER_FACEBOOK_PROFILE_ID);
    }

    // 4) Prepare JSON payload to Make
    const payload = {
      image_url,
      text,
      profile_ids: profileIds,
      ...passthrough,
    };

    // (Optional) Debug
    console.log('Forwarding to Make with:', payload);

    // 5) Forward to Make with JSON body and explicit headers
    const makeRes = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const resultText = await makeRes.text();
    if (!makeRes.ok) {
      console.error('Make.com error:', resultText);
      return NextResponse.json(
        { message: 'Failed to send to Make.com', error: resultText },
        { status: makeRes.status }
      );
    }

    return NextResponse.json({ ok: true, result: resultText });
  } catch (error: any) {
    console.error('API /api/social error:', error);
    return NextResponse.json({ message: 'Unexpected error', error: error.message }, { status: 500 });
  }
}