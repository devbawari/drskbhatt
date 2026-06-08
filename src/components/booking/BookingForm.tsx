'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, Stethoscope, Video, Sun, Cloud, Moon,
  Calendar, Clock, User, Mail, Phone, FileText, CheckCircle, Home
} from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './BookingForm.css';

interface BookingData {
  type: 'offline' | 'online' | '';
  date: Date | null;
  time: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  reason: string;
  terms: boolean;
}

const STEPS = ['Type', 'Date', 'Time', 'Details', 'Confirm'];

const BOOKED_SLOTS = ['10:00', '11:30', '14:00', '15:30', '17:00'];

export default function BookingForm({ initialPatientData, blockedDates = [] }: { initialPatientData?: { name: string, email: string, phone: string } | null, blockedDates?: string[] }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<BookingData>({
    type: '', date: null, time: '', name: initialPatientData?.name || '', email: initialPatientData?.email || '', phone: initialPatientData?.phone || '',
    age: '', gender: '', reason: '', terms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // Dynamic slots
  const [availableSlots, setAvailableSlots] = useState<{ period: string; icon: React.ElementType; slots: { time: string; booked: boolean }[] }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  const canNext = () => {
    switch (step) {
      case 1: return data.type !== '';
      case 2: return data.date !== null;
      case 3: return data.time !== '';
      case 4: return data.name && data.email && data.phone && data.terms;
      default: return true;
    }
  };

  const validateStep4 = () => {
    const errs: Record<string, string> = {};
    if (!data.name.trim()) errs.name = 'Name is required';
    if (!data.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = 'Invalid email';
    if (!data.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) errs.phone = 'Enter 10-digit number';
    if (!data.terms) errs.terms = 'Please accept terms';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 4 && !validateStep4()) return;
    if (step < 5) setStep(step + 1);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const dateStr = data.date ? `${data.date.getFullYear()}-${(data.date.getMonth() + 1).toString().padStart(2, '0')}-${data.date.getDate().toString().padStart(2, '0')}` : '';

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          startTime: data.time,
          type: data.type, 
          reason: data.reason,
          patientInfo: {
            fullName: data.name, 
            email: data.email, 
            phone: data.phone,
            age: data.age ? parseInt(data.age, 10) : null, 
            gender: data.gender
          }
        }),
      });
      const result = await res.json();
      if (result.success) {
        setBookingId(result.bookingId);
        setSuccess(true);
      }
    } catch {
      alert('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calendar helpers
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const monthName = new Date(calYear, calMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const isDateDisabled = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    if (d < today || d.getDay() === 0) return true; // past or Sunday
    
    const dStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    if (blockedDates.includes(dStr)) return true;
    
    return false;
  };

  const isSunday = (day: number) => new Date(calYear, calMonth, day).getDay() === 0;
  const isToday = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    return d.getTime() === today.getTime();
  };
  const isSelected = (day: number) => {
    if (!data.date) return false;
    const d = new Date(calYear, calMonth, day);
    return d.toDateString() === data.date.toDateString();
  };

  const canGoPrevMonth = () => {
    return calYear > today.getFullYear() || calMonth > today.getMonth();
  };

  // Fetch Time Slots

  useEffect(() => {
    if (step === 3 && data.date) {
      setSlotsLoading(true);
      setSlotsError('');
      const dStr = `${data.date.getFullYear()}-${(data.date.getMonth() + 1).toString().padStart(2, '0')}-${data.date.getDate().toString().padStart(2, '0')}`;
      fetch(`/api/slots?date=${dStr}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.error || resData.message) {
            setSlotsError(resData.error || resData.message);
            setAvailableSlots([]);
          } else if (resData.groupedSlots) {
            const icons = { Morning: Sun, Afternoon: Cloud, Evening: Moon };
            const mapped = resData.groupedSlots.map((g: any) => ({
              ...g,
              icon: icons[g.period as keyof typeof icons] || Sun
            }));
            setAvailableSlots(mapped);
          }
        })
        .catch(() => setSlotsError('Failed to load time slots'))
        .finally(() => setSlotsLoading(false));
    }
  }, [step, data.date]);

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatDate = (d: Date | null) => {
    if (!d) return '';
    return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const fee = data.type === 'online' ? 500 : 800;

  if (success) {
    return (
      <div className="booking-body">
        <div className="booking-success">
          <div className="success-icon"><CheckCircle size={40} /></div>
          <h2>Booking Requested!</h2>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '8px' }}>
            Your appointment request has been sent to the doctor.
          </p>
          <div className="booking-id">{bookingId}</div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-light)', maxWidth: '400px', margin: '16px auto' }}>
            You will receive an email once the doctor reviews and confirms your appointment.
            {data.type === 'online' && ' The video call link will be shared upon confirmation.'}
          </p>
          <Link href="/dashboard" className="btn btn-primary btn-lg" style={{ marginTop: '16px' }}>
            <Home size={18} /> Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-body">
      {/* Progress Bar */}
      <div className="booking-progress">
        <div
          className="booking-progress-line"
          style={{ width: `calc(${((step - 1) / (STEPS.length - 1)) * 100}% - 40px)` }}
        />
        {STEPS.map((label, i) => (
          <div key={label} className={`progress-step ${i + 1 === step ? 'active' : ''} ${i + 1 < step ? 'completed' : ''}`}>
            <div className="progress-step-circle">
              {i + 1 < step ? <Check size={16} /> : i + 1}
            </div>
            <span className="progress-step-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Type */}
      {step === 1 && (
        <div className="booking-step">
          <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Choose Appointment Type</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '32px' }}>
            Select how you&apos;d like to consult with the doctor
          </p>
          <div className="type-cards">
            <div className={`type-card ${data.type === 'offline' ? 'selected' : ''}`} onClick={() => setData({ ...data, type: 'offline' })} id="type-offline">
              <div className="type-card-check"><Check size={14} /></div>
              <div className="type-card-icon"><Stethoscope size={28} /></div>
              <h3>In-Clinic Visit</h3>
              <p>Visit our clinic for a face-to-face consultation with the doctor.</p>
              <div className="type-card-meta">
                <span><Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />30 min</span>
                <span>VARDAAN CLINIC, Lucknow</span>
              </div>
              <div className="type-card-price">₹800</div>
            </div>
            <div className={`type-card ${data.type === 'online' ? 'selected' : ''}`} onClick={() => setData({ ...data, type: 'online' })} id="type-online">
              <div className="type-card-check"><Check size={14} /></div>
              <div className="type-card-icon"><Video size={28} /></div>
              <h3>Online Consultation</h3>
              <p>Video call consultation from anywhere. Secure and convenient.</p>
              <div className="type-card-meta">
                <span><Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />30 min</span>
                <span>Via secure video call</span>
              </div>
              <div className="type-card-price">₹500</div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Date */}
      {step === 2 && (
        <div className="booking-step">
          <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Select Date</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '32px' }}>
            Choose a convenient date for your appointment
          </p>
          <div className="calendar">
            <div className="calendar-header">
              <button className="calendar-nav" onClick={() => { if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); } else setCalMonth(calMonth - 1); }} disabled={!canGoPrevMonth()} id="cal-prev">
                <ChevronLeft size={18} />
              </button>
              <h3>{monthName}</h3>
              <button className="calendar-nav" onClick={() => { if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); } else setCalMonth(calMonth + 1); }} id="cal-next">
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="calendar-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="calendar-weekday">{d}</div>
              ))}
            </div>
            <div className="calendar-days">
              {/* Empty cells for days before month start */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`e${i}`} className="calendar-day empty" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const disabled = isDateDisabled(day);
                const sunday = isSunday(day);
                return (
                  <button
                    key={day}
                    className={`calendar-day ${disabled ? 'disabled' : 'available'} ${sunday ? 'sunday' : ''} ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`}
                    disabled={disabled}
                    onClick={() => setData({ ...data, date: new Date(calYear, calMonth, day), time: '' })}
                    id={`cal-day-${day}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="booking-step">
          <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Select Time Slot</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '32px' }}>
            Available slots for {formatDate(data.date)}
          </p>

          {slotsLoading && <p style={{ textAlign: 'center' }}>Loading slots...</p>}
          {slotsError && <p style={{ textAlign: 'center', color: 'var(--color-error)' }}>{slotsError}</p>}
          {!slotsLoading && !slotsError && availableSlots.length === 0 && (
             <p style={{ textAlign: 'center' }}>No available slots for this date.</p>
          )}

          {!slotsLoading && availableSlots.map(({ period, icon: Icon, slots }) => (
            <div key={period} className="time-section">
              <h4><Icon size={18} /> {period}</h4>
              <div className="time-grid">
                {slots.map((s) => {
                  return (
                    <button
                      key={s.time}
                      className={`time-slot ${data.time === s.time ? 'selected' : ''} ${s.booked ? 'booked' : ''}`}
                      disabled={s.booked}
                      onClick={() => setData({ ...data, time: s.time })}
                      id={`slot-${s.time.replace(':', '')}`}
                    >
                      {formatTime(s.time)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 4: Details */}
      {step === 4 && (
        <div className="booking-step">
          <div className="details-form">
            <h3>Patient Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="book-name">Full Name *</label>
                <input id="book-name" type="text" className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Enter your full name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="book-email">Email *</label>
                <input id="book-email" type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="your@email.com" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="book-phone">Phone *</label>
                <input id="book-phone" type="tel" className={`form-input ${errors.phone ? 'error' : ''}`} placeholder="10-digit number" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
                {errors.phone && <p className="form-error">{errors.phone}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="book-age">Age</label>
                <input id="book-age" type="number" className="form-input" placeholder="Age" value={data.age} onChange={(e) => setData({ ...data, age: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="book-gender">Gender</label>
              <select id="book-gender" className="form-input form-select" value={data.gender} onChange={(e) => setData({ ...data, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="book-reason">Reason for Visit</label>
              <textarea id="book-reason" className="form-input form-textarea" placeholder="Briefly describe your symptoms or reason for the appointment..." value={data.reason} onChange={(e) => setData({ ...data, reason: e.target.value })} />
            </div>
            <div className="form-checkbox">
              <input type="checkbox" id="book-terms" checked={data.terms} onChange={(e) => setData({ ...data, terms: e.target.checked })} />
              <label htmlFor="book-terms">I agree to the terms and conditions and consent to sharing my health information with the doctor for consultation purposes.</label>
            </div>
            {errors.terms && <p className="form-error" style={{ marginTop: '4px' }}>{errors.terms}</p>}
          </div>
        </div>
      )}

      {/* Step 5: Confirm */}
      {step === 5 && (
        <div className="booking-step">
          <div className="confirm-card">
            <div className="confirm-header">
              <h3>Booking Summary</h3>
              <p>Please review your appointment details</p>
            </div>
            <div className="confirm-body">
              <div className="confirm-row">
                <span className="confirm-label"><Calendar size={16} /> Type</span>
                <span className="confirm-value">{data.type === 'online' ? '📹 Online Video Call' : '🏥 In-Clinic Visit'}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label"><Calendar size={16} /> Date</span>
                <span className="confirm-value">{formatDate(data.date)}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label"><Clock size={16} /> Time</span>
                <span className="confirm-value">{formatTime(data.time)}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label"><User size={16} /> Patient</span>
                <span className="confirm-value">{data.name}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label"><Mail size={16} /> Email</span>
                <span className="confirm-value">{data.email}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label"><Phone size={16} /> Phone</span>
                <span className="confirm-value">{data.phone}</span>
              </div>
              {data.reason && (
                <div className="confirm-row">
                  <span className="confirm-label"><FileText size={16} /> Reason</span>
                  <span className="confirm-value" style={{ maxWidth: '300px' }}>{data.reason}</span>
                </div>
              )}
              <div className="confirm-total">
                <span className="confirm-total-label">Total Fee</span>
                <span className="confirm-total-price">₹{fee}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="booking-nav">
        <button className="btn btn-ghost" onClick={() => setStep(step - 1)} disabled={step === 1} style={{ visibility: step === 1 ? 'hidden' : 'visible' }}>
          <ArrowLeft size={18} /> Back
        </button>
        {step < 5 ? (
          <button className="btn btn-primary" onClick={handleNext} disabled={!canNext()} id="booking-next">
            Next <ArrowRight size={18} />
          </button>
        ) : (
          <button className="btn btn-accent btn-lg" onClick={handleConfirm} disabled={loading} id="booking-confirm">
            {loading ? 'Sending Request...' : <><Check size={18} /> Request Appointment</>}
          </button>
        )}
      </div>
    </div>
  );
}
