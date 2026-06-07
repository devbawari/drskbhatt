import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { RealtimeChat } from '@/components/dashboard/RealtimeChat'
import { CheckCircle } from 'lucide-react'
import './messages.css'

export default async function PatientMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find the doctor's user_id from user_roles
  const { data: doctorRole } = await adminClient
    .from('user_roles')
    .select('user_id')
    .eq('role', 'doctor')
    .limit(1)
    .single()

  let doctor = null
  if (doctorRole) {
    const { data: docProfile } = await adminClient
      .from('profiles')
      .select('id, full_name')
      .eq('id', doctorRole.user_id)
      .single()
    doctor = docProfile
  }

  if (!doctor) {
    return (
      <div className="dashboard-card">
        <div className="empty-state">
          <p>Unable to connect to the clinic at the moment. Please try again later.</p>
        </div>
      </div>
    )
  }

  // Check if patient has any confirmed appointments
  const { data: appointments } = await adminClient
    .from('appointments')
    .select('status')
    .eq('patient_id', user.id)
    .eq('status', 'confirmed')

  if (!appointments || appointments.length === 0) {
    return (
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--color-primary)' }}>
            <CheckCircle size={48} />
          </div>
          <h2 style={{ marginBottom: '12px', fontSize: '20px' }}>Chat Locked</h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            Messaging is securely unlocked only after the doctor confirms your appointment request. 
            Please wait for confirmation before starting a chat.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
      <RealtimeChat 
        currentUserId={user.id} 
        doctorId={doctor.id} 
        doctorName={doctor.full_name || 'DR SK BHATT'} 
      />
    </div>
  )
}
