create policy "public can insert content_items"
on public.content_items
for insert
to anon
with check (true);

create policy "public can insert transactions"
on public.transactions
for insert
to anon
with check (true);
