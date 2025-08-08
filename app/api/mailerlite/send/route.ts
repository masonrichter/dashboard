// app/api/mailerlite/send/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ML_BASE = 'https://connect.mailerlite.com/api';
const ML_KEY = process.env.MAILERLITE_API_KEY;

const mailerliteApi = axios.create({
  baseURL: ML_BASE,
  headers: {
    'Authorization': `Bearer ${ML_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export async function POST(request: NextRequest) {
  try {
    if (!ML_KEY) {
      return NextResponse.json({ error: 'Missing MAILERLITE_API_KEY' }, { status: 500 });
    }

    const { groupId, subject, fromName, fromEmail, html } = await request.json();

    if (!groupId || !subject || !fromName || !fromEmail || !html) {
      return NextResponse.json(
        { error: 'Missing one of: groupId, subject, fromName, fromEmail, html' },
        { status: 400 }
      );
    }

    // Step 1: Create a new draft campaign.
    const createRes = await mailerliteApi.post('/campaigns', {
      name: subject,
      subject,
      type: 'regular',
      language: 'en',
      from: { name: fromName, email: fromEmail },
      recipients: {
        groups: [groupId],
        emails: []
      }
    });
    const campaignId = createRes.data?.data?.id;

    if (!campaignId) {
      throw new Error('MailerLite did not return a campaign ID');
    }

    // Step 2: Add the HTML content to the draft campaign.
    await mailerliteApi.put(`/campaigns/${campaignId}/content`, { html });

    // Step 3: Send the campaign now.
    await mailerliteApi.post(`/campaigns/${campaignId}/actions/send`);

    return NextResponse.json({ ok: true, campaignId });
  } catch (err: any) {
    console.error('MailerLite error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });
    return NextResponse.json(
      { error: 'MailerLite API error', details: err.response?.data || err.message },
      { status: 500 }
    );
  }
}