"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ContentItem } from "@/lib/types";

type SubmitState = {
  kind: "idle" | "success" | "error";
  message: string;
};

const initialState: SubmitState = {
  kind: "idle",
  message: ""
};

export function CalendarQuickAdd({ content }: { content: ContentItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitState, setSubmitState] = useState<SubmitState>(initialState);

  async function submitEntry(formData: FormData) {
    const startsAtValue = String(formData.get("starts_at") ?? "").trim();
    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      entry_type: String(formData.get("entry_type") ?? "publish"),
      starts_at: startsAtValue ? new Date(startsAtValue).toISOString() : "",
      content_item_id: String(formData.get("content_item_id") ?? "") || null,
      status: "planned",
      all_day: false,
      notes: String(formData.get("notes") ?? "").trim() || null
    };

    if (!payload.title || !payload.starts_at) {
      setSubmitState({
        kind: "error",
        message: "Add a title and date/time before saving the calendar entry."
      });
      return;
    }

    const response = await fetch("/api/calendar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      setSubmitState({
        kind: "error",
        message: result?.error ?? "The calendar entry could not be saved."
      });
      return;
    }

    setSubmitState({
      kind: "success",
      message: "Calendar entry added."
    });
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await submitEntry(formData);
      router.refresh();
    });
  }

  return (
    <article className="section-card calendar-card">
      <p className="meta">Publishing calendar</p>
      <h2>Schedule a content milestone</h2>
      <form className="quick-form" action={handleSubmit}>
        <div>
          <label className="field-label" htmlFor="calendar-title">
            Title
          </label>
          <input
            className="field-input"
            id="calendar-title"
            name="title"
            placeholder="Upload, filming session, or deadline"
            required
          />
        </div>

        <div className="inline-grid">
          <div>
            <label className="field-label" htmlFor="calendar-type">
              Type
            </label>
            <select
              className="field-input"
              defaultValue="publish"
              id="calendar-type"
              name="entry_type"
            >
              <option value="publish">publish</option>
              <option value="recording">recording</option>
              <option value="editing">editing</option>
              <option value="deadline">deadline</option>
              <option value="campaign">campaign</option>
              <option value="other">other</option>
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="calendar-starts-at">
              Date and time
            </label>
            <input
              className="field-input"
              id="calendar-starts-at"
              name="starts_at"
              required
              type="datetime-local"
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="calendar-content-item">
            Link to content item
          </label>
          <select
            className="field-input"
            defaultValue=""
            id="calendar-content-item"
            name="content_item_id"
          >
            <option value="">No linked content yet</option>
            {content.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="calendar-notes">
            Notes
          </label>
          <textarea
            className="field-input field-textarea"
            id="calendar-notes"
            name="notes"
            placeholder="Anything the team should remember"
          />
        </div>

        <button className="button" disabled={isPending} type="submit">
          {isPending ? "Saving..." : "Add calendar entry"}
        </button>

        {submitState.message ? (
          <p
            className={
              submitState.kind === "error" ? "form-message error" : "form-message"
            }
          >
            {submitState.message}
          </p>
        ) : null}
      </form>
    </article>
  );
}
