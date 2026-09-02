import { redirect } from "next/navigation";
import { ControlCenterDashboard } from "@/components/control-center-dashboard";
import { getDashboardData } from "@/lib/data/phase1";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ControlCenterPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/control-center");
  }

  const data = await getDashboardData();

  return (
    <ControlCenterDashboard
      data={{
        content: data.content,
        trends: data.trends,
        calendar: data.calendar,
        transactions: data.transactions,
        inbox: data.inbox,
        errors: data.errors.map((error) => error.message)
      }}
      userEmail={user.email ?? "Private workspace"}
    />
  );
}
