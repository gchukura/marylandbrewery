import { NextRequest, NextResponse } from 'next/server';
import { addNewsletterSubscriber } from '@/lib/google-sheets';
import { isValidEmail } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    
    const metadata = {
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      source: 'newsletter_footer'
    };
    
    const result = await addNewsletterSubscriber(email, metadata);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully subscribed!' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'You are already subscribed to our newsletter!' 
      }, { status: 409 });
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ 
      error: 'Subscription failed. Please try again.' 
    }, { status: 500 });
  }
}
