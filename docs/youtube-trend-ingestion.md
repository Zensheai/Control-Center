# YouTube Trend Ingestion

This project includes a manual-first ingestion endpoint for YouTube trends:

- Endpoint: `POST /api/trends/ingest`
- Automation header: `x-ingest-secret: <your secret>`
- Auth: either send the secret header or be signed in to the app

## Payload Format

```json
{
  "items": [
    {
      "platform": "youtube",
      "title": "Best New AI Tools for Creators in 2026",
      "url": "https://www.youtube.com/watch?v=abc123xyz89",
      "source_channel": "AI Creator Daily",
      "published_at": "2026-03-27T14:00:00Z",
      "fetched_at": "2026-03-27T16:30:00Z",
      "engagement_views": 18420,
      "engagement_likes": 912,
      "keyword_context": "ai tools for creators"
    },
    {
      "platform": "youtube",
      "title": "How Agentic Workflows Are Changing Content Teams",
      "url": "https://youtu.be/def456uvw78",
      "source_channel": "Automation Weekly",
      "published_at": "2026-03-26T17:45:00Z",
      "fetched_at": "2026-03-27T16:30:00Z",
      "engagement_views": 22310,
      "engagement_likes": 1430,
      "keyword_context": "agentic workflows"
    }
  ]
}
```

## Required Headers

For automation:

```http
Content-Type: application/json
x-ingest-secret: your-shared-secret
```

The header name is:

```text
x-ingest-secret
```

## Local Manual Test

1. Start the app locally:

```powershell
cd "C:\Users\naila\OneDrive\Documents\New project"
npm.cmd run dev
```

2. Make sure `.env.local` contains:

```env
TREND_INGEST_SECRET=replace-with-a-long-random-secret
```

3. Restart the dev server after adding the env var

4. Either:

- sign in at your local login page, or
- send the secret header directly

5. Open the browser devtools console while signed in and run:

```js
fetch("/api/trends/ingest", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-ingest-secret": "replace-with-a-long-random-secret"
  },
  body: JSON.stringify({
    items: [
      {
        platform: "youtube",
        title: "Best New AI Tools for Creators in 2026",
        url: "https://www.youtube.com/watch?v=abc123xyz89",
        source_channel: "AI Creator Daily",
        published_at: "2026-03-27T14:00:00Z",
        fetched_at: "2026-03-27T16:30:00Z",
        engagement_views: 18420,
        engagement_likes: 912,
        keyword_context: "ai tools for creators"
      },
      {
        platform: "youtube",
        title: "How Agentic Workflows Are Changing Content Teams",
        url: "https://youtu.be/def456uvw78",
        source_channel: "Automation Weekly",
        published_at: "2026-03-26T17:45:00Z",
        fetched_at: "2026-03-27T16:30:00Z",
        engagement_views: 22310,
        engagement_likes: 1430,
        keyword_context: "agentic workflows"
      }
    ]
  })
}).then((res) => res.json()).then(console.log);
```

Expected response:

```json
{
  "success": true,
  "inserted": 2,
  "skipped": 0
}
```

6. Refresh the dashboard and confirm the `Trend Feed` section shows the new rows.

## Make.com HTTP Module Setup

Use an HTTP `Make a request` module with:

- Method: `POST`
- URL: `https://your-domain-or-local-tunnel/api/trends/ingest`
- Headers:
  - `Content-Type: application/json`
  - `x-ingest-secret: your-shared-secret`
- Body type: `Raw`
- Content type: `JSON (application/json)`
- Request body:

```json
{
  "items": [
    {
      "platform": "youtube",
      "title": "{{1.title}}",
      "url": "{{1.url}}",
      "source_channel": "{{1.source_channel}}",
      "published_at": "{{1.published_at}}",
      "fetched_at": "{{now}}",
      "engagement_views": "{{1.engagement_views}}",
      "engagement_likes": "{{1.engagement_likes}}",
      "keyword_context": "{{1.keyword_context}}"
    }
  ]
}
```

Expected success response:

```json
{
  "success": true,
  "inserted": 1,
  "skipped": 0
}
```

## Common Failure Cases

- `401 Unauthorized`
  - missing `x-ingest-secret`
  - wrong `x-ingest-secret`
  - not signed in and no valid secret provided
- `400 Payload must be an object with an items array.`
  - request body is malformed
  - request body does not include `items`
- `500 ...`
  - database schema migration not applied
  - Supabase insert or duplicate-check query failed

## Duplicate Handling

- Each item is normalized before insert
- YouTube URLs are canonicalized to a standard watch URL when possible
- Duplicate URLs in the same request are skipped
- Existing rows with the same `topic_url` are skipped
- Invalid items are skipped without failing the whole request
