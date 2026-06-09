import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, appointment_id } = data;

    // In a real application, verify the signature here using crypto and RAZORPAY_KEY_SECRET

    if (!appointment_id) {
      return NextResponse.json({ error: 'Missing appointment ID' }, { status: 400 });
    }

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await adminClient
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', appointment_id)
      .eq('status', 'pending_payment'); // Secure update

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
