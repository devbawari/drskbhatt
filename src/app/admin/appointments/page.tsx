import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import AppointmentsClient from './AppointmentsClient';

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: appointments } = await adminClient
    .from('appointments')
    .select('*')
    .order('scheduled_at', { ascending: false });

  // Map to the format expected by the client component
  const formattedAppointments = (appointments || []).map((a: any) => {
    const dt = new Date(a.scheduled_at);
    return {
      id: a.id,
      name: a.patient_name || 'Unknown Patient',
      email: a.patient_email || 'No email',
      date: dt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }),
      type: (a.visit_type === 'virtual' ? 'online' : 'offline') as 'online' | 'offline',
      status: a.status as 'requested' | 'pending_payment' | 'confirmed' | 'cancelled' | 'completed',
      reason: a.reason || 'No reason provided',
      room_url: a.room_url || '',
      telehealth_state: a.telehealth_state || 'idle',
    };
  });

  return <AppointmentsClient initialAppointments={formattedAppointments} />;
}
