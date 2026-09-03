import { UpdatePasswordForm } from "@/components/update-password-form";
import styles from "../login/login.module.css";

export default function UpdatePasswordPage() {
  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <a className={styles.brand} href="/">
          <span>K</span>
          <strong>Keys to AI</strong>
        </a>
        <p className={styles.eyebrow}>Account recovery</p>
        <h1>Choose a new password</h1>
        <p>
          Create a new password for your private Keys to AI workspace.
        </p>
        <UpdatePasswordForm />
      </section>
    </main>
  );
}
