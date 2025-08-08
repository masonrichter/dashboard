// app/api/mailerlite/campaigns/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
  }

  try {
    if (!MAILERLITE_API_KEY) {
      return NextResponse.json({ error: 'MailerLite API key not configured' }, { status: 500 });
    }

    const campaignUrl = `${MAILERLITE_API_URL}/campaigns/${id}`;

    const response = await axios.get(campaignUrl, {
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const campaign = response.data.data;

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Handle different possible response structures
    let htmlContent = '';
    
    // Log the campaign structure for debugging
    console.log('Campaign structure keys:', Object.keys(campaign));
    
    if (campaign.attributes && campaign.attributes.html) {
      htmlContent = campaign.attributes.html;
    } else if (campaign.content && campaign.content.html) {
      htmlContent = campaign.content.html;
    } else if (campaign.html) {
      htmlContent = campaign.html;
    } else if (campaign.plain_text) {
      // If only plain text is available, convert it to HTML
      htmlContent = `<p>${campaign.plain_text.replace(/\n/g, '</p><p>')}</p>`;
    } else {
      console.log('Campaign structure:', JSON.stringify(campaign, null, 2));
      return NextResponse.json({ 
        error: 'HTML content not found in campaign response',
        availableKeys: Object.keys(campaign)
      }, { status: 404 });
    }

    return NextResponse.json({ html: htmlContent });

  } catch (error: any) {
    // THIS IS THE NEW LOG TO HELP DIAGNOSE THE PROBLEM
    console.error('MAILERLITE API FETCH ERROR:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: 'Failed to fetch MailerLite campaign content',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}