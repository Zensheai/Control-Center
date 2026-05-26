create extension if not exists pgcrypto;

create type public.content_type as enum ('video', 'short', 'newsletter', 'blog', 'other');
create type public.content_status as enum ('idea', 'script', 'produced', 'edited', 'scheduled', 'published', 'archived');
create type public.source_channel as enum ('manual', 'trend_feed', 'make_webhook', 'api_import');
create type public.tag_type as enum ('topic', 'pillar', 'format', 'campaign', 'keyword');
create type public.checkpoint_type as enum ('status_change', 'script_done', 'filmed', 'edited', 'published');
create type public.calendar_entry_type as enum ('publish', 'recording', 'editing', 'deadline', 'campaign', 'other');
create type public.calendar_status as enum ('planned', 'confirmed', 'completed', 'canceled');
create type public.trend_source_type as enum ('make_webhook', 'perplexity', 'manual', 'other');
create type public.platform_type as enum ('youtube', 'google', 'x', 'newsletter', 'website', 'other');
create type public.trend_link_type as enum ('inspired_by', 'response_to', 'keyword_target');
create type public.account_type as enum ('bank', 'credit', 'cash', 'platform_balance', 'other');
create type public.transaction_type as enum ('expense', 'revenue');
create type public.transaction_category as enum ('software', 'contractor', 'equipment', 'affiliate', 'adsense', 'sponsorship', 'newsletter', 'other');
create type public.inbox_type as enum ('idea', 'expense', 'trend', 'task', 'note');
create type public.inbox_status as enum ('new', 'processed', 'dismissed');
create type public.assignment_type as enum ('script', 'edit', 'thumbnail', 'research', 'publish');
create type public.assignment_status as enum ('todo', 'in_progress', 'done', 'blocked');
create type public.team_role_type as enum ('owner', 'editor', 'writer', 'researcher', 'contractor');
create type public.experiment_area_type as enum ('thumbnail', 'hook', 'seo', 'affiliate', 'newsletter', 'workflow', 'other');
create type public.experiment_status as enum ('planned', 'running', 'completed', 'canceled');
create type public.tool_status as enum ('active', 'paused', 'canceled');
create type public.link_role as enum ('primary', 'secondary', 'mention');
create type public.placement_type as enum ('description', 'pinned_comment', 'newsletter', 'cta', 'other');

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  content_type public.content_type not null default 'video',
  status public.content_status not null default 'idea',
  priority smallint not null default 3,
  description text,
  hook text,
  script_url text,
  asset_folder_url text,
  published_at timestamptz,
  scheduled_for timestamptz,
  youtube_video_id text,
  source_channel public.source_channel not null default 'manual',
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index content_items_slug_key on public.content_items (slug) where slug is not null;
create unique index content_items_youtube_video_id_key on public.content_items (youtube_video_id) where youtube_video_id is not null;
create index content_items_status_idx on public.content_items (status);
create index content_items_scheduled_for_idx on public.content_items (scheduled_for);
create index content_items_published_at_idx on public.content_items (published_at);

create table public.content_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  tag_type public.tag_type not null default 'topic',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_item_tags (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  content_tag_id uuid not null references public.content_tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (content_item_id, content_tag_id)
);

create table public.content_checkpoints (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  checkpoint_type public.checkpoint_type not null,
  from_status public.content_status,
  to_status public.content_status,
  notes text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index content_checkpoints_content_item_id_idx on public.content_checkpoints (content_item_id, created_at desc);

create table public.calendar_entries (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.content_items (id) on delete set null,
  title text not null,
  entry_type public.calendar_entry_type not null default 'publish',
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  status public.calendar_status not null default 'planned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create index calendar_entries_starts_at_idx on public.calendar_entries (starts_at);
create index calendar_entries_content_item_id_idx on public.calendar_entries (content_item_id);

create table public.trend_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  source_type public.trend_source_type not null,
  is_active boolean not null default true,
  config_jsonb jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trending_topics (
  id uuid primary key default gen_random_uuid(),
  trend_source_id uuid references public.trend_sources (id) on delete set null,
  title text not null,
  summary text,
  topic_url text,
  platform public.platform_type not null default 'other',
  signal_score numeric(10, 2),
  velocity_score numeric(10, 2),
  relevance_score numeric(10, 2),
  raw_payload jsonb not null default '{}'::jsonb,
  observed_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trending_topics_observed_at_idx on public.trending_topics (observed_at desc);
create index trending_topics_platform_idx on public.trending_topics (platform);

create table public.content_trend_links (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  trending_topic_id uuid not null references public.trending_topics (id) on delete cascade,
  link_type public.trend_link_type not null default 'inspired_by',
  created_at timestamptz not null default now(),
  unique (content_item_id, trending_topic_id, link_type)
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  account_type public.account_type not null default 'bank',
  currency_code text not null default 'USD',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(currency_code) = 3)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts (id) on delete set null,
  content_item_id uuid references public.content_items (id) on delete set null,
  transaction_type public.transaction_type not null,
  category public.transaction_category not null default 'other',
  vendor_name text,
  description text,
  amount numeric(12, 2) not null,
  currency_code text not null default 'USD',
  transaction_date date not null default current_date,
  payment_method text,
  external_ref text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount >= 0),
  check (char_length(currency_code) = 3)
);

create index transactions_transaction_date_idx on public.transactions (transaction_date desc);
create index transactions_type_category_idx on public.transactions (transaction_type, category);
create index transactions_content_item_id_idx on public.transactions (content_item_id);

create table public.inbox_items (
  id uuid primary key default gen_random_uuid(),
  inbox_type public.inbox_type not null,
  title text not null,
  body text,
  source text not null default 'manual',
  status public.inbox_status not null default 'new',
  processed_into_table text,
  processed_into_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inbox_items_status_created_at_idx on public.inbox_items (status, created_at desc);

create table public.content_performance_daily (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  metric_date date not null,
  views integer not null default 0,
  watch_time_minutes numeric(12, 2) not null default 0,
  avg_view_duration_seconds numeric(12, 2) not null default 0,
  impressions integer not null default 0,
  impressions_ctr numeric(8, 4) not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  subscribers_gained integer not null default 0,
  estimated_revenue numeric(12, 2) not null default 0,
  data_source text not null default 'youtube_api',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_item_id, metric_date)
);

create table public.traffic_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  source_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_traffic_daily (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  traffic_source_id uuid not null references public.traffic_sources (id) on delete cascade,
  metric_date date not null,
  sessions integer not null default 0,
  views integer not null default 0,
  clicks integer not null default 0,
  conversions integer not null default 0,
  revenue numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_item_id, traffic_source_id, metric_date)
);

create table public.affiliate_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  merchant_name text,
  program_name text,
  product_url text,
  default_commission_rate numeric(8, 4),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_affiliate_links (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  affiliate_product_id uuid not null references public.affiliate_products (id) on delete cascade,
  placement_type public.placement_type not null default 'description',
  tracking_code text,
  created_at timestamptz not null default now(),
  unique (content_item_id, affiliate_product_id, placement_type, tracking_code)
);

create table public.affiliate_performance_daily (
  id uuid primary key default gen_random_uuid(),
  affiliate_product_id uuid not null references public.affiliate_products (id) on delete cascade,
  content_item_id uuid references public.content_items (id) on delete set null,
  metric_date date not null,
  clicks integer not null default 0,
  orders integer not null default 0,
  conversion_rate numeric(8, 4) not null default 0,
  commission_amount numeric(12, 2) not null default 0,
  gross_revenue numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audience_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null,
  platform public.platform_type not null,
  subscribers_total integer,
  subscribers_delta integer,
  avg_open_rate numeric(8, 4),
  avg_click_rate numeric(8, 4),
  returning_viewers integer,
  unique_viewers integer,
  engagement_rate numeric(8, 4),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (snapshot_date, platform)
);

create table public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject_line text,
  sent_at timestamptz,
  audience_size integer,
  opens integer,
  clicks integer,
  revenue numeric(12, 2),
  external_campaign_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index newsletter_campaigns_external_campaign_id_key on public.newsletter_campaigns (external_campaign_id) where external_campaign_id is not null;

create table public.newsletter_content_links (
  id uuid primary key default gen_random_uuid(),
  newsletter_campaign_id uuid not null references public.newsletter_campaigns (id) on delete cascade,
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  link_role public.link_role not null default 'primary',
  created_at timestamptz not null default now(),
  unique (newsletter_campaign_id, content_item_id, link_role)
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  email text,
  role_type public.team_role_type not null default 'contractor',
  hourly_rate numeric(12, 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index team_members_email_key on public.team_members (email) where email is not null;

create table public.content_assignments (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  team_member_id uuid not null references public.team_members (id) on delete cascade,
  assignment_type public.assignment_type not null,
  status public.assignment_status not null default 'todo',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.competitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  platform public.platform_type not null default 'youtube',
  channel_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.competitor_content (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid not null references public.competitors (id) on delete cascade,
  title text not null,
  published_at timestamptz,
  views integer,
  url text,
  topic_summary text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hypothesis text not null,
  area_type public.experiment_area_type not null default 'other',
  status public.experiment_status not null default 'planned',
  start_date date,
  end_date date,
  result_summary text,
  decision text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.experiment_content_links (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.experiments (id) on delete cascade,
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (experiment_id, content_item_id)
);

create table public.tools (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  vendor_name text,
  monthly_cost numeric(12, 2),
  purpose text,
  status public.tool_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tool_roi_entries (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.tools (id) on delete cascade,
  entry_date date not null default current_date,
  estimated_value numeric(12, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tool_id, entry_date)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_content_items_updated_at before update on public.content_items for each row execute function public.set_updated_at();
create trigger set_content_tags_updated_at before update on public.content_tags for each row execute function public.set_updated_at();
create trigger set_calendar_entries_updated_at before update on public.calendar_entries for each row execute function public.set_updated_at();
create trigger set_trend_sources_updated_at before update on public.trend_sources for each row execute function public.set_updated_at();
create trigger set_trending_topics_updated_at before update on public.trending_topics for each row execute function public.set_updated_at();
create trigger set_accounts_updated_at before update on public.accounts for each row execute function public.set_updated_at();
create trigger set_transactions_updated_at before update on public.transactions for each row execute function public.set_updated_at();
create trigger set_inbox_items_updated_at before update on public.inbox_items for each row execute function public.set_updated_at();
create trigger set_content_performance_daily_updated_at before update on public.content_performance_daily for each row execute function public.set_updated_at();
create trigger set_traffic_sources_updated_at before update on public.traffic_sources for each row execute function public.set_updated_at();
create trigger set_content_traffic_daily_updated_at before update on public.content_traffic_daily for each row execute function public.set_updated_at();
create trigger set_affiliate_products_updated_at before update on public.affiliate_products for each row execute function public.set_updated_at();
create trigger set_affiliate_performance_daily_updated_at before update on public.affiliate_performance_daily for each row execute function public.set_updated_at();
create trigger set_audience_snapshots_updated_at before update on public.audience_snapshots for each row execute function public.set_updated_at();
create trigger set_newsletter_campaigns_updated_at before update on public.newsletter_campaigns for each row execute function public.set_updated_at();
create trigger set_team_members_updated_at before update on public.team_members for each row execute function public.set_updated_at();
create trigger set_content_assignments_updated_at before update on public.content_assignments for each row execute function public.set_updated_at();
create trigger set_competitors_updated_at before update on public.competitors for each row execute function public.set_updated_at();
create trigger set_competitor_content_updated_at before update on public.competitor_content for each row execute function public.set_updated_at();
create trigger set_experiments_updated_at before update on public.experiments for each row execute function public.set_updated_at();
create trigger set_tools_updated_at before update on public.tools for each row execute function public.set_updated_at();
create trigger set_tool_roi_entries_updated_at before update on public.tool_roi_entries for each row execute function public.set_updated_at();

alter table public.content_items enable row level security;
alter table public.content_tags enable row level security;
alter table public.content_item_tags enable row level security;
alter table public.content_checkpoints enable row level security;
alter table public.calendar_entries enable row level security;
alter table public.trend_sources enable row level security;
alter table public.trending_topics enable row level security;
alter table public.content_trend_links enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.inbox_items enable row level security;
alter table public.content_performance_daily enable row level security;
alter table public.traffic_sources enable row level security;
alter table public.content_traffic_daily enable row level security;
alter table public.affiliate_products enable row level security;
alter table public.content_affiliate_links enable row level security;
alter table public.affiliate_performance_daily enable row level security;
alter table public.audience_snapshots enable row level security;
alter table public.newsletter_campaigns enable row level security;
alter table public.newsletter_content_links enable row level security;
alter table public.team_members enable row level security;
alter table public.content_assignments enable row level security;
alter table public.competitors enable row level security;
alter table public.competitor_content enable row level security;
alter table public.experiments enable row level security;
alter table public.experiment_content_links enable row level security;
alter table public.tools enable row level security;
alter table public.tool_roi_entries enable row level security;

create policy "authenticated users can read content_items"
on public.content_items
for select
to authenticated
using (true);

create policy "authenticated users can manage content_items"
on public.content_items
for all
to authenticated
using (true)
with check (true);
