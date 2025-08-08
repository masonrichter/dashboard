// app/api/mailerlite/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api';

export async function GET(request: NextRequest) {
  try {
    if (!MAILERLITE_API_KEY) {
      return NextResponse.json({ error: 'MailerLite API key not configured' }, { status: 500 });
    }

    const campaignsUrl = `${MAILERLITE_API_URL}/campaigns?filter[status]=draft`;

    const response = await axios.get(campaignsUrl, {
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const campaigns = response.data.data?.map((campaign: any) => ({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      created_at: campaign.created_at,
    })) || [];

    return NextResponse.json(campaigns);
  } catch (error: any) {
    console.error('FETCH ERROR:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: 'Failed to fetch MailerLite campaigns',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}