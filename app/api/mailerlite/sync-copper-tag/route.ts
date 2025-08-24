// app/api/mailerlite/sync-copper-tag/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { syncCopperContactsToGroup, getOrCreateGroup } from '@/lib/mailerlite';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Copper Tag Sync Debug Start ===');

    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { tagName, contactIds, filterType } = body;

    if (!tagName || !contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: tagName and contactIds array' },
        { status: 400 }
      );
    }

    console.log('Syncing Copper contacts to MailerLite group:', { 
      tagName,
      contactCount: contactIds.length,
      filterType
    });

    // Get the base URL for the API call
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Fetch the contact details from Copper
    const contactsResponse = await fetch(`${baseUrl}/api/copper/people`);
    if (!contactsResponse.ok) {
      throw new Error('Failed to fetch Copper contacts');
    }

    const allContacts = await contactsResponse.json();
    
    // Filter contacts based on the provided IDs
    const selectedContacts = allContacts.filter((contact: any) => 
      contactIds.includes(contact.id)
    );

    if (selectedContacts.length === 0) {
      return NextResponse.json(
        { error: 'No valid contacts found for the provided IDs' },
        { status: 400 }
      );
    }

    // Prepare contacts for MailerLite sync
    const contactsForSync = selectedContacts.map((contact: any) => ({
      email: contact.email,
      name: contact.name,
      fields: {
        copper_id: contact.id.toString(),
        tags: contact.tags?.join(', ') || '',
        ...contact.fields // Include any additional Copper fields
      }
    }));

    // Create group name based on tag and filter type
    const groupName = filterType === 'all' 
      ? `Copper - ${tagName} (ALL)`
      : `Copper - ${tagName} (ANY)`;

    console.log('Syncing contacts to MailerLite group:', {
      groupName,
      contactCount: contactsForSync.length
    });

    // Sync contacts to MailerLite group
    console.log('About to sync contacts:', {
      contactCount: contactsForSync.length,
      groupName,
      firstContact: contactsForSync[0]
    });
    
    const syncResult = await syncCopperContactsToGroup(
      contactsForSync,
      groupName
    );

    console.log('Sync completed successfully:', {
      groupId: syncResult.groupId,
      addedCount: syncResult.addedCount,
      errors: syncResult.errors.length,
      groupName: groupName
    });

    // Verify the group was created by trying to fetch it
    try {
      const { getGroups } = await import('@/lib/mailerlite');
      const groups = await getGroups(1000);
      const createdGroup = groups.find(g => g.id === syncResult.groupId);
      console.log('Group verification:', {
        groupFound: !!createdGroup,
        groupName: createdGroup?.name,
        groupId: syncResult.groupId,
        totalGroups: groups.length
      });
    } catch (error) {
      console.error('Error verifying group:', error);
    }

    console.log('=== Copper Tag Sync Debug End - Success ===');

    return NextResponse.json({ 
      ok: true, 
      status: 'synced',
      message: `Successfully synced ${syncResult.addedCount} contacts to MailerLite group "${groupName}"`,
      group: {
        id: syncResult.groupId,
        name: groupName,
        contactCount: syncResult.addedCount
      },
      errors: syncResult.errors
    });

  } catch (err: any) {
    console.error('=== Copper Tag Sync Debug End - Error ===');
    console.error('Copper tag sync error:', {
      message: err.message,
      stack: err.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to sync Copper tag to MailerLite group', 
        details: err.message
      },
      { status: 500 }
    );
  }
}
