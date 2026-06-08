import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date'); // format: YYYY-MM-DD

    if (!dateStr) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const queryDate = new Date(dateStr);
    const dayOfWeek = queryDate.getDay();

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 0. Check if date is blocked
    const { data: blocked } = await adminClient
      .from('blocked_dates')
      .select('id')
      .eq('date', dateStr)
      .maybeSingle();

    if (blocked) {
      return NextResponse.json({ slots: [], message: 'Doctor is not available on this date (Holiday/Leave)' });
    }

    // 1. Get availability for this day of week
    const { data: schedule } = await adminClient
      .from('availability')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .single();

    if (!schedule) {
      return NextResponse.json({ slots: [], message: 'Doctor not available on this day' });
    }

    // 2. Generate slots (Hardcoded per user request)
    const fixedSlots = [
      // Morning: 10:30 am to 1:30 pm
      { time: '10:30', period: 'Morning' },
      { time: '11:00', period: 'Morning' },
      { time: '11:30', period: 'Morning' },
      { time: '12:00', period: 'Afternoon' },
      { time: '12:30', period: 'Afternoon' },
      { time: '13:00', period: 'Afternoon' },
      // Evening: 6:00 pm to 9:00 pm
      { time: '18:00', period: 'Evening' },
      { time: '18:30', period: 'Evening' },
      { time: '19:00', period: 'Evening' },
      { time: '19:30', period: 'Evening' },
      { time: '20:00', period: 'Evening' },
      { time: '20:30', period: 'Evening' },
    ];
    
    const slots = fixedSlots;

    // 3. Get booked appointments for this date
    // Calculate UTC bounds for IST (+05:30)
    const startDate = new Date(`${dateStr}T00:00:00+05:30`);
    const endDate = new Date(`${dateStr}T23:59:59+05:30`);

    const { data: appointments } = await adminClient
      .from('appointments')
      .select('scheduled_at')
      .gte('scheduled_at', startDate.toISOString())
      .lt('scheduled_at', endDate.toISOString())
      .in('status', ['pending', 'confirmed']);

    const bookedTimes = appointments?.map(a => {
      const dt = new Date(a.scheduled_at);
      // Format as "HH:MM" in IST
      const h = dt.toLocaleString('en-IN', { hour: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).padStart(2, '0');
      const m = dt.toLocaleString('en-IN', { minute: '2-digit', timeZone: 'Asia/Kolkata' }).padStart(2, '0');
      // Some engines format "24" for midnight, so fix if needed, but clinic hours are 09-17
      return `${h}:${m}`;
    }) || [];

    // 4. Format response and handle past times for today
    const now = new Date();
    const currentIstStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const currentIst = new Date(currentIstStr);
    const todayStr = `${currentIst.getFullYear()}-${String(currentIst.getMonth() + 1).padStart(2, '0')}-${String(currentIst.getDate()).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const currentH = currentIst.getHours();
    const currentM = currentIst.getMinutes();

    const isSlotBooked = (timeStr: string) => {
      if (bookedTimes.includes(timeStr)) return true;
      if (isToday) {
        const [h, m] = timeStr.split(':').map(Number);
        if (h < currentH || (h === currentH && m <= currentM)) return true;
      }
      return false;
    };

    const groupedSlots = [
      { period: 'Morning', slots: slots.filter(s => s.period === 'Morning').map(s => ({ time: s.time, booked: isSlotBooked(s.time) })) },
      { period: 'Afternoon', slots: slots.filter(s => s.period === 'Afternoon').map(s => ({ time: s.time, booked: isSlotBooked(s.time) })) },
      { period: 'Evening', slots: slots.filter(s => s.period === 'Evening').map(s => ({ time: s.time, booked: isSlotBooked(s.time) })) },
    ].filter(g => g.slots.length > 0);

    return NextResponse.json({ groupedSlots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}
