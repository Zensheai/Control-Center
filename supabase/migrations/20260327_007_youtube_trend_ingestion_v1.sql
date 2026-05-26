alter table public.trending_topics
add column if not exists source_channel text,
add column if not exists published_at timestamptz,
add column if not exists fetched_at timestamptz,
add column if not exists engagement_views integer,
add column if not exists engagement_likes integer,
add column if not exists keyword_context text;

update public.trending_topics
set fetched_at = observed_at
where fetched_at is null;

create unique index if not exists trending_topics_platform_topic_url_key
on public.trending_topics (platform, topic_url)
where topic_url is not null;
