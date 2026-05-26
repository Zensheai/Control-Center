import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("transaction_type,amount,currency_code");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const revenue = (data ?? [])
    .filter((entry) => entry.transaction_type === "revenue")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const expenses = (data ?? [])
    .filter((entry) => entry.transaction_type === "expense")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  return NextResponse.json({
    data: {
      revenue,
      expenses,
      profit: revenue - expenses,
      currency: data?.[0]?.currency_code ?? "USD"
    }
  });
}
