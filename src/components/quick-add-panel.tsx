"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type SubmitState = {
  kind: "idle" | "success" | "error";
  message: string;
};

const initialState: SubmitState = {
  kind: "idle",
  message: ""
};

export function QuickAddPanel() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [ideaState, setIdeaState] = useState<SubmitState>(initialState);
  const [expenseState, setExpenseState] = useState<SubmitState>(initialState);

  async function submitIdea(formData: FormData) {
    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      priority: Number(formData.get("priority") ?? 3),
      content_type: "video",
      status: "idea",
      source_channel: "manual"
    };

    if (!payload.title) {
      setIdeaState({
        kind: "error",
        message: "Add a title before saving the idea."
      });
      return;
    }

    const response = await fetch("/api/content", {
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

      setIdeaState({
        kind: "error",
        message: result?.error ?? "The idea could not be saved."
      });
      return;
    }

    setIdeaState({
      kind: "success",
      message: "Idea added to the pipeline."
    });
  }

  async function submitExpense(formData: FormData) {
    const amount = Number(formData.get("amount") ?? 0);
    const payload = {
      transaction_type: "expense",
      category: String(formData.get("category") ?? "software"),
      amount,
      currency_code: "USD",
      transaction_date:
        String(formData.get("transaction_date") ?? "").trim() ||
        new Date().toISOString().slice(0, 10),
      description: String(formData.get("description") ?? "").trim() || null
    };

    if (!Number.isFinite(amount) || amount <= 0) {
      setExpenseState({
        kind: "error",
        message: "Enter an expense amount greater than zero."
      });
      return;
    }

    const response = await fetch("/api/transactions", {
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

      setExpenseState({
        kind: "error",
        message: result?.error ?? "The expense could not be saved."
      });
      return;
    }

    setExpenseState({
      kind: "success",
      message: "Expense saved to the budget tracker."
    });
  }

  function handleIdeaSubmit(formData: FormData) {
    startTransition(async () => {
      await submitIdea(formData);
      router.refresh();
    });
  }

  function handleExpenseSubmit(formData: FormData) {
    startTransition(async () => {
      await submitExpense(formData);
      router.refresh();
    });
  }

  return (
    <article className="section-card quick-add-card">
      <p className="meta">Quick add</p>
      <h2>Capture work without leaving the dashboard</h2>
      <div className="quick-add-grid">
        <form
          className="quick-form"
          action={handleIdeaSubmit}
        >
          <div>
            <label className="field-label" htmlFor="idea-title">
              New idea
            </label>
            <input
              className="field-input"
              id="idea-title"
              name="title"
              placeholder="What video should we make next?"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="idea-description">
              Notes
            </label>
            <textarea
              className="field-input field-textarea"
              id="idea-description"
              name="description"
              placeholder="Hook, angle, or why it matters"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="idea-priority">
              Priority
            </label>
            <select
              className="field-input"
              defaultValue="3"
              id="idea-priority"
              name="priority"
            >
              <option value="1">1 - high</option>
              <option value="2">2</option>
              <option value="3">3 - normal</option>
              <option value="4">4</option>
              <option value="5">5 - low</option>
            </select>
          </div>

          <button className="button" disabled={isPending} type="submit">
            {isPending ? "Saving..." : "Add idea"}
          </button>

          {ideaState.message ? (
            <p
              className={
                ideaState.kind === "error" ? "form-message error" : "form-message"
              }
            >
              {ideaState.message}
            </p>
          ) : null}
        </form>

        <form
          className="quick-form"
          action={handleExpenseSubmit}
        >
          <div>
            <label className="field-label" htmlFor="expense-amount">
              Expense amount
            </label>
            <input
              className="field-input"
              id="expense-amount"
              min="0.01"
              name="amount"
              placeholder="29.00"
              required
              step="0.01"
              type="number"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="expense-category">
              Category
            </label>
            <select
              className="field-input"
              defaultValue="software"
              id="expense-category"
              name="category"
            >
              <option value="software">software</option>
              <option value="contractor">contractor</option>
              <option value="equipment">equipment</option>
              <option value="affiliate">affiliate</option>
              <option value="other">other</option>
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="expense-date">
              Date
            </label>
            <input
              className="field-input"
              defaultValue={new Date().toISOString().slice(0, 10)}
              id="expense-date"
              name="transaction_date"
              type="date"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="expense-description">
              Description
            </label>
            <input
              className="field-input"
              id="expense-description"
              name="description"
              placeholder="What did we pay for?"
            />
          </div>

          <button className="button" disabled={isPending} type="submit">
            {isPending ? "Saving..." : "Add expense"}
          </button>

          {expenseState.message ? (
            <p
              className={
                expenseState.kind === "error"
                  ? "form-message error"
                  : "form-message"
              }
            >
              {expenseState.message}
            </p>
          ) : null}
        </form>
      </div>
    </article>
  );
}
