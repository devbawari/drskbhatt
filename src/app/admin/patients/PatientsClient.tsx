'use client';

import { useState } from 'react';
import { Search, Mail, Phone, Calendar, Activity, Eye, X, FileText, Clock } from 'lucide-react';

type Patient = {
  id: string;
  patient_id: string;
  name: string;
  email: string;
  phone: string;
  age: number | null;
  gender: string | null;
  reason: string;
  date: string;
  type: string;
  status: string;
};

export default function PatientsClient({ initialPatients }: { initialPatients: Patient[] }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="admin-page-header">
        <h1>Patient Cases (Active Bookings)</h1>
        <p>{patients.length} active appointments</p>
      </div>

      <div className="admin-filters">
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '36px', width: '100%' }} id="patient-search" />
        </div>
      </div>

      <div className="admin-patients-grid">
        {filtered.map((p) => (
          <div key={p.id} className="admin-patient-card">
            <div className="admin-patient-header">
              <div className="admin-patient-avatar">{p.name.charAt(0)}</div>
              <div>
                <div className="admin-patient-name">{p.name}</div>
                <div className="admin-patient-email">{p.email}</div>
              </div>
            </div>
            <div className="admin-patient-details">
              <div>
                <div className="admin-patient-detail-label"><Phone size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Phone</div>
                <div>{p.phone}</div>
              </div>
              <div>
                <div className="admin-patient-detail-label">Age</div>
                <div>{p.age || 'N/A'}</div>
              </div>
              <div>
                <div className="admin-patient-detail-label"><Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Appointment</div>
                <div>{p.date}</div>
              </div>
              <div>
                <div className="admin-patient-detail-label">Status</div>
                <div style={{ fontWeight: 700, color: p.status === 'confirmed' ? 'var(--color-primary)' : 'var(--color-accent)' }}>
                  {p.status.toUpperCase()}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <button 
                className="admin-btn admin-btn-ghost" 
                style={{ width: '100%' }}
                onClick={() => setSelectedPatient(p)}
              >
                <Eye size={14} /> View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPatient && (
        <div className="admin-overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedPatient(null)}>
          <div className="admin-modal" style={{ background: 'var(--admin-surface)', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Booking Details</h2>
              <button onClick={() => setSelectedPatient(null)} style={{ background: 'transparent', border: 'none', color: 'var(--admin-text)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--admin-border)' }}>
                <div className="admin-patient-avatar" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>{selectedPatient.name.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedPatient.name}</div>
                  <div style={{ color: 'var(--admin-text-muted)' }}>{selectedPatient.email} • {selectedPatient.phone}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}><Calendar size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> Date & Time</div>
                  <div style={{ fontWeight: 500 }}>{selectedPatient.date}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}><Clock size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> Type</div>
                  <div style={{ fontWeight: 500 }}>{selectedPatient.type}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}><Activity size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> Age</div>
                  <div style={{ fontWeight: 500 }}>{selectedPatient.age || 'Not provided'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Status</div>
                  <div style={{ fontWeight: 500, color: selectedPatient.status === 'confirmed' ? 'var(--color-primary)' : 'var(--color-accent)' }}>{selectedPatient.status.toUpperCase()}</div>
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}><FileText size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> Reason for Visit</div>
                <div style={{ background: 'var(--admin-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)', lineHeight: 1.5 }}>
                  {selectedPatient.reason}
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="admin-btn admin-btn-ghost" onClick={() => setSelectedPatient(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
