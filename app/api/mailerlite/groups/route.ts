// app/api/mailerlite/group/route.ts

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

export async function POST(request: NextRequest) {
  try {
    if (!ML_KEY) {
      return NextResponse.json({ error: 'Missing MAILERLITE_API_KEY' }, { status: 500 });
    }

    const { groupName, emails } = await request.json();

    if (!groupName || !emails || emails.length === 0) {
      return NextResponse.json(
        { error: 'Missing one of: groupName, emails' },
        { status: 400 }
      );
    }
    
    // Create a new group
    const createGroupRes = await mailerliteApi.post('/groups', { name: groupName });
    const groupId = createGroupRes.data.data.id;

    if (!groupId) {
      throw new Error('Failed to create new MailerLite group');
    }

    // Add each selected contact to the new group.
    await Promise.all(emails.map((email: string) => 
      mailerliteApi.post(`/subscribers`, { 
        email,
        groups: [groupId]
      })
    ));

    return NextResponse.json({ ok: true, groupId, groupName });
  } catch (err: any) {
    console.error('MailerLite error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });
    return NextResponse.json(
      { error: 'MailerLite API error', details: err.response?.data || err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!ML_KEY) {
      return NextResponse.json({ error: 'Missing MAILERLITE_API_KEY' }, { status: 500 });
    }

    const res = await mailerliteApi.get('/groups');
    const groups = res.data.data.map((group: any) => ({
      id: group.id,
      name: group.name,
      total: group.subscribers_count,
    }));

    return NextResponse.json(groups);
  } catch (err: any) {
    console.error('MailerLite error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });
    return NextResponse.json(
      { error: 'MailerLite API error', details: err.response?.data || err.message },
      { status: 500 }
    );
  }
}