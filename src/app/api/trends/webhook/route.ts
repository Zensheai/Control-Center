import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("trending_topics")
    .insert({
      trend_source_id: body.trend_source_id ?? null,
      title: body.title,
      summary: body.summary ?? null,
      topic_url: body.topic_url ?? null,
      platform: body.platform ?? "other",
      signal_score: body.signal_score ?? null,
      velocity_score: body.velocity_score ?? null,
      relevance_score: body.relevance_score ?? null,
      raw_payload: body
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
