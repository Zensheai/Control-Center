import { ForgotPasswordForm } from "@/components/forgot-password-form";
import styles from "../login/login.module.css";

export default function ForgotPasswordPage() {
  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <a className={styles.brand} href="/">
          <span>K</span>
          <strong>Keys to AI</strong>
        </a>
        <p className={styles.eyebrow}>Account recovery</p>
        <h1>Reset your password</h1>
        <p>
          Enter your Control Center email and we will send you a secure link to
          choose a new password.
        </p>
        <ForgotPasswordForm />
      </section>
    </main>
  );
}
