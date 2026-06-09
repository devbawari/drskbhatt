'use client';

import { useState } from 'react';
import Script from 'next/script';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RazorpayCheckout({
  appointmentId,
  amount,
  patientName,
  patientEmail,
  patientPhone
}: {
  appointmentId: string;
  amount: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setIsProcessing(true);

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

    // MOCK PAYMENT FLOW FOR LOCAL DEVELOPMENT WITHOUT KEYS
    if (razorpayKey === 'rzp_test_placeholder') {
      alert("Test Mode: No Razorpay Key found. Simulating a successful payment locally...");
      setTimeout(async () => {
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: 'mock_payment_123',
            razorpay_order_id: 'mock_order_123',
            razorpay_signature: 'mock_sig',
            appointment_id: appointmentId
          })
        });

        if (res.ok) {
          setSuccess(true);
        } else {
          alert('Payment verification failed on server.');
          setIsProcessing(false);
        }
      }, 1500);
      return;
    }

    const options = {
      key: razorpayKey, // Enter the Key ID generated from the Dashboard
      amount: amount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: 'INR',
      name: 'Vardaan Homeopathy Clinic',
      description: 'Appointment Consultation Fee',
      image: 'https://drskbhatt.in/images/vardaan-homeopathy-clinic.png', // Optional
      handler: async function (response: any) {
        // Ping our server to verify and upgrade status
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            appointment_id: appointmentId
          })
        });

        if (res.ok) {
          setSuccess(true);
        } else {
          alert('Payment verification failed on server.');
          setIsProcessing(false);
        }
      },
      prefill: {
        name: patientName,
        email: patientEmail,
        contact: patientPhone
      },
      theme: {
        color: '#0D4F4F' // Primary color
      }
    };

    if (typeof (window as any).Razorpay === 'undefined') {
      alert('Razorpay SDK is still loading or failed to load. Please check your internet connection or try again in a few seconds.');
      setIsProcessing(false);
      return;
    }

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err: any) {
      alert(`Razorpay Error: ${err.message || 'Failed to initialize payment gateway'}`);
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--color-success-bg)', borderRadius: '12px' }}>
        <CheckCircle size={48} color="var(--color-success)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ color: 'var(--color-success)', marginBottom: '8px' }}>Payment Successful!</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Your appointment is now fully confirmed.</p>
        <button 
          className="admin-btn admin-btn-primary" 
          onClick={() => router.push('/')}
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button 
        className="admin-btn admin-btn-primary" 
        style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '16px' }}
        onClick={handlePayment} 
        disabled={isProcessing}
      >
        {isProcessing ? 'Waiting for Checkout...' : `Pay ₹${amount} Securely via Razorpay`}
      </button>
    </>
  );
}
