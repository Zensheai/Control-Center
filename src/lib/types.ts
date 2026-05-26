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
  scheduled_for: string | null;
  published_at: string | null;
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
  title: string;
  entry_type: string;
  starts_at: string;
  ends_at: string | null;
  status: string;
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
  status: string;
  created_at: string;
};
