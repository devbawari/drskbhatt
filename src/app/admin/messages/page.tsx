import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import MessagesClient from './MessagesClient';

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all patients who have a confirmed appointment
  const { data: confirmedAppointments } = await adminClient
    .from('appointments')
    .select('patient_id, patient_name')
    .eq('status', 'confirmed');

  // Deduplicate patients
  const patientsMap = new Map();
  confirmedAppointments?.forEach((apt: any) => {
    if (!patientsMap.has(apt.patient_id)) {
      patientsMap.set(apt.patient_id, {
        id: apt.patient_id,
        full_name: apt.patient_name
      });
    }
  });
  const patients = Array.from(patientsMap.values());

  // Get all messages
  const { data: messages } = await adminClient
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  const formattedConversations = (patients || []).map(p => {
    const patientMessages = (messages || []).filter(m => m.patient_id === p.id);
    
    // No longer filtering out patients without messages, so doctor can start chats
    // if (patientMessages.length === 0) return null;

    const unreadCount = patientMessages.filter(m => !m.read_at && m.sender_id === p.id).length;
    
    return {
      patientId: p.id,
      name: p.full_name || 'Unknown',
      unread: unreadCount > 0,
      messages: patientMessages.map(m => ({
        id: m.id,
        sender: m.sender_id === p.id ? 'patient' : 'doctor',
        content: m.content,
        time: new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      }))
    };
  }).filter(Boolean) as any[];

  // Sort conversations so unread are at the top, then by most recent message
  formattedConversations.sort((a: any, b: any) => {
    if (a.unread && !b.unread) return -1;
    if (!a.unread && b.unread) return 1;
    return 0;
  });

  return <MessagesClient initialConversations={formattedConversations} />;
}
