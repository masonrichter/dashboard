import { NextRequest, NextResponse } from 'next/server';
import { getAllTemplates } from '../../../../lib/templates';

export async function GET(request: NextRequest) {
  try {
    // Get our local templates
    const templates = getAllTemplates();
    
    // Convert to the format expected by the frontend
    const formattedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      content: template.html, // Store the full HTML template
      thumbnail: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    console.log('Local templates loaded:', formattedTemplates.length);
    return NextResponse.json(formattedTemplates);
  } catch (err: any) {
    console.error('Error loading templates:', err);
    return NextResponse.json(
      { error: 'Failed to load templates', details: err.message },
      { status: 500 }
    );
  }
}
