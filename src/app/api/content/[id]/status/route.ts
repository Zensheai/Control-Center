import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  const { data: current, error: fetchError } = await supabase
    .from("content_items")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("content_items")
    .update({ status: body.status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("content_checkpoints").insert({
    content_item_id: id,
    checkpoint_type: "status_change",
    from_status: current.status,
    to_status: body.status,
    notes: body.notes ?? null
  });

  return NextResponse.json({ data });
}
