import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("transaction_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      account_id: body.account_id ?? null,
      content_item_id: body.content_item_id ?? null,
      transaction_type: body.transaction_type,
      category: body.category ?? "other",
      vendor_name: body.vendor_name ?? null,
      description: body.description ?? null,
      amount: body.amount,
      currency_code: body.currency_code ?? "USD",
      transaction_date: body.transaction_date,
      payment_method: body.payment_method ?? null,
      external_ref: body.external_ref ?? null,
      notes: body.notes ?? null
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
