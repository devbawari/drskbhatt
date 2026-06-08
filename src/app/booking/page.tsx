import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import BookingForm from '@/components/booking/BookingForm';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Book Appointment | DR SK BHATT',
  description: 'Book an in-clinic or online video consultation with DR SK BHATT, Homeopathic Doctor.',
};

export default async function BookingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialPatientData = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single();

    if (profile) {
      initialPatientData = {
        name: profile.full_name || '',
        email: profile.email || user.email || '',
        phone: profile.phone || ''
      };
    }
  }

  const { data: blockedQuery } = await supabase
    .from('blocked_dates')
    .select('date');
    
  const blockedDates = (blockedQuery || []).map(b => b.date);

  return (
    <div className="booking-page">
      <div className="booking-header">
        <div className="booking-header-inner">
          <Link href="/" className="booking-back">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <h1>
            <Heart size={20} fill="white" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Book Appointment
          </h1>
          <div style={{ width: '120px' }} />
        </div>
      </div>
      <BookingForm initialPatientData={initialPatientData} blockedDates={blockedDates} />
    </div>
  );
}
