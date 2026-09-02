import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import styles from "./login.module.css";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/control-center");
  }

  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <a className={styles.brand} href="/">
          <span>K</span>
          <strong>Keys to AI</strong>
        </a>
        <p className={styles.eyebrow}>Private workspace</p>
        <h1>Sign in to Keys to AI</h1>
        <p>
          Use the Supabase user you created for this project. Once you are in,
          you will land in your private creator operations dashboard.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
