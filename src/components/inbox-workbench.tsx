"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { InboxItem } from "@/lib/types";

type InboxAction = "content" | "dismiss" | "reopen";
type InboxFilter = "open" | "all";

async function readError(response: Response, fallback: string) {
  const result = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;
  return result?.error ?? fallback;
}

function formatCapturedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function InboxWorkbench({ items }: { items: InboxItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<InboxFilter>("open");
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  const visibleItems = useMemo(
    () => (filter === "open" ? items.filter((item) => item.status === "new") : items),
    [filter, items]
  );
  const openCount = items.filter((item) => item.status === "new").length;

  function announce(nextMessage: string, error = false) {
    setMessage(nextMessage);
    setHasError(error);
  }

  function captureItem(formData: FormData) {
    startTransition(async () => {
      announce("");
      const title = String(formData.get("title") ?? "").trim();

      if (!title) {
        announce("Add a title before capturing this item.", true);
        return;
      }

      const response = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inbox_type: String(formData.get("inbox_type") ?? "idea"),
          title,
          body: String(formData.get("body") ?? "").trim() || null,
          source: "manual",
          status: "new"
        })
      });

      if (!response.ok) {
        announce(await readError(response, "The capture could not be saved."), true);
        return;
      }

      announce("Captured. It is ready for triage.");
      setFilter("open");
      router.refresh();
    });
  }

  function actOnItem(item: InboxItem, action: InboxAction) {
    setActiveItemId(item.id);
    startTransition(async () => {
      announce("");
      const response = await fetch(`/api/inbox/${item.id}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        announce(await readError(response, "The inbox item could not be updated."), true);
        setActiveItemId(null);
        return;
      }

      announce(
        action === "content"
          ? "Sent to the content pipeline as a new idea."
          : action === "dismiss"
            ? "Inbox item dismissed."
            : "Inbox item reopened."
      );
      setActiveItemId(null);
      router.refresh();
    });
  }

  return (
    <div className="inbox-workbench">
      <article className="inbox-queue">
        <header className="inbox-heading">
          <div>
            <p className="meta">Triage queue</p>
            <h2>{openCount} open {openCount === 1 ? "item" : "items"}</h2>
          </div>
          <div className="inbox-filters" aria-label="Inbox filters">
            <button
              aria-pressed={filter === "open"}
              onClick={() => setFilter("open")}
              type="button"
            >
              Open
            </button>
            <button
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
              type="button"
            >
              All
            </button>
          </div>
        </header>

        {message ? (
          <p className={hasError ? "form-message error" : "form-message"} role="status">
            {message}
          </p>
        ) : null}

        <div className="inbox-list">
          {visibleItems.map((item) => {
            const isActive = isPending && activeItemId === item.id;
            return (
              <article className="inbox-card" key={item.id}>
                <div className="inbox-card-topline">
                  <span className={`inbox-status inbox-status-${item.status}`}>
                    {item.status}
                  </span>
                  <small>{item.inbox_type} · {formatCapturedAt(item.created_at)}</small>
                </div>
                <strong>{item.title}</strong>
                {item.body ? <p>{item.body}</p> : null}
                {item.processed_into_table === "content_items" ? (
                  <small className="inbox-destination">Pipeline idea created</small>
                ) : null}
                <div className="inbox-actions">
                  {item.status === "new" && item.inbox_type !== "expense" ? (
                    <button
                      className="button mini-button"
                      disabled={isPending}
                      onClick={() => actOnItem(item, "content")}
                      type="button"
                    >
                      {isActive ? "Working..." : "Send to pipeline"}
                    </button>
                  ) : null}
                  {item.status === "new" ? (
                    <button
                      className="button secondary mini-button"
                      disabled={isPending}
                      onClick={() => actOnItem(item, "dismiss")}
                      type="button"
                    >
                      Dismiss
                    </button>
                  ) : (
                    <button
                      className="button secondary mini-button"
                      disabled={isPending}
                      onClick={() => actOnItem(item, "reopen")}
                      type="button"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </article>
            );
          })}
          {visibleItems.length === 0 ? (
            <p className="inbox-empty">
              {filter === "open"
                ? "Inbox zero. New captures will appear here."
                : "Nothing has been captured yet."}
            </p>
          ) : null}
        </div>
      </article>

      <article className="inbox-capture">
        <p className="meta">Quick capture</p>
        <h2>Get it out of your head.</h2>
        <p className="inbox-capture-copy">
          Save the thought now. Decide what it becomes when you triage the queue.
        </p>
        <form action={captureItem} className="quick-form">
          <label>
            <span className="field-label">Type</span>
            <select className="field-input" defaultValue="idea" name="inbox_type">
              <option value="idea">Idea</option>
              <option value="task">Task</option>
              <option value="note">Note</option>
              <option value="trend">Trend</option>
            </select>
          </label>
          <label>
            <span className="field-label">Title</span>
            <input
              className="field-input"
              name="title"
              placeholder="What needs your attention?"
              required
            />
          </label>
          <label>
            <span className="field-label">Details</span>
            <textarea
              className="field-input field-textarea"
              name="body"
              placeholder="Context, links, or the next thought"
            />
          </label>
          <button className="button" disabled={isPending} type="submit">
            {isPending && activeItemId === null ? "Capturing..." : "Capture item"}
          </button>
        </form>
      </article>
    </div>
  );
}
