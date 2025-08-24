// app/api/mailerlite/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { generateEmailHTML } from '../../../../lib/templates';

// Get your MailerLite API key from environment variables
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;

export async function POST(request: NextRequest) {
  try {
    console.log('--- MailerLite API Request Start ---');
    const body = await request.json();
    console.log('Request payload:', JSON.stringify(body, null, 2));

    const { campaign, recipients, groupName, templateId, contentFields } = body;

    if (!MAILERLITE_API_KEY) {
      console.error('API key not found');
      return NextResponse.json({ error: 'MailerLite API key not configured' }, { status: 500 });
    }

    if (!campaign || !campaign.subject) {
      return NextResponse.json({ error: 'Missing required campaign fields (subject)' }, { status: 400 });
    }
    
    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
    }

    const headers = {
      'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // --- STEP 1: CREATE A TEMPORARY GROUP ---
    console.log('Step 1: Creating a temporary group...');
    const groupResponse = await axios.post(
      'https://connect.mailerlite.com/api/groups',
      { name: groupName || `Campaign Group - ${new Date().toISOString()}` },
      { headers }
    );
    const newGroupId = groupResponse.data.data.id;
    console.log(`Successfully created group with ID: ${newGroupId}`);

    // --- STEP 2: ADD RECIPIENTS TO THE NEW GROUP ---
    console.log('Step 2: Adding subscribers to the new group...');
    const subscribersPayload = {
      subscribers: recipients.map((email: string) => ({ email })),
    };
    await axios.post(
      `https://connect.mailerlite.com/api/groups/${newGroupId}/subscribers`,
      subscribersPayload,
      { headers }
    );
    console.log(`Successfully added ${recipients.length} subscribers to group ${newGroupId}`);

    // --- STEP 3: CREATE THE CAMPAIGN AND ATTACH CONTENT ---
    console.log('Step 3: Creating campaign and attaching content...');
    
    // Generate the full HTML content
    let finalContent = campaign.content;
    if (templateId) {
      try {
        finalContent = generateEmailHTML(
          templateId, 
          campaign.subject, 
          campaign.content,
          contentFields?.title,
          contentFields?.tagline,
          contentFields?.readMore
        );
        console.log('Generated HTML content using template:', templateId);
      } catch (error) {
        console.error('Error generating HTML from template:', error);
        // Fallback to original content
      }
    }
    
    const campaignPayload = {
      name: campaign.name,
      type: 'regular',
      subject: campaign.subject,
      groups: [newGroupId], // IMPORTANT: Pass the new group ID here
      from_name: 'Glenn Financial Services',
      from_email: 'noreply@glennfinancial.com',
      reply_to: 'support@glennfinancial.com',
      // Note: The new API combines content and creation in a single step
      content: {
        html: finalContent,
        plain: finalContent.replace(/<[^>]*>/g, ''), // Basic plain text
      },
    };

    const createResponse = await axios.post(
      'https://connect.mailerlite.com/api/campaigns',
      campaignPayload,
      { headers }
    );
    const campaignId = createResponse.data.data.id;
    console.log(`Successfully created campaign with ID: ${campaignId}`);

    // --- STEP 4: SEND THE CAMPAIGN ---
    console.log('Step 4: Sending the campaign...');
    const sendResponse = await axios.post(
      `https://connect.mailerlite.com/api/campaigns/${campaignId}/actions/send`,
      {}, // Empty body for a simple send action
      { headers }
    );

    console.log('--- MailerLite API Request End - Success ---');
    return NextResponse.json({
      ok: true,
      status: 'sent',
      message: 'Campaign sent successfully!',
      campaign: sendResponse.data.data,
    }, { status: 200 });

  } catch (err: any) {
    console.error('--- MailerLite API Request End - Error ---');
    console.error('Error message:', err.message);
    if (err.response) {
      console.error('API Error details:', err.response.data);
    }
    return NextResponse.json(
      { error: 'Failed to send campaign.', details: err.response?.data?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}