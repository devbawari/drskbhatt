'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function cancelAppointment(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Verify ownership
    const { data: appointment } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('id', id)
      .single()

    if (!appointment || appointment.patient_id !== user.id) {
      throw new Error('Unauthorized')
    }

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Failed to cancel appointment:', error)
    return { success: false, error: 'Failed to cancel appointment' }
  }
}

export async function markPatientMessagesAsRead(doctorId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', doctorId)
      .eq('recipient_id', user.id)
      .is('read_at', null);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    return { success: false };
  }
}
