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
  if (!emails || emails.length === 0) {
    return 'No email';
  }
  const emailObj = emails[0];
  return emailObj.email || emailObj.value || emailObj.address || 'No email';
}

function getPhoneNumber(phoneNumbers: any[]): string {
  if (!phoneNumbers || phoneNumbers.length === 0) {
    return 'No phone number';
  }
  const phoneObj = phoneNumbers[0];
  return phoneObj.number || phoneObj.number_value || phoneObj.value || 'No phone number';
}

function getBirthdayFromCustomFields(customFields: any[]): string | null {
  if (!customFields || customFields.length === 0) {
    console.log('No custom fields found');
    return null;
  }
  
  for (const field of customFields) {
    if (field.custom_field_definition_id === 703490 && field.value) {
      const timestampInMs = field.value * 1000;
      const dateObject = new Date(timestampInMs);
      const isoDateString = dateObject.toISOString();
      const birthdayString = isoDateString.split('T')[0];
      
      console.log(`Found and converted birthday: ${birthdayString}`);
      return birthdayString;
    }
  }
  
  console.log('No birthday field found with ID 703490');
  return null;
}

export async function GET(request: NextRequest) {
  try {
    if (!COPPER_API_KEY || !COPPER_USER_EMAIL) {
      return NextResponse.json(
        { error: 'Copper API credentials not configured' },
        { status: 500 }
      );
    }
    
    const response = await copperApi.post('/people/search', {
      contact_type_ids: [2591754],
      page_size: 200, 
    });
    
    const currentCustomers = response.data;
    
    const contacts = currentCustomers.map((contact: any) => ({
      id: contact.id,
      name: contact.name || 'Unknown Name',
      firstName: contact.first_name || '',
      lastName: contact.last_name || '',
      email: getEmail(contact.emails),
      phone: getPhoneNumber(contact.phone_numbers),
      company: contact.company_name || '',
      title: contact.title || '',
      address: contact.address?.street || '',
      city: contact.address?.city || '',
      tags: contact.tags || [],
      lastModified: new Date(contact.date_modified * 1000).toISOString(),
      details: contact.details || '',
      websites: contact.websites || [],
      customFields: contact.custom_fields || [],
      birthday: getBirthdayFromCustomFields(contact.custom_fields),
    }));
    
    return NextResponse.json(contacts);
  } catch (error: any) {
    console.error('Copper API error:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: 'Failed to fetch contacts from Copper API',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const contactId = body.id;
    
    const updatePayload = {
      name: body.name,
      emails: [{ email: body.email, category: 'work' }],
      phone_numbers: [{ number: body.phone, category: 'work' }],
      company_name: body.company,
      title: body.title,
      address: {
        street: body.address,
        city: body.city,
      },
      details: body.details
    };

    const response = await copperApi.put(`/people/${contactId}`, updatePayload);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('❌ Error updating contact in Copper:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to update contact in Copper', details: error.message },
      { status: 500 }
    );
  }
}