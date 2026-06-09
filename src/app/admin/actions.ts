'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

export async function updateAppointmentStatus(id: string, status: string, roomUrl?: string) {
  try {
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const updateData: any = { status };
    if (roomUrl) {
      updateData.room_url = roomUrl;
    }

    const { data: appointment, error } = await adminClient
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select('patient_name, patient_email, scheduled_at')
      .single();

    if (error) throw error;

    if (status === 'pending_payment' && appointment) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      await resend.emails.send({
        from: 'Dr. SK Bhatt <appointments@drskbhatt.in>',
        to: appointment.patient_email,
        subject: 'Appointment Approved - Complete Your Secure Payment',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0D4F4F;">Hello ${appointment.patient_name},</h2>
            <p>Dr. SK Bhatt has accepted your appointment request for <strong>${new Date(appointment.scheduled_at).toLocaleString()}</strong>.</p>
            <p>To securely confirm your slot and receive your consultation access, please complete your payment.</p>
            <a href="https://drskbhatt.in/appointments/${id}/pay" style="display: inline-block; background-color: #0D4F4F; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; text-align: center;">Complete Payment</a>
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 32px; margin-bottom: 32px;" />
            <p style="font-size: 0.85em; color: #666;">If you have any questions, please contact Vardaan Homeopathy Clinic.</p>
          </div>
        `
      });
    }

    revalidatePath('/admin/appointments');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Failed to update appointment:', error);
    return { success: false, error: 'Failed to update appointment' };
  }
}

export async function sendMessage(recipientId: string, patientId: string, content: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: msg, error } = await adminClient
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        patient_id: patientId, // Context of the chat
        content,
        // read_at is null by default
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin/messages');
    return { success: true, message: {
      id: msg.id,
      sender_id: msg.sender_id,
      content: msg.content,
      time: new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } };
  } catch (error) {
    console.error('Failed to send message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

export async function markMessagesAsRead(senderId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await adminClient
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', senderId)
      .eq('recipient_id', user.id)
      .is('read_at', null);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    return { success: false };
  }
}

export async function updateSchedule(schedule: any[], blocked: any[] = []) {
  try {
    // We must use the admin client because the `availability` table RLS policy is read-only
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Clear existing availability to replace with the new config
    const { error: deleteError } = await adminClient
      .from('availability')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) throw deleteError;

    // Filter only active days and map to new schema
    const activeDays = schedule
      .filter((s) => s.active || s.is_active)
      .map((s) => ({
        day_of_week: s.dayNum !== undefined ? s.dayNum : s.day_of_week,
        start_time: (s.startTime || s.start_time) + ':00', // Time columns require seconds "HH:MM:SS"
        end_time: (s.endTime || s.end_time) + ':00',
        slot_minutes: s.slotDuration || s.slot_minutes || s.slot_duration
      }));

    if (activeDays.length > 0) {
      const { error: insertError } = await adminClient
        .from('availability')
        .insert(activeDays);
        
      if (insertError) throw insertError;
    }

    // Now handle blocked dates
    const { error: deleteBlockedError } = await adminClient
      .from('blocked_dates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all existing
      
    if (deleteBlockedError) throw deleteBlockedError;

    const blockedToInsert = blocked.map(b => ({
      date: b.date,
      reason: b.reason || 'Blocked'
    }));

    if (blockedToInsert.length > 0) {
      const { error: insertBlockedError } = await adminClient
        .from('blocked_dates')
        .insert(blockedToInsert);
      
      if (insertBlockedError) throw insertBlockedError;
    }

    revalidatePath('/admin/schedule');
    revalidatePath('/booking');
    return { success: true };
  } catch (error) {
    console.error('Failed to update schedule:', error);
    return { success: false, error: 'Failed to update schedule' };
  }
}

export async function startTelehealthSession(appointmentId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Security Check: Only generate room if appointment is paid/confirmed
    const { data: apt, error: aptError } = await adminClient
      .from('appointments')
      .select('status')
      .eq('id', appointmentId)
      .single();

    if (aptError || !apt) throw new Error("Appointment not found");
    if (apt.status !== 'confirmed') {
      throw new Error("Cannot start telehealth session. Payment is pending or appointment is not confirmed.");
    }

    const API_KEY = process.env.DAILY_API_KEY;
    if (!API_KEY) throw new Error("DAILY_API_KEY is not configured in environment variables.");

    // Generate a short-lived room on Daily.co
    const roomRes = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
          enable_knocking: false,
          enable_screenshare: false,
          enable_chat: false
        }
      })
    });

    if (!roomRes.ok) {
      throw new Error(`Daily.co API Error: ${await roomRes.text()}`);
    }

    const roomData = await roomRes.json();
    const roomUrl = roomData.url;



    const { error } = await adminClient
      .from('appointments')
      .update({ 
        room_url: roomUrl,
        telehealth_state: 'active'
      })
      .eq('id', appointmentId);

    if (error) throw error;

    revalidatePath('/admin/appointments');
    revalidatePath('/dashboard');
    return { success: true, roomUrl };
  } catch (error: any) {
    console.error('Telehealth Start Error:', error);
    return { success: false, error: error.message };
  }
}

export async function endTelehealthSession(appointmentId: string) {
  try {
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await adminClient
      .from('appointments')
      .update({ 
        telehealth_state: 'completed',
        status: 'completed'
      })
      .eq('id', appointmentId);

    if (error) throw error;

    revalidatePath('/admin/appointments');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Telehealth End Error:', error);
    return { success: false, error: error.message };
  }
}
