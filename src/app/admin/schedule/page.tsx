import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import ScheduleClient from './ScheduleClient';

export default async function SchedulePage() {
  const supabase = await createClient();

  const [{ data: schedule }, { data: blockedDates }] = await Promise.all([
    supabase.from('availability').select('*').order('day_of_week', { ascending: true }),
    supabase.from('blocked_dates').select('*').order('date', { ascending: true })
  ]);

  // Map to the format expected by the client component
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // We want an array of 7 items (0 to 6)
  const formattedSchedule = Array.from({ length: 7 }).map((_, dayNum) => {
    const activeDay = schedule?.find((s: any) => s.day_of_week === dayNum);
    return {
      id: activeDay ? activeDay.id : `new-${dayNum}`,
      day: dayNames[dayNum],
      dayNum,
      startTime: activeDay ? activeDay.start_time.substring(0, 5) : '09:00', // slice "HH:MM:SS" to "HH:MM"
      endTime: activeDay ? activeDay.end_time.substring(0, 5) : '17:00',
      slotDuration: activeDay ? activeDay.slot_minutes : 30,
      active: !!activeDay
    };
  });

  const formattedBlocked = (blockedDates || []).map((b: any) => ({
    id: b.id,
    date: b.date,
    reason: b.reason || ''
  }));

  // Reorder so Monday is first
  const reordered = [
    ...formattedSchedule.filter(s => s.dayNum !== 0),
    ...formattedSchedule.filter(s => s.dayNum === 0)
  ];

  return <ScheduleClient initialSchedule={reordered} initialBlocked={formattedBlocked} />;
}
