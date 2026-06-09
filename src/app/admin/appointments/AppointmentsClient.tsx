'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Check, X, Eye, Video, MapPin, Play } from 'lucide-react';
import { updateAppointmentStatus, startTelehealthSession } from '../actions';

type Appointment = {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  type: 'online' | 'offline';
  status: 'requested' | 'pending_payment' | 'confirmed' | 'cancelled' | 'completed';
  reason: string;
  telehealth_state: string;
};

export default function AppointmentsClient({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [startingCall, setStartingCall] = useState<string | null>(null);
  const router = useRouter();

  const filtered = appointments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    // Optimistic update
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: status as any } : a));
    const res = await updateAppointmentStatus(id, status);
    if (!res.success) {
      alert('Failed to update status');
      // Revert on failure (simple reload here for safety)
      window.location.reload();
    }
  };

  const handleStartTelehealth = async (id: string) => {
    setStartingCall(id);
    try {
      const res = await startTelehealthSession(id);
      if (res.success) {
        router.push(`/telehealth/${id}`);
      } else {
        alert('Failed to start telehealth session: ' + res.error);
        setStartingCall(null);
      }
    } catch (error) {
      alert('An unexpected error occurred');
      setStartingCall(null);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>Appointments</h1>
        <p>Manage and track all patient appointments</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
          <input type="text" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '36px', width: '100%' }} id="apt-search" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} id="apt-status-filter">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} id="apt-type-filter">
          <option value="all">All Types</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{a.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>{a.email}</div>
                </td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>
                  <span className={`admin-badge admin-badge-${a.type}`}>
                    {a.type === 'online' ? <><Video size={10} style={{ marginRight: '3px' }} />Online</> : <><MapPin size={10} style={{ marginRight: '3px' }} />Offline</>}
                  </span>
                </td>
                <td>
                  <span className={`admin-badge admin-badge-${a.status.replace('_', '-')}`}>
                    {a.status === 'pending_payment' ? 'Pending Payment' : a.status}
                  </span>
                </td>
                <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason}</td>
                <td>
                  <div className="admin-table-actions">
                    {a.status === 'requested' && (
                      <>
                        <button className="admin-btn admin-btn-success" title="Accept Request (Request Payment)" onClick={() => handleUpdateStatus(a.id, 'pending_payment')}><Check size={14} /></button>
                        <button className="admin-btn admin-btn-danger" title="Reject" onClick={() => handleUpdateStatus(a.id, 'cancelled')}><X size={14} /></button>
                      </>
                    )}
                    {a.status === 'pending_payment' && (
                      <button className="admin-btn admin-btn-danger" title="Cancel Request" onClick={() => handleUpdateStatus(a.id, 'cancelled')}><X size={14} /></button>
                    )}
                    {a.status === 'confirmed' && (
                      <>
                        <button className="admin-btn admin-btn-success" title="Complete" onClick={() => handleUpdateStatus(a.id, 'completed')}><Check size={14} /></button>
                        <button className="admin-btn admin-btn-danger" title="Cancel" onClick={() => handleUpdateStatus(a.id, 'cancelled')}><X size={14} /></button>
                        {a.type === 'online' && a.telehealth_state === 'idle' && (
                          <button 
                            className="admin-btn admin-btn-danger" 
                            title="Start Telehealth Consultation" 
                            style={{ animation: 'pulse 2s infinite', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleStartTelehealth(a.id)}
                            disabled={startingCall === a.id}
                          >
                            <Play size={14} /> {startingCall === a.id ? 'Starting...' : 'Start Call'}
                          </button>
                        )}
                        {a.type === 'online' && a.telehealth_state === 'active' && (
                          <button 
                            className="admin-btn admin-btn-ghost" 
                            style={{ background: 'var(--color-accent)', color: 'white' }}
                            onClick={() => router.push(`/telehealth/${a.id}`)}
                          >
                            <Video size={14} /> Rejoin Call
                          </button>
                        )}
                      </>
                    )}
                    <button className="admin-btn admin-btn-ghost" title="View"><Eye size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
