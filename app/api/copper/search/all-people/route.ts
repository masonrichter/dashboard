import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://api.copper.com/developer_api/v1/people/search', {
      method: 'POST',
      headers: {
        'X-PW-AccessToken': process.env.COPPER_API_KEY || '',
        'X-PW-Application': 'developer_api',
        'X-PW-UserEmail': process.env.COPPER_EMAIL || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 1000, // Get all people
        sort_by: 'date_modified',
        sort_direction: 'desc'
      })
    });

    if (!response.ok) {
      throw new Error(`Copper API error: ${response.status}`);
    }

    const people = await response.json();

    // Transform the data to match the expected format
    const transformedPeople = people.map((person: any) => ({
      id: person.id,
      name: person.name,
      email: person.emails?.[0]?.email || '',
      tags: person.tags || [],
      company: person.company_name || '',
      phone: person.phone_numbers?.[0]?.number || '',
      lastModified: person.date_modified
    }));

    return NextResponse.json(transformedPeople);
  } catch (error: any) {
    console.error('Error fetching Copper people:', error);
    return NextResponse.json(
      { error: 'Failed to fetch people from Copper' },
      { status: 500 }
    );
  }
}
