import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="page-shell auth-shell">
      <section className="auth-card">
        <p className="meta">Private workspace</p>
        <h1>Sign in to Keys to AI</h1>
        <p>
          Use the Supabase user you created for this project. Once you are in,
          the dashboard becomes private again and we can remove the temporary
          public access policies.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
