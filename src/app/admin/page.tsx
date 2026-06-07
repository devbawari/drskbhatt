import { CalendarDays, Clock, Users, MessageSquare, Video, MapPin, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default async function AdminDashboard() {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const tomorrow = new Date(todayDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const todayStrYMD = todayDate.toISOString().split('T')[0];

  // Fetch stats concurrently
  const [
    { count: totalPatients },
    { count: pendingCount },
    { count: todayAptsCount },
    { count: unreadMessages }
  ] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    adminClient.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('appointments').select('*', { count: 'exact', head: true }).eq('date', todayStrYMD).in('status', ['confirmed', 'pending']),
    adminClient.from('messages').select('*', { count: 'exact', head: true }).is('read_at', null).eq('recipient_id', user.id)
  ]);

  // Fetch today's appointments
  const { data: todayAppointments } = await adminClient
    .from('appointments')
    .select('*, patient:profiles!patient_id(full_name)')
    .eq('date', todayStrYMD)
    .order('start_time', { ascending: true });

  // Fetch recent bookings (pending)
  const { data: recentBookings } = await adminClient
    .from('appointments')
    .select('*, patient:profiles!patient_id(full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5);

  const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <div className="admin-page-header">
        <h1>{getGreeting()}, Dr. SK Bhatt </h1>
        <p>{todayStr}</p>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <div className="admin-stat-icon blue"><CalendarDays size={20} /></div>
          </div>
          <div className="admin-stat-value">{todayAptsCount}</div>
          <div className="admin-stat-label">Today&apos;s Appointments</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <div className="admin-stat-icon yellow"><Clock size={20} /></div>
          </div>
          <div className="admin-stat-value">{pendingCount}</div>
          <div className="admin-stat-label">Pending Confirmations</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <div className="admin-stat-icon green"><Users size={20} /></div>
          </div>
          <div className="admin-stat-value">{totalPatients?.toLocaleString() || '0'}</div>
          <div className="admin-stat-label">Total Patients</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <div className="admin-stat-icon purple"><MessageSquare size={20} /></div>
          </div>
          <div className="admin-stat-value">{unreadMessages || '0'}</div>
          <div className="admin-stat-label">Unread Messages</div>
        </div>
      </div>

      <div className="admin-today">
        {/* Today's Schedule */}
        <div>
          <h3 className="admin-section-title"><CalendarDays size={18} /> Today&apos;s Schedule</h3>
          <div className="admin-card" style={{ padding: 0 }}>
            {!todayAppointments || todayAppointments.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>No appointments today</div>
            ) : (
              todayAppointments.map((apt: any) => (
                <div key={apt.id} className={`admin-timeline-item ${apt.status}`}>
                  <div className="admin-timeline-time">{apt.start_time}</div>
                  <div className="admin-timeline-info">
                    <div className="admin-timeline-name">{apt.patient?.full_name || 'Unknown'}</div>
                    <div className="admin-timeline-meta">
                      {apt.type === 'online' ? <><Video size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Video Call</> : <><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />In-Clinic</>}
                      {apt.reason ? ` · ${apt.reason}` : ''}
                    </div>
                  </div>
                  <span className={`admin-badge admin-badge-${apt.status}`}>{apt.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div>
          <h3 className="admin-section-title"><Clock size={18} /> Recent Bookings</h3>
          <div className="admin-card" style={{ padding: 0 }}>
            {!recentBookings || recentBookings.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>No pending bookings</div>
            ) : (
              recentBookings.map((b: any) => (
                <div key={b.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--admin-text)' }}>{b.patient?.full_name || 'Unknown'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
                      {new Date(b.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} · {b.start_time} · <span className={`admin-badge admin-badge-${b.type}`}>{b.type}</span>
                    </div>
                  </div>
                  <div className="admin-table-actions">
                    <span className="admin-badge admin-badge-pending">Pending</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
