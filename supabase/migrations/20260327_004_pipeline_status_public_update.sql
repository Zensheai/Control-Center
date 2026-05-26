create policy "public can update content_items"
on public.content_items
for update
to anon
using (true)
with check (true);

create policy "public can insert content_checkpoints"
on public.content_checkpoints
for insert
to anon
with check (true);
