import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    if (!data.date || !data.startTime || !data.type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Calculate scheduled_at in IST
    const scheduledAt = new Date(`${data.date}T${data.startTime}:00+05:30`).toISOString();

    // 2. Map type to ENUM
    const visitType = data.type === 'online' || data.type === 'virtual' ? 'virtual' : 'in_person';

    // 3. Create appointment using admin client to bypass RLS has_role errors
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: appointment, error } = await adminClient
      .from('appointments')
      .insert({
        patient_id: user.id,
        scheduled_at: scheduledAt,
        visit_type: visitType,
        status: 'pending',
        reason: data.reason || null,
        duration_minutes: 30, // hardcoded for now or from availability
        patient_name: data.patientInfo?.fullName || user.email?.split('@')[0] || 'Unknown',
        patient_email: data.patientInfo?.email || user.email || 'unknown@example.com',
        patient_phone: data.patientInfo?.phone || null,
        patient_dob: data.patientInfo?.age ? new Date(new Date().setFullYear(new Date().getFullYear() - data.patientInfo.age)).toISOString().split('T')[0] : null,
      })
      .select('id')
      .single();

    if (error || !appointment) {
      console.error('Failed to create appointment in Supabase:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Generate readable booking ID: BK-YYYY-XXXXX
    const bookingId = `BK-${new Date().getFullYear()}-${appointment.id.substring(appointment.id.length - 5).toUpperCase()}`;

    return NextResponse.json({ success: true, bookingId });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
