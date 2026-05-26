import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("calendar_entries")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("calendar_entries")
    .insert({
      content_item_id: body.content_item_id ?? null,
      title: body.title,
      entry_type: body.entry_type ?? "publish",
      starts_at: body.starts_at,
      ends_at: body.ends_at ?? null,
      all_day: body.all_day ?? false,
      status: body.status ?? "planned",
      notes: body.notes ?? null
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
