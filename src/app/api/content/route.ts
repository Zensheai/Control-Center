import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("content_items")
    .insert({
      title: body.title,
      content_type: body.content_type ?? "video",
      status: body.status ?? "idea",
      priority: body.priority ?? 3,
      description: body.description ?? null,
      hook: body.hook ?? null,
      scheduled_for: body.scheduled_for ?? null,
      source_channel: body.source_channel ?? "manual"
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
