# Keys to AI Control Center

## Goals

This schema is designed to support all three build phases while keeping Phase 1 simple to ship:

- Phase 1: content pipeline, video library, trending feed, calendar, budget, quick-add
- Phase 2: SEO, attribution, affiliate analytics, audience insights, newsletter tracking, YouTube analytics sync
- Phase 3: competition, collaboration, content pillars, experiments, tool ROI

The design uses a small set of core entities with extension tables for analytics and operations. That keeps the MVP lean without forcing structural rewrites later.

## Core Design Principles

- Use UUID primary keys on all business tables
- Keep `content_items` as the canonical record for an idea or published asset
- Separate planned data from measured performance
- Store external sync identifiers explicitly for YouTube, Make.com, and newsletter tools
- Use append-friendly event tables where trend or metric history matters
- Keep manual entry fast with a few defaults and nullable advanced fields

## Entity Overview

### Content Planning and Production

#### `content_items`

Canonical record for an idea or published content asset.

Key fields:

- `id`: UUID primary key
- `title`: working or final title
- `slug`: optional public slug
- `content_type`: `video`, `short`, `newsletter`, `blog`, `other`
- `status`: `idea`, `script`, `produced`, `edited`, `scheduled`, `published`, `archived`
- `priority`: small integer for queue ordering
- `description`: summary or angle
- `hook`: opening angle
- `script_url`: optional link to script doc
- `asset_folder_url`: optional production folder link
- `published_at`: publication timestamp
- `scheduled_for`: planned publish time
- `youtube_video_id`: external ID for YouTube sync
- `source_channel`: `manual`, `trend_feed`, `make_webhook`, `api_import`
- `created_by`: owner user ID
- timestamps

Why it exists:

- Supports the Phase 1 pipeline directly
- Lets videos and future newsletters share one workflow model
- Prevents separate ideas and videos tables from drifting

#### `content_tags`

Reusable labels for topics, platforms, and initiatives.

Fields:

- `id`
- `name`
- `tag_type`: `topic`, `pillar`, `format`, `campaign`, `keyword`
- timestamps

#### `content_item_tags`

Join table between content and tags.

Why it exists:

- Supports content pillars in Phase 3
- Helps filter the library and calendar early

#### `content_checkpoints`

Operational timeline of status changes and production milestones.

Fields:

- `id`
- `content_item_id`
- `checkpoint_type`: `status_change`, `script_done`, `filmed`, `edited`, `published`
- `from_status`
- `to_status`
- `notes`
- `created_by`
- `created_at`

Why it exists:

- Gives historical visibility without overloading the main row
- Useful later for team handoffs and lead-time reporting

### Publishing Calendar

#### `calendar_entries`

Explicit planning records for content and non-content events.

Fields:

- `id`
- `content_item_id` nullable
- `title`
- `entry_type`: `publish`, `recording`, `editing`, `deadline`, `campaign`, `other`
- `starts_at`
- `ends_at`
- `all_day`
- `status`: `planned`, `confirmed`, `completed`, `canceled`
- `notes`
- timestamps

Why it exists:

- Keeps the calendar flexible beyond publish dates
- Avoids stuffing all scheduling into `content_items`

### Trending Topics Feed

#### `trend_sources`

Configured sources for trend ingestion.

#### `trending_topics`

Inbound trend candidates from Make.com or manual capture.

Fields:

- `id`
- `trend_source_id`
- `title`
- `summary`
- `topic_url`
- `platform`: `youtube`, `google`, `x`, `newsletter`, `other`
- `signal_score`
- `velocity_score`
- `relevance_score`
- `raw_payload`
- `observed_at`
- `expires_at`
- timestamps

Why it exists:

- Phase 1 feed works immediately
- Raw payload retention lets you improve scoring later

#### `content_trend_links`

Maps adopted trends to content ideas.

### Financial Tracking

#### `accounts`

Optional buckets for business cashflow reporting.

#### `transactions`

Unified expenses and revenue table.

Fields:

- `id`
- `account_id` nullable
- `content_item_id` nullable
- `transaction_type`: `expense`, `revenue`
- `category`: `software`, `contractor`, `equipment`, `affiliate`, `adsense`, `sponsorship`, `newsletter`, `other`
- `vendor_name`
- `description`
- `amount`
- `currency_code`
- `transaction_date`
- `payment_method`
- `external_ref`
- `notes`
- timestamps

Why it exists:

- Phase 1 budget tracking only needs one ledger
- Revenue can already attach to a video when known

### Quick Add and Inbound Capture

#### `inbox_items`

Fast capture for ideas, costs, or follow-ups before classification.

Fields:

- `id`
- `inbox_type`: `idea`, `expense`, `trend`, `task`, `note`
- `title`
- `body`
- `source`: `manual`, `mobile`, `webhook`
- `status`: `new`, `processed`, `dismissed`
- `processed_into_table`
- `processed_into_id`
- timestamps

Why it exists:

- Gives you a true quick-add layer
- Lets the UI capture first and normalize second

## Phase 2 Analytics Extensions

### `content_performance_daily`

Daily snapshot metrics by content item.

### `traffic_sources` and `content_traffic_daily`

Traffic attribution per content item and day.

### `affiliate_products`, `content_affiliate_links`, `affiliate_performance_daily`

Product-level conversion and commission tracking.

### `audience_snapshots`

Channel-level growth metrics by platform.

### `newsletter_campaigns` and `newsletter_content_links`

Newsletter send reporting and content attribution.

## Phase 3 Operational Extensions

### `team_members` and `content_assignments`

Collaboration workflow for editors, writers, and contractors.

### `competitors` and `competitor_content`

Competitive intelligence tracking.

### `experiments` and `experiment_content_links`

Hypothesis-driven testing across thumbnails, hooks, SEO, and workflow.

### `tools` and `tool_roi_entries`

Software spend and value tracking.

## Key Relationships

- `content_items` -> many `content_item_tags`
- `content_items` -> many `content_checkpoints`
- `content_items` -> many `calendar_entries`
- `content_items` -> many `transactions`
- `content_items` -> many `content_performance_daily`
- `content_items` -> many `content_traffic_daily`
- `content_items` -> many `content_affiliate_links`
- `content_items` -> many `newsletter_content_links`
- `content_items` -> many `content_assignments`
- `content_items` -> many `experiment_content_links`
- `trending_topics` -> many `content_trend_links`
- `affiliate_products` -> many `affiliate_performance_daily`

## Phase 1 MVP Table Set

Only these tables are required to ship the MVP:

- `content_items`
- `content_tags`
- `content_item_tags`
- `content_checkpoints`
- `calendar_entries`
- `trend_sources`
- `trending_topics`
- `content_trend_links`
- `accounts`
- `transactions`
- `inbox_items`

## Suggested API Surface for Phase 1

### Content

- `GET /api/content`
- `POST /api/content`
- `PATCH /api/content/:id`
- `POST /api/content/:id/status`
- `GET /api/content/:id`

### Trending

- `GET /api/trends`
- `POST /api/trends/webhook`
- `POST /api/trends/:id/link-content`

### Calendar

- `GET /api/calendar`
- `POST /api/calendar`
- `PATCH /api/calendar/:id`

### Finance

- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/finance/summary`

### Inbox / Quick Add

- `GET /api/inbox`
- `POST /api/inbox`
- `POST /api/inbox/:id/process`

## Data Flow Summary

### Content pipeline

1. Quick-add creates an `inbox_items` row or direct `content_items` row
2. Idea is promoted into `content_items`
3. Status transitions write `content_checkpoints`
4. Publish scheduling creates or updates `calendar_entries`
5. After publish, metrics sync into analytics tables

### Trend ingestion

1. Make.com or Perplexity sends a trend payload
2. Payload lands in `trending_topics`
3. User links a trend to a content idea via `content_trend_links`
4. Resulting video later inherits attribution context

### Financial tracking

1. Expense or revenue is quick-added
2. Data becomes a `transactions` row
3. Revenue can attach to a `content_item`
4. Later, affiliate and newsletter detail enrich attribution

## Notes for Supabase

- Enable `pgcrypto` for `gen_random_uuid()`
- Use `jsonb` for external payloads and source configs
- Add indexes on status/date columns used in dashboards
- Add unique constraint on `youtube_video_id` when present
- Start with a single-user model, then tighten RLS when collaboration begins

## Recommended Next Build Order

1. Apply the initial migration
2. Generate TypeScript types from Supabase
3. Build Phase 1 dashboard queries and mutations
4. Add Make.com webhook ingestion
5. Add YouTube sync jobs in Phase 2
