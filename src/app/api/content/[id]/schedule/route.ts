import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const startsAt = new Date(String(body.starts_at ?? ""));

  if (Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: "Choose a valid publish date and time." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: content, error: contentError } = await supabase
    .from("content_items")
    .select("title,status")
    .eq("id", id)
    .single();

  if (contentError) {
    return NextResponse.json({ error: contentError.message }, { status: 500 });
  }

  const nextStatus = content.status === "published" ? "published" : "scheduled";
  const scheduledFor = startsAt.toISOString();
  const { data: updatedContent, error: updateError } = await supabase
    .from("content_items")
    .update({ scheduled_for: scheduledFor, status: nextStatus })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: existingEntry, error: existingError } = await supabase
    .from("calendar_entries")
    .select("id")
    .eq("content_item_id", id)
    .eq("entry_type", "publish")
    .neq("status", "canceled")
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const calendarPayload = {
    content_item_id: id,
    title: content.title,
    entry_type: "publish",
    starts_at: scheduledFor,
    status: "planned",
    all_day: false,
    notes: body.notes ?? null
  };

  const calendarResult = existingEntry
    ? await supabase
        .from("calendar_entries")
        .update(calendarPayload)
        .eq("id", existingEntry.id)
        .select()
        .single()
    : await supabase
        .from("calendar_entries")
        .insert(calendarPayload)
        .select()
        .single();

  if (calendarResult.error) {
    return NextResponse.json({ error: calendarResult.error.message }, { status: 500 });
  }

  if (content.status !== nextStatus) {
    await supabase.from("content_checkpoints").insert({
      content_item_id: id,
      checkpoint_type: "status_change",
      from_status: content.status,
      to_status: nextStatus,
      notes: "Scheduled from the Control Center"
    });
  }

  return NextResponse.json({
    data: { content: updatedContent, calendar: calendarResult.data }
  });
}
