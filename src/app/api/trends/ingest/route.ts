import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getTrendIngestSecretHeaderName,
  hasValidIngestSecret
} from "@/lib/trends/ingest-auth";
import {
  normalizeTrendItem,
  type NormalizedTrendItem
} from "@/lib/trends/ingest";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const secretCheck = hasValidIngestSecret(request);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isAuthorized = secretCheck.ok || Boolean(user);

  if (!isAuthorized) {
    console.warn("[trends/ingest] unauthorized request", {
      hasUser: Boolean(user),
      reason: secretCheck.reason
    });

    return NextResponse.json(
      {
        error: `Unauthorized. Provide a valid ${getTrendIngestSecretHeaderName()} header or sign in first.`
      },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { items?: unknown }
    | null;

  if (!body || !Array.isArray(body.items)) {
    console.warn("[trends/ingest] invalid payload", {
      hasItemsArray: Boolean(body && Array.isArray(body.items))
    });

    return NextResponse.json(
      { error: "Payload must be an object with an items array." },
      { status: 400 }
    );
  }

  const normalizedItems: NormalizedTrendItem[] = [];
  const seenUrls = new Set<string>();
  let skipped = 0;

  for (const item of body.items) {
    const normalized = normalizeTrendItem(item as Record<string, unknown>);

    if (!normalized || seenUrls.has(normalized.url)) {
      skipped += 1;
      continue;
    }

    seenUrls.add(normalized.url);
    normalizedItems.push(normalized);
  }

  if (normalizedItems.length === 0) {
    return NextResponse.json({
      success: true,
      inserted: 0,
      skipped
    });
  }

  const urls = normalizedItems.map((item) => item.url);
  const { data: existingRows, error: existingError } = await supabase
    .from("trending_topics")
    .select("topic_url")
    .eq("platform", "youtube")
    .in("topic_url", urls);

  if (existingError) {
    console.error("[trends/ingest] failed to check duplicates", {
      message: existingError.message
    });

    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const existingUrls = new Set(
    (existingRows ?? [])
      .map((row) => row.topic_url)
      .filter((url): url is string => Boolean(url))
  );

  const rowsToInsert = normalizedItems
    .filter((item) => !existingUrls.has(item.url))
    .map((item) => ({
      title: item.title,
      topic_url: item.url,
      platform: item.platform,
      source_channel: item.source_channel,
      published_at: item.published_at,
      fetched_at: item.fetched_at,
      observed_at: item.fetched_at,
      engagement_views: item.engagement_views,
      engagement_likes: item.engagement_likes,
      keyword_context: item.keyword_context,
      raw_payload: item.raw_payload
    }));

  skipped += normalizedItems.length - rowsToInsert.length;

  if (rowsToInsert.length === 0) {
    return NextResponse.json({
      success: true,
      inserted: 0,
      skipped
    });
  }

  const { error: insertError } = await supabase
    .from("trending_topics")
    .insert(rowsToInsert);

  if (insertError) {
    console.error("[trends/ingest] failed to insert rows", {
      message: insertError.message,
      attempted: rowsToInsert.length
    });

    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  console.info("[trends/ingest] completed", {
    inserted: rowsToInsert.length,
    skipped
  });

  return NextResponse.json({
    success: true,
    inserted: rowsToInsert.length,
    skipped
  });
}
