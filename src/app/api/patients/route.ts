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
    const search = searchParams.get("search") || "";

    let query = supabase
      .from('profiles')
      .select('*, appointments(id, date)')
      .eq('role', 'patient');

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data: patients, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    const formattedPatients = patients.map((p) => {
      // Sort appointments by date descending to find the last visit
      const sortedAppointments = p.appointments?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
      return {
        ...p,
        totalVisits: p.appointments?.length || 0,
        lastVisit: sortedAppointments[0]?.date || null,
      };
    });

    return NextResponse.json({ patients: formattedPatients });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
