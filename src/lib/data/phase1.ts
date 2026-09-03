import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CalendarEntry,
  ContentItem,
  InboxItem,
  Transaction,
  TrendingTopic
} from "@/lib/types";

export async function getDashboardData() {
  const supabase = await createSupabaseServerClient();

  const [contentResult, trendsResult, calendarResult, transactionsResult, inboxResult] =
    await Promise.all([
      supabase
        .from("content_items")
        .select("id,title,content_type,status,priority,description,hook,script_url,asset_folder_url,scheduled_for,published_at,youtube_video_id,source_channel,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("trending_topics")
        .select("id,title,platform,topic_url,source_channel,published_at,fetched_at,engagement_views,engagement_likes,keyword_context")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(6),
      supabase
        .from("calendar_entries")
        .select("id,content_item_id,title,entry_type,starts_at,ends_at,all_day,status,notes")
        .order("starts_at", { ascending: true })
        .limit(100),
      supabase
        .from("transactions")
        .select("id,transaction_type,category,amount,currency_code,transaction_date,description")
        .order("transaction_date", { ascending: false })
        .limit(250),
      supabase
        .from("inbox_items")
        .select("id,inbox_type,title,body,source,status,processed_into_table,processed_into_id,created_at")
        .order("created_at", { ascending: false })
        .limit(100)
    ]);

  return {
    content: (contentResult.data ?? []) as ContentItem[],
    trends: (trendsResult.data ?? []) as TrendingTopic[],
    calendar: (calendarResult.data ?? []) as CalendarEntry[],
    transactions: (transactionsResult.data ?? []) as Transaction[],
    inbox: (inboxResult.data ?? []) as InboxItem[],
    errors: [
      contentResult.error,
      trendsResult.error,
      calendarResult.error,
      transactionsResult.error,
      inboxResult.error
    ].filter((error): error is NonNullable<typeof error> => error !== null)
  };
}
