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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!ML_KEY) {
      return NextResponse.json({ error: 'Missing MAILERLITE_API_KEY' }, { status: 500 });
    }

    const campaignId = params.id;

    // Fetch campaign content
    const response = await mailerliteApi.get(`/campaigns/${campaignId}/content`);
    
    if (!response.data?.data) {
      throw new Error('Campaign content not found');
    }

    const content = response.data.data;

    return NextResponse.json({
      id: campaignId,
      html: content.html || '',
      plain_text: content.plain_text || '',
      subject: content.subject || '',
      from_name: content.from_name || '',
      from_email: content.from_email || '',
      reply_to: content.reply_to || ''
    });
  } catch (err: any) {
    console.error('Error fetching campaign content:', err);
    return NextResponse.json(
      { error: 'Failed to fetch campaign content', details: err.message },
      { status: 500 }
    );
  }
}
