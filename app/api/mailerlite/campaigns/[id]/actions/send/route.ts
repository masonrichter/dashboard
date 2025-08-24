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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!ML_KEY) {
      return NextResponse.json({ error: 'Missing MAILERLITE_API_KEY' }, { status: 500 });
    }

    const { id } = params;
    const { groups, emails } = await request.json();

    // Validate the campaign exists and is a draft
    const campaignResponse = await mailerliteApi.get(`/campaigns/${id}`);
    const campaign = campaignResponse.data?.data;

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { error: 'Campaign is not in draft status' },
        { status: 400 }
      );
    }

    // Update recipients if provided
    if (groups || emails) {
      const recipients: any = {};
      
      if (groups && groups.length > 0) {
        recipients.groups = groups;
      }
      
      if (emails && emails.length > 0) {
        recipients.emails = emails;
      }

      await mailerliteApi.put(`/campaigns/${id}`, {
        recipients
      });
    }

    // Send the campaign
    const sendResponse = await mailerliteApi.post(`/campaigns/${id}/actions/send`);

    // Get updated campaign info
    const updatedCampaignResponse = await mailerliteApi.get(`/campaigns/${id}`);
    const updatedCampaign = updatedCampaignResponse.data?.data;

    return NextResponse.json({
      ok: true,
      campaignId: id,
      message: 'Campaign sent successfully',
      campaign: {
        id: updatedCampaign.id,
        name: updatedCampaign.name,
        subject: updatedCampaign.subject,
        status: updatedCampaign.status,
        sent_at: updatedCampaign.sent_at,
        recipients_count: updatedCampaign.recipients_count || 0,
        trackingUrl: `https://dashboard.mailerlite.com/campaigns/${id}`,
        analytics: {
          campaignId: id,
          dashboardUrl: `https://dashboard.mailerlite.com/campaigns/${id}`,
          apiEndpoint: `/api/mailerlite/campaigns/${id}/analytics`
        }
      }
    });
  } catch (err: any) {
    console.error('Error sending campaign:', err);
    return NextResponse.json(
      { 
        error: 'Failed to send campaign', 
        details: err.response?.data || err.message 
      },
      { status: 500 }
    );
  }
}
