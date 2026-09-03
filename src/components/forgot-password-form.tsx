"use client";

import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setError("");
      setMessage("");

      const email = String(formData.get("email") ?? "").trim();
      const redirectTo = `${window.location.origin}/auth/callback?next=/update-password`;
      const supabase = createSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage("Check your email for a secure password-reset link.");
    });
  }

  return (
    <form action={handleSubmit} className="auth-form">
      <div>
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="field-input"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>

      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Sending..." : "Send reset link"}
      </button>

      {message ? <p className="form-message success">{message}</p> : null}
      {error ? <p className="form-message error">{error}</p> : null}

      <a className="auth-link centered" href="/login">
        Back to sign in
      </a>
    </form>
  );
}
