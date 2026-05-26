"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ContentItem, ContentStatus } from "@/lib/types";

const PIPELINE_COLUMNS: Array<{ status: ContentStatus; label: string }> = [
  { status: "idea", label: "Ideas" },
  { status: "script", label: "Script" },
  { status: "produced", label: "Produced" },
  { status: "edited", label: "Edited" },
  { status: "published", label: "Published" }
];

const NEXT_STATUS: Partial<Record<ContentStatus, ContentStatus>> = {
  idea: "script",
  script: "produced",
  produced: "edited",
  edited: "published"
};

const PREVIOUS_STATUS: Partial<Record<ContentStatus, ContentStatus>> = {
  script: "idea",
  produced: "script",
  edited: "produced",
  published: "edited"
};

export function PipelineBoard({ content }: { content: ContentItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  async function updateStatus(id: string, status: ContentStatus) {
    const response = await fetch(`/api/content/${id}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      setMessage(result?.error ?? "We could not move that item.");
      return;
    }

    setMessage(`Moved item to ${status}.`);
  }

  function handleMove(id: string, status: ContentStatus) {
    startTransition(async () => {
      await updateStatus(id, status);
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
        {message ? <p className="form-message">{message}</p> : null}
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

                    return (
                      <article className="pipeline-item" key={item.id}>
                        <strong>{item.title}</strong>
                        <div className="pill-row">
                          <span className="pill">{item.content_type}</span>
                          <span className="pill">Priority {item.priority}</span>
                        </div>
                        {item.description ? (
                          <p className="meta">{item.description}</p>
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
                        </div>
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
