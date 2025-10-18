import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const COPPER_API_KEY = process.env.COPPER_API_KEY;
const COPPER_BASE_URL = 'https://api.copper.com/developer_api/v1';
const COPPER_USER_EMAIL = process.env.COPPER_USER_EMAIL;

const copperApi = axios.create({
  baseURL: COPPER_BASE_URL,
  headers: {
    'X-PW-AccessToken': COPPER_API_KEY!,
    'X-PW-Application': 'developer_api',
    'X-PW-UserEmail': COPPER_USER_EMAIL!,
    'Content-Type': 'application/json',
  },
});

function getEmail(emails: any[]): string {
  if (!emails || emails.length === 0) return 'No email';
  const emailObj = emails[0];
  return emailObj.email || emailObj.value || emailObj.address || 'No email';
}

function getPhoneNumber(phoneNumbers: any[]): string {
  if (!phoneNumbers || phoneNumbers.length === 0) return 'No phone number';
  const phoneObj = phoneNumbers[0];
  return phoneObj.number || phoneObj.number_value || phoneObj.value || 'No phone number';
}

export async function GET(request: NextRequest) {
  try {
    if (!COPPER_API_KEY || !COPPER_USER_EMAIL) {
      return NextResponse.json({ error: 'Copper API credentials not configured' }, { status: 500 });
    }

    const contactsByTag: Record<string, any[]> = {};
    const pageSize = 200;
    let pageNumber = 1;

    while (true) {
      const { data } = await copperApi.post('/people/search', {
        page_size: pageSize,
        page_number: pageNumber,
        // ❌ no contact_type_ids — includes ALL contact types
      });

      if (!data || data.length === 0) break;

      data.forEach((contact: any) => {
        const formattedContact = {
          id: contact.id,
          name: contact.name || 'Unknown Name',
          email: getEmail(contact.emails),
          phone: getPhoneNumber(contact.phone_numbers),
          company: contact.company_name || '',
        };

        if (contact.tags && contact.tags.length > 0) {
          contact.tags.forEach((tag: string) => {
            if (!contactsByTag[tag]) contactsByTag[tag] = [];
            contactsByTag[tag].push(formattedContact);
          });
        }
      });

      if (data.length < pageSize) break; // No more pages
      pageNumber++;
    }

    return NextResponse.json(contactsByTag);
  } catch (error: any) {
    console.error('Error fetching and organizing tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch and organize tags from Copper API', details: error.message },
      { status: 500 }
    );
  }
}