import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api';

export async function GET(request: NextRequest) {
  try {
    if (!MAILERLITE_API_KEY) {
      return NextResponse.json({ error: 'MailerLite API key not configured' }, { status: 500 });
    }

    // Test different endpoints to see what's available
    const results: any = {};

    // Test 1: Get all subscribers
    try {
      const subscribersResponse = await axios.get(`${MAILERLITE_API_URL}/subscribers?limit=5`, {
        headers: {
          'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      results.subscribers = subscribersResponse.data;
    } catch (error: any) {
      results.subscribersError = error.response?.data || error.message;
    }

    // Test 2: Get campaigns
    try {
      const campaignsResponse = await axios.get(`${MAILERLITE_API_URL}/campaigns?limit=5`, {
        headers: {
          'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      results.campaigns = campaignsResponse.data;
    } catch (error: any) {
      results.campaignsError = error.response?.data || error.message;
    }

    // Test 3: If we have campaigns, try to get reports for the first one
    if (results.campaigns?.data?.length > 0) {
      const firstCampaignId = results.campaigns.data[0].id;
      try {
        const reportsResponse = await axios.get(`${MAILERLITE_API_URL}/campaigns/${firstCampaignId}/reports`, {
          headers: {
            'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        results.campaignReports = reportsResponse.data;
      } catch (error: any) {
        results.campaignReportsError = error.response?.data || error.message;
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}
