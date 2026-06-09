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

  const year = todayDate.getFullYear();
  const month = String(todayDate.getMonth() + 1).padStart(2, '0');
  const day = String(todayDate.getDate()).padStart(2, '0');
  const todayStrYMD = `${year}-${month}-${day}`;

  const startOfDay = new Date(year, todayDate.getMonth(), todayDate.getDate(), 0, 0, 0);
  const endOfDay = new Date(year, todayDate.getMonth(), todayDate.getDate(), 23, 59, 59, 999);

  // Fetch stats concurrently
  const [
    { count: totalPatients },
    { count: pendingCount },
    { count: todayAptsCount },
    { count: unreadMessages }
  ] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    adminClient.from('appointments').select('*', { count: 'exact', head: true }).in('status', ['requested', 'pending_payment']),
    adminClient.from('appointments').select('*', { count: 'exact', head: true })
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString())
      .in('status', ['confirmed', 'requested', 'pending_payment']),
    adminClient.from('messages').select('*', { count: 'exact', head: true }).is('read_at', null).eq('recipient_id', user.id)
  ]);

  // Fetch today's appointments
  const { data: todayAppointments } = await adminClient
    .from('appointments')
    .select('*')
    .gte('scheduled_at', startOfDay.toISOString())
    .lte('scheduled_at', endOfDay.toISOString())
    .order('scheduled_at', { ascending: true });

  // Fetch recent bookings (pending)
  const { data: recentBookings } = await adminClient
    .from('appointments')
    .select('*')
    .in('status', ['requested', 'pending_payment'])
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
                  <div className="admin-timeline-time">
                    {new Date(apt.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' })}
                  </div>
                  <div className="admin-timeline-info">
                    <div className="admin-timeline-name">{apt.patient_name || 'Unknown'}</div>
                    <div className="admin-timeline-meta">
                      {apt.visit_type === 'virtual' ? <><Video size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Video Call</> : <><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />In-Clinic</>}
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
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--admin-text)' }}>{b.patient_name || 'Unknown'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
                      {new Date(b.scheduled_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' })} · {new Date(b.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' })} · <span className={`admin-badge admin-badge-${b.visit_type}`}>{b.visit_type}</span>
                    </div>
                  </div>
                  <div className="admin-table-actions">
                    <span className={`admin-badge admin-badge-${b.status.replace('_', '-')}`}>{b.status === 'pending_payment' ? 'pending payment' : b.status}</span>
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
