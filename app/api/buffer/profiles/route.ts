import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For now, return empty array since Buffer integration might not be set up
    // You can implement actual Buffer API integration later
    return NextResponse.json([]);
  } catch (error: any) {
    console.error('Error fetching Buffer profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Buffer profiles' },
      { status: 500 }
    );
  }
}
