import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: existingLink, error: existingError } = await supabase
    .from("content_trend_links")
    .select("content_item_id")
    .eq("trending_topic_id", id)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existingLink) {
    return NextResponse.json(
      { error: "This trend is already linked to a content item." },
      { status: 409 }
    );
  }

  const { data: trend, error: trendError } = await supabase
    .from("trending_topics")
    .select("title,keyword_context,topic_url")
    .eq("id", id)
    .single();

  if (trendError) {
    return NextResponse.json({ error: trendError.message }, { status: 500 });
  }

  const { data: content, error: contentError } = await supabase
    .from("content_items")
    .insert({
      title: trend.title,
      content_type: "video",
      status: "idea",
      priority: 2,
      description: trend.keyword_context || "Promoted from Trend Radar",
      hook: trend.topic_url ? `Source: ${trend.topic_url}` : null,
      source_channel: "trend_feed"
    })
    .select()
    .single();

  if (contentError) {
    return NextResponse.json({ error: contentError.message }, { status: 500 });
  }

  const { error: linkError } = await supabase.from("content_trend_links").insert({
    trending_topic_id: id,
    content_item_id: content.id,
    link_type: "inspired_by"
  });

  if (linkError) {
    await supabase.from("content_items").delete().eq("id", content.id);
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

  return NextResponse.json({ data: content }, { status: 201 });
}
