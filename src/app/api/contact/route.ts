import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate the incoming data
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to database
    const supabase = await createClient();

    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
      });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit message' },
      { status: 500 }
    );
  }
}
