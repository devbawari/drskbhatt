import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TelehealthRoom from '@/components/telehealth/TelehealthRoom';
import './telehealth.css';

export default async function TelehealthPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  // Verify the user is either the doctor or the patient of this appointment
  // Using service role here temporarily to fetch, but we validate user.id
  const adminClient = await createClient(); // Actually, createClient gets the user's RLS context, so doctor can see all, patient can see theirs.

  const { data: appointment } = await adminClient
    .from('appointments')
    .select('id, patient_id, room_url, telehealth_state')
    .eq('id', appointmentId)
    .single();

  if (!appointment) redirect('/dashboard');
  
  // Verify ownership
  const isDoctor = await adminClient.rpc('has_role', { _user_id: user.id, _role: 'doctor' }).then((res: any) => res.data);
  
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

  return (
    <div className="telehealth-wrapper">
      <TelehealthRoom roomUrl={appointment.room_url} appointmentId={appointmentId} isDoctor={isDoctor} />
    </div>
  );
}
