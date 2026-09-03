import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as
    | {
        action?: unknown;
        processed_into_table?: unknown;
        processed_into_id?: unknown;
      }
    | null;

  if (!body) {
    return NextResponse.json({ error: "A valid action is required." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const action = typeof body.action === "string" ? body.action : "legacy";

  if (action === "content") {
    const { data: inboxItem, error: inboxError } = await supabase
      .from("inbox_items")
      .select("title,body,inbox_type,status,processed_into_table,processed_into_id")
      .eq("id", id)
      .single();

    if (inboxError) {
      return NextResponse.json({ error: inboxError.message }, { status: 500 });
    }

    if (inboxItem.status !== "new") {
      return NextResponse.json(
        { error: "Only open inbox items can be sent to the pipeline." },
        { status: 409 }
      );
    }

    if (inboxItem.inbox_type === "expense") {
      return NextResponse.json(
        { error: "Expense captures need an amount before they can be recorded." },
        { status: 400 }
      );
    }

    if (
      inboxItem.processed_into_table === "content_items" &&
      inboxItem.processed_into_id
    ) {
      const { data, error } = await supabase
        .from("inbox_items")
        .update({ status: "processed" })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data, content_item_id: inboxItem.processed_into_id });
    }

    const { data: contentItem, error: contentError } = await supabase
      .from("content_items")
      .insert({
        title: inboxItem.title,
        content_type: "video",
        status: "idea",
        priority: 3,
        description: inboxItem.body,
        source_channel: "manual"
      })
      .select()
      .single();

    if (contentError) {
      return NextResponse.json({ error: contentError.message }, { status: 500 });
    }

    const { data: processedItem, error: processError } = await supabase
      .from("inbox_items")
      .update({
        status: "processed",
        processed_into_table: "content_items",
        processed_into_id: contentItem.id
      })
      .eq("id", id)
      .select()
      .single();

    if (processError) {
      await supabase.from("content_items").delete().eq("id", contentItem.id);
      return NextResponse.json({ error: processError.message }, { status: 500 });
    }

    return NextResponse.json({ data: processedItem, content: contentItem });
  }

  if (action === "dismiss" || action === "reopen") {
    const { data, error } = await supabase
      .from("inbox_items")
      .update({
        status: action === "dismiss" ? "dismissed" : "new"
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  if (action !== "legacy") {
    return NextResponse.json({ error: "Unsupported inbox action." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("inbox_items")
    .update({
      status: "processed",
      processed_into_table:
        typeof body.processed_into_table === "string"
          ? body.processed_into_table
          : null,
      processed_into_id:
        typeof body.processed_into_id === "string" ? body.processed_into_id : null
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
