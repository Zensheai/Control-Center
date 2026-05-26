create policy "public can insert calendar_entries"
on public.calendar_entries
for insert
to anon
with check (true);
