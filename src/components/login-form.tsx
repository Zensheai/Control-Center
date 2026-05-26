"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setError("");

      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push("/");
      router.refresh();
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

      <div>
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className="field-input"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>

      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      {error ? <p className="form-message error">{error}</p> : null}
    </form>
  );
}
