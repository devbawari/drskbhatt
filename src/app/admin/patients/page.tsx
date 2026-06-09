import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import PatientsClient from './PatientsClient';

export default async function PatientsPage() {
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
    .in('status', ['requested', 'pending_payment', 'confirmed'])
    .order('scheduled_at', { ascending: false });

  const formattedPatients = (appointments || []).map((app: any) => {
    let age = null;
    if (app.patient_dob) {
      const dob = new Date(app.patient_dob);
      const diff = Date.now() - dob.getTime();
      age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }

    return {
      id: app.id,
      patient_id: app.patient_id,
      name: app.patient_name || 'Unknown',
      email: app.patient_email || 'No email',
      phone: app.patient_phone || 'No phone',
      age: age,
      gender: null, // Gender is not in schema_v2.sql for appointments, we can leave null
      reason: app.reason || 'No reason provided',
      date: new Date(app.scheduled_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      type: app.visit_type === 'virtual' ? 'Online Video' : 'In-Clinic',
      status: app.status
    };
  });

  return <PatientsClient initialPatients={formattedPatients} />;
}
