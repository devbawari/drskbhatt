import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import RazorpayCheckout from '@/components/booking/RazorpayCheckout';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // We use the admin client here so patients without an active auth session 
  // can still access the payment link if they have the exact URL (e.g. from an email).
  // If strict auth is required, we would use the regular server client.
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: appointment, error } = await adminClient
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !appointment) {
    notFound();
  }

  // Security Check: Only allow access if strictly pending_payment
  if (appointment.status === 'confirmed') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ background: 'var(--color-surface)', padding: '3rem', borderRadius: '16px', boxShadow: 'var(--shadow-md)', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: 'var(--color-success)', marginBottom: '16px' }}>Already Paid!</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>This appointment has already been paid for and is fully confirmed.</p>
        </div>
      </div>
    );
  }

  if (appointment.status !== 'pending_payment') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ background: 'var(--color-surface)', padding: '3rem', borderRadius: '16px', boxShadow: 'var(--shadow-md)', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: 'var(--color-error)', marginBottom: '16px' }}>Invalid State</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>This appointment is not currently awaiting payment. Its status is: <strong>{appointment.status.replace('_', ' ')}</strong></p>
        </div>
      </div>
    );
  }

  // Calculate amount based on type
  const amount = appointment.visit_type === 'virtual' ? 500 : 800; // Hardcoded per clinic rules

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--color-surface)', padding: '3rem', borderRadius: '16px', boxShadow: 'var(--shadow-md)', maxWidth: '450px', width: '90%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '8px' }}>Complete Payment</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Secure checkout via Razorpay</p>
        </div>

        <div style={{ background: 'var(--color-bg-alt)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Patient</span>
            <span style={{ fontWeight: 600 }}>{appointment.patient_name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Appointment</span>
            <span style={{ fontWeight: 600 }}>{new Date(appointment.scheduled_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Type</span>
            <span style={{ fontWeight: 600 }}>{appointment.visit_type === 'virtual' ? 'Online Video' : 'In-Clinic'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Total Fee</span>
            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)' }}>₹{amount}</span>
          </div>
        </div>

        <RazorpayCheckout 
          appointmentId={appointment.id} 
          amount={amount}
          patientName={appointment.patient_name}
          patientEmail={appointment.patient_email}
          patientPhone={appointment.patient_phone || ''}
        />

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '1.5rem' }}>
          By paying, you agree to our terms of service and cancellation policy.
        </p>

      </div>
    </div>
  );
}
