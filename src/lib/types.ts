export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export type ContentStatus =
  | "idea"
  | "script"
  | "produced"
  | "edited"
  | "scheduled"
  | "published"
  | "archived";

export type ContentItem = {
  id: string;
  title: string;
  content_type: string;
  status: ContentStatus;
  priority: number;
  description: string | null;
  hook: string | null;
  script_url: string | null;
  asset_folder_url: string | null;
  scheduled_for: string | null;
  published_at: string | null;
  youtube_video_id: string | null;
  source_channel: string;
  created_at: string;
};

export type TrendingTopic = {
  id: string;
  title: string;
  platform: string;
  topic_url: string | null;
  source_channel: string | null;
  published_at: string | null;
  fetched_at: string | null;
  engagement_views: number | null;
  engagement_likes: number | null;
  keyword_context: string | null;
};

export type CalendarEntry = {
  id: string;
  content_item_id: string | null;
  title: string;
  entry_type: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  status: string;
  notes: string | null;
};

export type Transaction = {
  id: string;
  transaction_type: string;
  category: string;
  amount: number;
  currency_code: string;
  transaction_date: string;
  description: string | null;
};

export type InboxItem = {
  id: string;
  inbox_type: string;
  title: string;
  body: string | null;
  source: string;
  status: string;
  processed_into_table: string | null;
  processed_into_id: string | null;
  created_at: string;
};
