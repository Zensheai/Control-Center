type RawTrendItem = {
  platform?: unknown;
  title?: unknown;
  url?: unknown;
  source_channel?: unknown;
  published_at?: unknown;
  fetched_at?: unknown;
  engagement_views?: unknown;
  engagement_likes?: unknown;
  keyword_context?: unknown;
};

export type NormalizedTrendItem = {
  platform: "youtube";
  title: string;
  url: string;
  source_channel: string | null;
  published_at: string | null;
  fetched_at: string;
  engagement_views: number | null;
  engagement_likes: number | null;
  keyword_context: string | null;
  raw_payload: RawTrendItem;
};

function toOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null;
}

function toOptionalIsoDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeYoutubeUrl(url: string) {
  try {
    const parsed = new URL(url.trim());
    const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (hostname === "youtu.be") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      return videoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : null;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const videoId = parsed.searchParams.get("v");
        return videoId
          ? `https://www.youtube.com/watch?v=${videoId}`
          : null;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const videoId = parsed.pathname.split("/").filter(Boolean)[1];
        return videoId
          ? `https://www.youtube.com/watch?v=${videoId}`
          : null;
      }
    }

    parsed.hash = "";
    parsed.searchParams.forEach((_, key) => {
      if (key.startsWith("utm_")) {
        parsed.searchParams.delete(key);
      }
    });

    return parsed.toString();
  } catch {
    return null;
  }
}

export function normalizeTrendItem(item: RawTrendItem): NormalizedTrendItem | null {
  if (item.platform !== "youtube") {
    return null;
  }

  const title = toOptionalString(item.title);
  const rawUrl = toOptionalString(item.url);

  if (!title || !rawUrl) {
    return null;
  }

  const url = normalizeYoutubeUrl(rawUrl);

  if (!url) {
    return null;
  }

  return {
    platform: "youtube",
    title,
    url,
    source_channel: toOptionalString(item.source_channel),
    published_at: toOptionalIsoDate(item.published_at),
    fetched_at: toOptionalIsoDate(item.fetched_at) ?? new Date().toISOString(),
    engagement_views: toOptionalNumber(item.engagement_views),
    engagement_likes: toOptionalNumber(item.engagement_likes),
    keyword_context: toOptionalString(item.keyword_context),
    raw_payload: item
  };
}
