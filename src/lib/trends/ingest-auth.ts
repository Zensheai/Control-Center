const INGEST_SECRET_HEADER = "x-ingest-secret";

export function getTrendIngestSecretHeaderName() {
  return INGEST_SECRET_HEADER;
}

export function hasValidIngestSecret(request: Request) {
  const expectedSecret = process.env.TREND_INGEST_SECRET?.trim();

  if (!expectedSecret) {
    return {
      ok: false,
      reason: "missing_server_secret" as const
    };
  }

  const providedSecret = request.headers.get(INGEST_SECRET_HEADER)?.trim();

  if (!providedSecret) {
    return {
      ok: false,
      reason: "missing_request_secret" as const
    };
  }

  if (providedSecret !== expectedSecret) {
    return {
      ok: false,
      reason: "invalid_request_secret" as const
    };
  }

  return {
    ok: true,
    reason: "valid_secret" as const
  };
}
