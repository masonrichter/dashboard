import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Get your MailerLite API key from environment variables
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;

export async function POST(request: NextRequest) {
  try {
    console.log('--- MailerLite Group Creation Request Start ---');
    
    const formData = await request.formData();
    const groupName = formData.get('name') as string;
    const subscribersData = formData.get('subscribers') as string;
    
    console.log('Group Name:', groupName);
    console.log('Subscribers Data:', subscribersData);

    if (!MAILERLITE_API_KEY) {
      console.error('API key not found');
      return NextResponse.json({ error: 'MailerLite API key not configured' }, { status: 500 });
    }

    if (!groupName) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    if (!subscribersData) {
      return NextResponse.json({ error: 'Subscribers data is required' }, { status: 400 });
    }

    const selectedContactIds = JSON.parse(subscribersData);
    
    if (!Array.isArray(selectedContactIds) || selectedContactIds.length === 0) {
      return NextResponse.json({ error: 'No contacts selected' }, { status: 400 });
    }

    const headers = {
      'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Step 1: Get contact details from Copper
    console.log('Step 1: Fetching contact details from Copper...');
    const copperResponse = await fetch('/api/copper/people');
    if (!copperResponse.ok) {
      throw new Error('Failed to fetch contacts from Copper');
    }
    
    const allContacts = await copperResponse.json();
    const selectedContacts = allContacts.filter((contact: any) => 
      selectedContactIds.includes(contact.id)
    );

    // Step 2: Create MailerLite group
    console.log('Step 2: Creating MailerLite group...');
    const groupResponse = await axios.post(
      'https://connect.mailerlite.com/api/groups',
      { name: groupName },
      { headers }
    );
    
    const newGroupId = groupResponse.data.data.id;
    console.log(`Successfully created group with ID: ${newGroupId}`);

    // Step 3: Add subscribers to the group
    console.log('Step 3: Adding subscribers to the group...');
    const subscribers = selectedContacts
      .filter((contact: any) => contact.email) // Only include contacts with emails
      .map((contact: any) => ({
        email: contact.email,
        fields: {
          name: contact.name || '',
          company: contact.company || '',
          tags: contact.tags ? contact.tags.join(', ') : ''
        }
      }));

    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'No valid contacts with email addresses found' }, { status: 400 });
    }

    const subscribersPayload = {
      subscribers: subscribers
    };

    await axios.post(
      `https://connect.mailerlite.com/api/groups/${newGroupId}/subscribers`,
      subscribersPayload,
      { headers }
    );

    console.log(`Successfully added ${subscribers.length} subscribers to group ${newGroupId}`);

    console.log('--- MailerLite Group Creation Request End - Success ---');
    
    return NextResponse.json({
      ok: true,
      status: 'success',
      message: 'Group created and subscribers added successfully!',
      group: {
        id: newGroupId,
        name: groupName,
        subscribers_count: subscribers.length
      }
    }, { status: 200 });

  } catch (err: any) {
    console.error('--- MailerLite Group Creation Request End - Error ---');
    console.error('Error message:', err.message);
    if (err.response) {
      console.error('API Error details:', err.response.data);
    }
    return NextResponse.json(
      { error: 'Failed to create group and add subscribers.', details: err.response?.data?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}
