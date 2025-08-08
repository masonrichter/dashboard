'use server';

import { NextResponse } from 'next/server';

export async function sendMailerliteCampaign(campaignId: string, clientIds: number[]) {
  const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;

  if (!MAILERLITE_API_KEY) {
    return {
      success: false,
      message: 'MailerLite API key not configured'
    };
  }

  try {
    if (!campaignId || clientIds.length === 0) {
      return {
        success: false,
        message: 'Invalid request data or no subscribers selected'
      };
    }

    const apiUrl = `https://api.mailerlite.com/api/v2/campaigns/${campaignId}/send`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MAILERLITE_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ clientIds }),
    });

    // Check for a non-ok response and parse the error
    if (!response.ok) {
      const errorResult = await response.json();
      console.error('MailerLite API error:', errorResult);
      
      let errorMessage = 'An unknown MailerLite API error occurred.';
      if (errorResult.message) {
          errorMessage = errorResult.message;
      } else if (errorResult.errors && errorResult.errors[0]) {
          errorMessage = errorResult.errors[0].message;
      }

      return {
        success: false,
        message: `MailerLite API error: ${errorMessage}`
      };
    }
    
    // If the response is OK, handle it as a success
    const successResult = await response.json();
    console.log('Campaign sent successfully:', successResult);
    return {
      success: true,
      message: 'Campaign sent successfully'
    };

  } catch (error) {
    console.error('Failed to send MailerLite campaign:', error);
    return {
      success: false,
      message: 'Failed to send campaign'
    };
  }
}