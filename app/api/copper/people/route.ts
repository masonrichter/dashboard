import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Disable caching
export const revalidate = 0;
export const dynamic = 'force-dynamic';

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

function getAnniversaryFromCustomFields(customFields: any[]): string | null {
  if (!customFields || customFields.length === 0) {
    return null;
  }
  
  for (const field of customFields) {
    // Check by field name first (case-insensitive)
    const fieldName = field.name || field.custom_field_definition_name || '';
    if (fieldName.toLowerCase().includes('anniversary') && field.value) {
      console.log(`Found anniversary field by name: ${fieldName}, value: ${field.value}`);
      
      // Convert timestamp to date string
      const timestampInMs = field.value * 1000;
      const dateObject = new Date(timestampInMs);
      const isoDateString = dateObject.toISOString();
      const anniversaryString = isoDateString.split('T')[0];
      
      console.log(`Converted anniversary: ${anniversaryString}`);
      return anniversaryString;
    }
  }
  
  // If we can't find by name, try to find by looking for date fields near the birthday field ID
  // The anniversary field might be close to the birthday field ID (703490)
  const possibleAnniversaryIds = [703491, 703492, 703493, 703494, 703495];
  
  for (const field of customFields) {
    if (possibleAnniversaryIds.includes(field.custom_field_definition_id) && field.value) {
      console.log(`Found potential anniversary field by ID ${field.custom_field_definition_id}: ${field.value}`);
      
      const timestampInMs = field.value * 1000;
      const dateObject = new Date(timestampInMs);
      const isoDateString = dateObject.toISOString();
      const anniversaryString = isoDateString.split('T')[0];
      
      console.log(`Converted anniversary: ${anniversaryString}`);
      return anniversaryString;
    }
  }
  
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
    
    // Fetch ALL contacts with pagination (no contact_type_ids filter)
    let allContacts: any[] = [];
    let pageNumber = 1;
    const pageSize = 200;
    let hasMore = true;
    
    console.log('Starting to fetch all contacts with pagination...');
    
    while (hasMore) {
      console.log(`Fetching page ${pageNumber}...`);
      
      const response = await copperApi.post('/people/search', {
        page_number: pageNumber,
        page_size: pageSize,
      });
      
      const contacts = response.data;
      allContacts = allContacts.concat(contacts);
      
      console.log(`Page ${pageNumber}: ${contacts.length} contacts fetched. Total so far: ${allContacts.length}`);
      
      // If we get fewer contacts than pageSize, we've reached the end
      hasMore = contacts.length === pageSize;
      pageNumber++;
      
      // Safety limit to prevent infinite loops (should handle up to 3,016 contacts)
      if (pageNumber > 20) {
        console.log('Reached safety limit of 20 pages');
        break;
      }
    }
    
    console.log(`Loaded contacts count: ${allContacts.length}`);
    
    // Process contacts and handle duplicates by merging tags
    const contactMap = new Map<number, any>();
    
    allContacts.forEach((contact: any) => {
      const contactId = contact.id;
      
      if (contactMap.has(contactId)) {
        // Merge tags if contact already exists
        const existingContact = contactMap.get(contactId);
        const existingTags = existingContact.tags || [];
        const newTags = contact.tags || [];
        const mergedTags = [...new Set([...existingTags, ...newTags])]; // Remove duplicates
        
        contactMap.set(contactId, {
          ...existingContact,
          tags: mergedTags
        });
      } else {
        contactMap.set(contactId, contact);
      }
    });
    
    const uniqueContacts = Array.from(contactMap.values());
    
    const contacts = uniqueContacts.map((contact: any) => ({
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
      anniversary: getAnniversaryFromCustomFields(contact.custom_fields),
    }));
    
    const response = NextResponse.json(contacts);
    response.headers.set('Cache-Control', 'no-store');
    
    return response;
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