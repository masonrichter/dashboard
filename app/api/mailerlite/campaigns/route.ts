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

    // Get sent campaigns (increase limit to get more recent campaigns)
    const campaignsUrl = `${MAILERLITE_API_URL}/campaigns?filter[status]=sent&limit=100`;

    const response = await axios.get(campaignsUrl, {
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const campaigns = response.data.data || [];

    // Use the stats data that's already included in the campaign response
    const campaignsWithAnalytics = campaigns
      .map((campaign: any) => {
        return {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          subject: campaign.subject,
          created_at: campaign.created_at,
          updated_at: campaign.updated_at,
          send_time: campaign.send_time,
          finished_at: campaign.finished_at,
          recipients_count: campaign.recipients_count || 0,
          opened_count: campaign.opened_count || 0,
          clicked_count: campaign.clicked_count || 0,
          unsubscribed_count: campaign.unsubscribed_count || 0,
          bounced_count: campaign.bounced_count || 0,
          opened_rate: campaign.opened_rate || 0,
          clicked_rate: campaign.clicked_rate || 0,
          unsubscribed_rate: campaign.unsubscribed_rate || 0,
          bounced_rate: campaign.bounced_rate || 0,
        };
      })
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Sort by creation date descending

    return NextResponse.json(campaignsWithAnalytics);
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