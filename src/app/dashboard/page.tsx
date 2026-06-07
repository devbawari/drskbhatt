import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Calendar, Video, MapPin, Clock, Hourglass, CheckCircle2, XCircle, CheckSquare, MessageSquare } from 'lucide-react'
import { CancelButton } from '@/components/dashboard/CancelButton'
import { LiveJoinButton } from '@/components/dashboard/LiveJoinButton'
import './dashboard.css'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: appointments } = await adminClient
    .from('appointments')
    .select('*')
    .eq('patient_id', user.id)
    .order('scheduled_at', { ascending: false })

  const upcoming = appointments?.filter(a => ['pending', 'confirmed'].includes(a.status)) || []
  const past = appointments?.filter(a => ['completed', 'cancelled'].includes(a.status)) || []

  const formatDateTime = (timestamp: string) => {
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    return { dateStr, timeStr };
  }

  const renderAppointment = (app: any) => (
    <div key={app.id} className="appointment-item">
      <div className="appointment-header">
        <div className="appointment-type">
          {app.visit_type === 'virtual' ? <Video size={18} className="text-primary" /> : <MapPin size={18} className="text-primary" />}
          {app.visit_type === 'virtual' ? 'Video Consultation' : 'In-Clinic Visit'}
        </div>
        <span className={`appointment-status status-${app.status}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {app.status === 'pending' && <Hourglass size={12} />}
          {app.status === 'confirmed' && <CheckCircle2 size={12} />}
          {app.status === 'cancelled' && <XCircle size={12} />}
          {app.status === 'completed' && <CheckSquare size={12} />}
          {app.status}
        </span>
      </div>
      
      <div className="appointment-details">
        <div className="appointment-detail-row">
          <Calendar size={14} />
          <span>{formatDateTime(app.scheduled_at).dateStr}</span>
        </div>
        <div className="appointment-detail-row">
          <Clock size={14} />
          <span>{formatDateTime(app.scheduled_at).timeStr} ({app.duration_minutes} mins)</span>
        </div>
      </div>

      <div className="appointment-actions">
        {app.status === 'confirmed' && (
          <a href="/dashboard/messages" className="join-call-btn" style={{ background: 'var(--color-accent)' }}>
            <MessageSquare size={16} />
            Message Doctor
          </a>
        )}
        {app.status === 'confirmed' && app.visit_type === 'virtual' && (
          <LiveJoinButton appointmentId={app.id} initialState={app.telehealth_state || 'idle'} roomUrl={app.room_url || ''} />
        )}
        {['pending', 'confirmed'].includes(app.status) && (
          <CancelButton id={app.id} />
        )}
      </div>
    </div>
  )

  return (
    <div className="dashboard-grid">
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2 className="dashboard-card-title">Upcoming Appointments</h2>
        </div>
        <div className="appointment-list-scrollable">
          {upcoming.length > 0 ? (
            upcoming.map(renderAppointment)
          ) : (
            <div className="empty-state">
              <Calendar size={32} />
              <p>You have no upcoming appointments.</p>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2 className="dashboard-card-title">Past Appointments</h2>
        </div>
        <div className="appointment-list-scrollable">
          {past.length > 0 ? (
            past.map(renderAppointment)
          ) : (
            <div className="empty-state">
              <Clock size={32} />
              <p>Your appointment history will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
