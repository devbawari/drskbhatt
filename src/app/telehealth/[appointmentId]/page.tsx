import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TelehealthRoom from '@/components/telehealth/TelehealthRoom';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import './telehealth.css';

export default async function TelehealthPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  // Verify the user is either the doctor or the patient of this appointment

  // Using service role here temporarily to fetch, since our manual authorization logic handles security
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: appointment } = await adminClient
    .from('appointments')
    .select('id, patient_id, room_url, telehealth_state, status')
    .eq('id', appointmentId)
    .single();

  if (!appointment) redirect('/dashboard');
  
  // Verify ownership
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  const { data: userRole } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  const isDoctor = profile?.role === 'doctor' || userRole?.role === 'doctor';
  
  if (!isDoctor && appointment.patient_id !== user.id) {
    redirect('/dashboard');
  }

  if (appointment.telehealth_state === 'completed' || !appointment.room_url) {
    return (
      <div className="telehealth-error">
        <h1>Consultation Ended</h1>
        <p>This telehealth session is no longer active.</p>
        <a href={isDoctor ? '/admin' : '/dashboard'} className="admin-btn">Return to Dashboard</a>
      </div>
    );
  }

  if (appointment.status === 'requested' || appointment.status === 'pending_payment') {
    return (
      <div className="telehealth-error">
        <h1>Payment Required</h1>
        <p>This telehealth session requires payment before it can be accessed.</p>
        <a href={isDoctor ? '/admin/appointments' : `/appointments/${appointmentId}/pay`} className="admin-btn admin-btn-primary">
          {isDoctor ? 'Return to Dashboard' : 'Proceed to Payment'}
        </a>
      </div>
    );
  }

  return (
    <div className="telehealth-wrapper">
      <TelehealthRoom roomUrl={appointment.room_url} appointmentId={appointmentId} isDoctor={isDoctor} />
    </div>
  );
}
