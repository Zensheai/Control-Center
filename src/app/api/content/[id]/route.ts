import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  const allowedFields = [
    "title",
    "content_type",
    "status",
    "priority",
    "description",
    "hook",
    "script_url",
    "asset_folder_url",
    "scheduled_for",
    "published_at",
    "youtube_video_id"
  ] as const;
  const updates: Record<string, unknown> = {};

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) updates[field] = body[field];
  });

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No supported changes were provided." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("content_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
