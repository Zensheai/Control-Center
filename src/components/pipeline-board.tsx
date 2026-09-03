"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ContentItem, ContentStatus } from "@/lib/types";

const PIPELINE_COLUMNS: Array<{ status: ContentStatus; label: string }> = [
  { status: "idea", label: "Ideas" },
  { status: "script", label: "Script" },
  { status: "produced", label: "Produced" },
  { status: "edited", label: "Edited" },
  { status: "scheduled", label: "Scheduled" },
  { status: "published", label: "Published" }
];

const NEXT_STATUS: Partial<Record<ContentStatus, ContentStatus>> = {
  idea: "script",
  script: "produced",
  produced: "edited"
};

const PREVIOUS_STATUS: Partial<Record<ContentStatus, ContentStatus>> = {
  script: "idea",
  produced: "script",
  edited: "produced",
  scheduled: "edited",
  published: "scheduled"
};

type EditorAction = "save" | "schedule" | "publish";

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function extractYouTubeVideoId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");
    let candidate = "";

    if (host === "youtu.be") candidate = url.pathname.split("/").filter(Boolean)[0] ?? "";
    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      candidate =
        url.searchParams.get("v") ??
        url.pathname.match(/^\/(?:shorts|embed)\/([^/?]+)/)?.[1] ??
        "";
    }

    return /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

async function readError(response: Response, fallback: string) {
  const result = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;
  return result?.error ?? fallback;
}

export function PipelineBoard({ content }: { content: ContentItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  function announce(nextMessage: string, error = false) {
    setMessage(nextMessage);
    setHasError(error);
  }

  async function updateStatus(id: string, status: ContentStatus) {
    const response = await fetch(`/api/content/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      announce(await readError(response, "We could not move that item."), true);
      return false;
    }

    announce(`Moved item to ${status}.`);
    return true;
  }

  function handleMove(id: string, status: ContentStatus) {
    startTransition(async () => {
      if (await updateStatus(id, status)) router.refresh();
    });
  }

  function handleEditorAction(
    item: ContentItem,
    action: EditorAction,
    formData: FormData
  ) {
    startTransition(async () => {
      announce("");
      const title = String(formData.get("title") ?? "").trim();
      const scheduledValue = String(formData.get("scheduled_for") ?? "").trim();
      const youtubeValue = String(formData.get("youtube_url") ?? "").trim();
      const youtubeVideoId = extractYouTubeVideoId(youtubeValue);

      if (!title) {
        announce("Add a title before saving.", true);
        return;
      }

      if (youtubeValue && !youtubeVideoId) {
        announce("Enter a valid YouTube video URL or 11-character video ID.", true);
        return;
      }

      if (action === "schedule" && !scheduledValue) {
        announce("Choose a publish date and time before scheduling.", true);
        return;
      }

      if (action === "publish" && !youtubeVideoId) {
        announce("Add the published YouTube URL before marking this complete.", true);
        return;
      }

      const detailsPayload = {
        title,
        content_type: String(formData.get("content_type") ?? "video"),
        priority: Number(formData.get("priority") ?? 3),
        description: String(formData.get("description") ?? "").trim() || null,
        hook: String(formData.get("hook") ?? "").trim() || null,
        script_url: String(formData.get("script_url") ?? "").trim() || null,
        asset_folder_url:
          String(formData.get("asset_folder_url") ?? "").trim() || null,
        scheduled_for: scheduledValue
          ? new Date(scheduledValue).toISOString()
          : null,
        youtube_video_id: youtubeVideoId
      };

      const detailsResponse = await fetch(`/api/content/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detailsPayload)
      });

      if (!detailsResponse.ok) {
        announce(
          await readError(detailsResponse, "The content details could not be saved."),
          true
        );
        return;
      }

      if (action === "schedule") {
        const scheduleResponse = await fetch(`/api/content/${item.id}/schedule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            starts_at: new Date(scheduledValue).toISOString(),
            notes: String(formData.get("description") ?? "").trim() || null
          })
        });

        if (!scheduleResponse.ok) {
          announce(
            await readError(scheduleResponse, "The calendar milestone could not be saved."),
            true
          );
          return;
        }

        announce("Content scheduled and added to the calendar.");
      } else if (action === "publish") {
        const publishResponse = await fetch(`/api/content/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "published",
            published_at: new Date().toISOString(),
            youtube_video_id: youtubeVideoId
          })
        });

        if (!publishResponse.ok) {
          announce(
            await readError(publishResponse, "The item could not be marked published."),
            true
          );
          return;
        }

        announce("Published video saved to the Control Center.");
      } else {
        announce("Content details saved.");
      }

      setEditingId(null);
      router.refresh();
    });
  }

  return (
    <article className="section-card pipeline-board-card">
      <div className="pipeline-header">
        <div>
          <p className="meta">Pipeline board</p>
          <h2>Move content through production</h2>
        </div>
        {message ? (
          <p className={hasError ? "form-message error" : "form-message"} role="status">
            {message}
          </p>
        ) : null}
      </div>

      <div className="pipeline-board">
        {PIPELINE_COLUMNS.map((column) => {
          const items = content.filter((item) => item.status === column.status);

          return (
            <section className="pipeline-column" key={column.status}>
              <div className="pipeline-column-header">
                <strong>{column.label}</strong>
                <span className="pill">{items.length}</span>
              </div>

              <div className="pipeline-stack">
                {items.length === 0 ? (
                  <div className="pipeline-empty">No items here yet.</div>
                ) : (
                  items.map((item) => {
                    const previousStatus = PREVIOUS_STATUS[item.status];
                    const nextStatus = NEXT_STATUS[item.status];
                    const isEditing = editingId === item.id;

                    return (
                      <article className="pipeline-item" key={item.id}>
                        <strong>{item.title}</strong>
                        <div className="pill-row">
                          <span className="pill">{item.content_type}</span>
                          <span className="pill">Priority {item.priority}</span>
                        </div>
                        {item.description ? <p className="meta">{item.description}</p> : null}
                        {item.scheduled_for ? (
                          <p className="pipeline-detail">
                            Scheduled {new Date(item.scheduled_for).toLocaleString()}
                          </p>
                        ) : null}
                        {item.youtube_video_id ? (
                          <a
                            className="video-link"
                            href={`https://youtu.be/${item.youtube_video_id}`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Watch published video ↗
                          </a>
                        ) : null}

                        <div className="mini-actions">
                          {previousStatus ? (
                            <button
                              className="button secondary mini-button"
                              disabled={isPending}
                              onClick={() => handleMove(item.id, previousStatus)}
                              type="button"
                            >
                              Back
                            </button>
                          ) : null}
                          {nextStatus ? (
                            <button
                              className="button mini-button"
                              disabled={isPending}
                              onClick={() => handleMove(item.id, nextStatus)}
                              type="button"
                            >
                              Move forward
                            </button>
                          ) : null}
                          <button
                            className="button secondary mini-button"
                            disabled={isPending}
                            onClick={() => setEditingId(isEditing ? null : item.id)}
                            type="button"
                          >
                            {isEditing ? "Close" : "Edit"}
                          </button>
                        </div>

                        {isEditing ? (
                          <form
                            action={(formData) => handleEditorAction(item, "save", formData)}
                            className="pipeline-editor"
                          >
                            <label>
                              <span className="field-label">Title</span>
                              <input className="field-input" defaultValue={item.title} name="title" required />
                            </label>
                            <div className="editor-grid">
                              <label>
                                <span className="field-label">Format</span>
                                <select className="field-input" defaultValue={item.content_type} name="content_type">
                                  <option value="video">Video</option>
                                  <option value="short">Short</option>
                                  <option value="newsletter">Newsletter</option>
                                  <option value="blog">Blog</option>
                                  <option value="other">Other</option>
                                </select>
                              </label>
                              <label>
                                <span className="field-label">Priority</span>
                                <select className="field-input" defaultValue={item.priority} name="priority">
                                  {[1, 2, 3, 4, 5].map((priority) => (
                                    <option key={priority} value={priority}>{priority}</option>
                                  ))}
                                </select>
                              </label>
                            </div>
                            <label>
                              <span className="field-label">Notes</span>
                              <textarea className="field-input field-textarea" defaultValue={item.description ?? ""} name="description" />
                            </label>
                            <label>
                              <span className="field-label">Hook</span>
                              <textarea className="field-input field-textarea" defaultValue={item.hook ?? ""} name="hook" />
                            </label>
                            <label>
                              <span className="field-label">Script URL</span>
                              <input className="field-input" defaultValue={item.script_url ?? ""} name="script_url" type="url" />
                            </label>
                            <label>
                              <span className="field-label">Asset folder URL</span>
                              <input className="field-input" defaultValue={item.asset_folder_url ?? ""} name="asset_folder_url" type="url" />
                            </label>
                            <label>
                              <span className="field-label">Publish date & time</span>
                              <input className="field-input" defaultValue={toDateTimeLocal(item.scheduled_for)} name="scheduled_for" type="datetime-local" />
                            </label>
                            <label>
                              <span className="field-label">YouTube URL</span>
                              <input
                                className="field-input"
                                defaultValue={item.youtube_video_id ? `https://youtu.be/${item.youtube_video_id}` : ""}
                                name="youtube_url"
                                placeholder="https://youtu.be/..."
                              />
                            </label>
                            <div className="editor-actions">
                              <button className="button secondary mini-button" disabled={isPending} type="submit">
                                Save details
                              </button>
                              <button
                                className="button schedule-button mini-button"
                                disabled={isPending}
                                formAction={(formData) => handleEditorAction(item, "schedule", formData)}
                                type="submit"
                              >
                                Schedule
                              </button>
                              <button
                                className="button publish-button mini-button"
                                disabled={isPending}
                                formAction={(formData) => handleEditorAction(item, "publish", formData)}
                                type="submit"
                              >
                                Mark published
                              </button>
                            </div>
                          </form>
                        ) : null}
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </article>
  );
}
