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

    // Fetch campaign details
    const campaignResponse = await mailerliteApi.get(`/campaigns/${campaignId}`);
    
    if (!campaignResponse.data?.data) {
      throw new Error('Campaign not found');
    }

    const campaign = campaignResponse.data.data;

    // Fetch campaign reports/analytics
    let analytics = {};
    try {
      const analyticsResponse = await mailerliteApi.get(`/campaigns/${campaignId}/reports`);
      if (analyticsResponse.data?.data) {
        analytics = analyticsResponse.data.data;
      }
    } catch (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      // Use campaign data as fallback
      analytics = {
        recipients_count: campaign.recipients_count || 0,
        opened_count: campaign.opened_count || 0,
        clicked_count: campaign.clicked_count || 0,
        unsubscribed_count: campaign.unsubscribed_count || 0,
        bounce_count: campaign.bounce_count || 0,
        opened_rate: campaign.opened_rate || 0,
        clicked_rate: campaign.clicked_rate || 0,
        unsubscribed_rate: campaign.unsubscribed_rate || 0,
        bounce_rate: campaign.bounce_rate || 0
      };
    }

    return NextResponse.json({
      campaignId,
      name: campaign.name,
      subject: campaign.subject,
      status: campaign.status,
      sent_at: campaign.sent_at,
      created_at: campaign.created_at,
      analytics: {
        total_sent: analytics.recipients_count || campaign.recipients_count || 0,
        opened_count: analytics.opened_count || campaign.opened_count || 0,
        clicked_count: analytics.clicked_count || campaign.clicked_count || 0,
        unsubscribed_count: analytics.unsubscribed_count || campaign.unsubscribed_count || 0,
        bounce_count: analytics.bounce_count || campaign.bounce_count || 0,
        opened_rate: analytics.opened_rate || campaign.opened_rate || 0,
        clicked_rate: analytics.clicked_rate || campaign.clicked_rate || 0,
        unsubscribed_rate: analytics.unsubscribed_rate || campaign.unsubscribed_rate || 0,
        bounce_rate: analytics.bounce_rate || campaign.bounce_rate || 0
      },
      dashboardUrl: `https://dashboard.mailerlite.com/campaigns/${campaignId}`
    });
  } catch (err: any) {
    console.error('Error fetching campaign analytics:', err);
    return NextResponse.json(
      { error: 'Failed to fetch campaign analytics', details: err.message },
      { status: 500 }
    );
  }
}
