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

export async function GET(request: NextRequest) {
  try {
    console.log('Testing MailerLite API connection...');
    console.log('API Key exists:', !!ML_KEY);
    console.log('API Key length:', ML_KEY?.length);

    if (!ML_KEY) {
      return NextResponse.json({ 
        error: 'Missing MAILERLITE_API_KEY',
        status: 'error'
      });
    }

    // Test API connection
    const response = await mailerliteApi.get('/account');
    
    console.log('API test successful:', response.status);
    
    return NextResponse.json({ 
      success: true, 
      status: 'connected',
      account: response.data?.data,
      message: 'MailerLite API connection successful'
    });

  } catch (error: any) {
    console.error('MailerLite API test failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    return NextResponse.json({ 
      error: 'MailerLite API connection failed',
      details: error.response?.data || error.message,
      status: 'error'
    }, { status: 500 });
  }
}
