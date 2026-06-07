import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (patientId) {
      // Get messages for specific patient conversation
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(full_name, role),
          recipient:recipient_id(full_name, role)
        `)
        .or(`and(sender_id.eq.${patientId},recipient_id.eq.${user.id}),and(sender_id.eq.${user.id},recipient_id.eq.${patientId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mark unread messages as read (where current user is recipient)
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('sender_id', patientId)
        .eq('is_read', false);

      return NextResponse.json({ messages });
    }

    // Get all conversations (Admin view)
    // For simplicity, we just fetch profiles of patients for now. 
    // In a real app, you'd use a SQL view or complex query to get latest message per patient.
    const { data: patients, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'patient');

    if (error) throw error;

    const conversations = patients.map((p) => ({
      patientId: p.id,
      patientName: p.full_name,
      patientEmail: p.email,
      lastMessage: "",
      lastMessageTime: null,
      unreadCount: 0,
    }));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, content } = body;

    if (!recipientId || !content) {
      return NextResponse.json(
        { error: "Recipient ID and content are required" },
        { status: 400 }
      );
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
