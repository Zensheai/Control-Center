"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setError("");

      const password = String(formData.get("password") ?? "");
      const confirmation = String(formData.get("confirmation") ?? "");

      if (password.length < 8) {
        setError("Use at least 8 characters for your new password.");
        return;
      }

      if (password !== confirmation) {
        setError("The passwords do not match.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push("/control-center");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="auth-form">
      <div>
        <label className="field-label" htmlFor="password">
          New password
        </label>
        <input
          autoComplete="new-password"
          className="field-input"
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="confirmation">
          Confirm new password
        </label>
        <input
          autoComplete="new-password"
          className="field-input"
          id="confirmation"
          minLength={8}
          name="confirmation"
          required
          type="password"
        />
      </div>

      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Updating..." : "Update password"}
      </button>

      {error ? <p className="form-message error">{error}</p> : null}
    </form>
  );
}
