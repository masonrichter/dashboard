// app/api/mailerlite/quick-send/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAndSendCustomCampaign, getGroups, syncCopperContactsToGroup } from '@/lib/mailerlite';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Quick Send Debug Start ===');

    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { 
      recipientType, 
      groupId, 
      tagId, 
      senderName, 
      senderEmail, 
      subject, 
      content,
      recipients // Add support for individual recipients
    } = body;

    // Validate required fields
    if (!senderName || !senderEmail || !subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: senderName, senderEmail, subject, content' },
        { status: 400 }
      );
    }

    // Determine recipient groups or emails based on the request
    let groupIds: string[] = [];
    let emails: string[] = [];
    
    if (recipientType === 'group' && groupId) {
      groupIds = [groupId];
    } else if (recipientType === 'tag' && tagId) {
      // For Copper tags, we'll need to get the corresponding MailerLite group
      // This would require additional logic to map Copper tags to MailerLite groups
      // For now, we'll use a default group or require the user to specify a group
      return NextResponse.json(
        { error: 'Copper tag integration requires mapping to MailerLite groups. Please use a MailerLite group instead.' },
        { status: 400 }
      );
    } else if (recipients && Array.isArray(recipients) && recipients.length > 0) {
      // If specific recipients are provided, use them as individual emails
      emails = recipients;
    }

    if (groupIds.length === 0 && emails.length === 0) {
      return NextResponse.json(
        { error: 'No valid recipients specified. Please provide either a group or individual email addresses.' },
        { status: 400 }
      );
    }

    // If we have individual emails, create a temporary group first
    if (emails.length > 0 && groupIds.length === 0) {
      console.log('Creating temporary MailerLite group for individual emails:', {
        emailCount: emails.length,
        subject: subject
      });

      // Create a temporary group name
      const tempGroupName = `Quick Send - ${subject} - ${new Date().toISOString().split('T')[0]}`;

      // Prepare contacts for the temporary group
      const tempContacts = emails.map(email => ({
        email: email,
        name: email.split('@')[0], // Use email prefix as name
        fields: {
          source: 'quick_send',
          subject: subject
        }
      }));

      // Sync contacts to temporary group
      const syncResult = await syncCopperContactsToGroup(
        tempContacts,
        tempGroupName
      );

      console.log('Temporary group created:', {
        groupId: syncResult.groupId,
        groupName: tempGroupName,
        addedCount: syncResult.addedCount
      });

      // Use the temporary group for sending
      groupIds = [syncResult.groupId];
    }

    // Create campaign name from subject
    const campaignName = `Quick Send: ${subject}`;

    console.log('Creating and sending quick campaign via MailerLite:', { 
      campaignName,
      subject, 
      contentLength: content.length,
      groupIds,
      senderName,
      senderEmail
    });

    // Use the createAndSendCustomCampaign function which handles the API better
    const sentCampaign = await createAndSendCustomCampaign(
      campaignName,
      subject,
      content, // HTML content
      content.replace(/<[^>]*>/g, ''), // Plain text version (strip HTML)
      groupIds,
      [], // segments
      undefined, // send immediately
      senderName,
      senderEmail,
      senderEmail // reply-to same as sender
    );

    console.log('Quick campaign sent successfully:', {
      campaignId: sentCampaign.id,
      status: sentCampaign.status,
      recipientsCount: sentCampaign.recipients_count
    });

    console.log('=== Quick Send Debug End - Success ===');

    return NextResponse.json({ 
      ok: true, 
      status: 'sent',
      message: 'Quick email sent successfully via MailerLite!',
      campaign: {
        id: sentCampaign.id,
        name: sentCampaign.name,
        status: sentCampaign.status,
        recipientsCount: sentCampaign.recipients_count
      }
    });

  } catch (err: any) {
    console.error('=== Quick Send Debug End - Error ===');
    console.error('Quick send error:', {
      message: err.message,
      stack: err.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to send quick email via MailerLite', 
        details: err.message
      },
      { status: 500 }
    );
  }
}
