import { NextRequest, NextResponse } from 'next/server';

const COPPER_API_KEY = process.env.COPPER_API_KEY;
const COPPER_USER_EMAIL = process.env.COPPER_EMAIL;

const copperApi = {
  get: async (endpoint: string) => {
    const response = await fetch(`https://api.copper.com/developer_api/v1${endpoint}`, {
      headers: {
        'X-PW-AccessToken': COPPER_API_KEY || '',
        'X-PW-Application': 'developer_api',
        'X-PW-UserEmail': COPPER_USER_EMAIL || '',
        'Content-Type': 'application/json',
      },
    });
    return response;
  }
};

export async function GET(request: NextRequest) {
  try {
    if (!COPPER_API_KEY || !COPPER_USER_EMAIL) {
      return NextResponse.json(
        { error: 'Copper API credentials not configured' },
        { status: 500 }
      );
    }
    
    // Fetch custom field definitions
    const response = await copperApi.get('/custom_field_definitions');
    
    if (!response.ok) {
      throw new Error(`Copper API error: ${response.status}`);
    }
    
    const fieldDefinitions = await response.json();
    
    // Filter for date fields and fields that might be anniversary-related
    const relevantFields = fieldDefinitions
      .filter((field: any) => 
        field.field_type === 'date' || 
        field.name?.toLowerCase().includes('anniversary') ||
        field.name?.toLowerCase().includes('marriage') ||
        field.name?.toLowerCase().includes('wedding')
      )
      .map((field: any) => ({
        id: field.id,
        name: field.name,
        field_type: field.field_type,
        available_on: field.available_on
      }));
    
    return NextResponse.json({
      allFields: fieldDefinitions.map((field: any) => ({
        id: field.id,
        name: field.name,
        field_type: field.field_type
      })),
      relevantFields,
      anniversaryFields: fieldDefinitions.filter((field: any) => 
        field.name?.toLowerCase().includes('anniversary')
      )
    });
    
  } catch (error: any) {
    console.error('Error fetching Copper field definitions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch field definitions from Copper API',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
