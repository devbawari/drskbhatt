'use client';

import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { updateSchedule as updateScheduleAction } from '../actions';

type ScheduleDay = {
  id: string;
  day: string;
  dayNum: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  active: boolean;
};

type BlockedDate = {
  id: string;
  date: string;
  reason: string;
};

export default function ScheduleClient({ initialSchedule, initialBlocked }: { initialSchedule: ScheduleDay[], initialBlocked: BlockedDate[] }) {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [blocked, setBlocked] = useState(initialBlocked);
  const [saved, setSaved] = useState(false);

  const updateSchedule = (index: number, field: string, value: string | number | boolean) => {
    const updated = [...schedule];
    (updated[index] as Record<string, unknown>)[field] = value;
    setSchedule(updated);
    setSaved(false);
  };

  const handleSave = async () => {
    const res = await updateScheduleAction(schedule, blocked);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert('Failed to save schedule');
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>Schedule Manager</h1>
        <p>Configure which days you are available for appointments</p>
      </div>

      <div className="admin-card" style={{ marginBottom: '32px' }}>
        <h3 className="admin-section-title" style={{ marginBottom: '20px' }}>Weekly Schedule</h3>
        <div className="admin-table-wrap" style={{ border: 'none' }}>
          <table className="admin-schedule-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Available Timings</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((s, i) => (
                <tr key={s.day} style={{ opacity: s.active ? 1 : 0.4 }}>
                  <td style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{s.day}</td>
                  <td style={{ color: 'var(--admin-text-muted)' }}>
                    {s.active ? '10:30 AM - 1:30 PM & 6:00 PM - 9:00 PM' : 'Closed'}
                  </td>
                  <td>
                    <label className="toggle">
                      <input type="checkbox" checked={s.active} onChange={(e) => updateSchedule(i, 'active', e.target.checked)} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="admin-btn admin-btn-primary" onClick={handleSave} id="save-schedule">
            <Save size={16} /> Save Schedule
          </button>
          {saved && <span style={{ color: 'var(--admin-success)', fontSize: '14px', fontWeight: 600 }}>✓ Schedule saved successfully!</span>}
        </div>
      </div>

      {/* Blocked Dates */}
      <div className="admin-card">
        <h3 className="admin-section-title" style={{ marginBottom: '20px' }}>Blocked Dates (Holidays / Leave)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          {blocked.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--admin-bg)', borderRadius: '8px' }}>
              <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                <input 
                  type="date" 
                  value={b.date} 
                  onChange={(e) => {
                    const newBlocked = [...blocked];
                    newBlocked[i].date = e.target.value;
                    setBlocked(newBlocked);
                    setSaved(false);
                  }}
                  className="admin-input"
                  style={{ padding: '6px 12px', width: 'auto' }}
                />
                <input 
                  type="text" 
                  placeholder="Reason (e.g. Vacation)"
                  value={b.reason} 
                  onChange={(e) => {
                    const newBlocked = [...blocked];
                    newBlocked[i].reason = e.target.value;
                    setBlocked(newBlocked);
                    setSaved(false);
                  }}
                  className="admin-input"
                  style={{ padding: '6px 12px', flex: 1 }}
                />
              </div>
              <button className="admin-btn admin-btn-danger" onClick={() => {
                setBlocked(blocked.filter((_, idx) => idx !== i));
                setSaved(false);
              }} title="Remove">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="admin-btn admin-btn-ghost" 
            id="add-blocked-date"
            onClick={() => {
              const d = new Date();
              const todayYMD = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              setBlocked([...blocked, { id: `new-${Date.now()}`, date: todayYMD, reason: '' }]);
              setSaved(false);
            }}
          >
            <Plus size={16} /> Add Blocked Date
          </button>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {saved && <span style={{ color: 'var(--admin-success)', fontSize: '14px', fontWeight: 600 }}>✓ Saved!</span>}
            <button className="admin-btn admin-btn-primary" onClick={handleSave} id="save-blocked-dates">
              <Save size={16} /> Save Blocked Dates
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
