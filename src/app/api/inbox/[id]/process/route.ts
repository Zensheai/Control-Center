import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("inbox_items")
    .update({
      status: "processed",
      processed_into_table: body.processed_into_table ?? null,
      processed_into_id: body.processed_into_id ?? null
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
