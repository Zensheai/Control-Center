create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select auth.uid() is not null;
$$;

create policy "authenticated users can read content_tags"
on public.content_tags
for select
to authenticated
using (public.is_owner());

create policy "authenticated users can manage content_tags"
on public.content_tags
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "authenticated users can read content_item_tags"
on public.content_item_tags
for select
to authenticated
using (public.is_owner());

create policy "authenticated users can manage content_item_tags"
on public.content_item_tags
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "authenticated users can read content_checkpoints"
on public.content_checkpoints
for select
to authenticated
using (public.is_owner());

create policy "authenticated users can manage content_checkpoints"
on public.content_checkpoints
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "authenticated users can read calendar_entries"
on public.calendar_entries
for select
to authenticated
using (public.is_owner());

create policy "authenticated users can manage calendar_entries"
on public.calendar_entries
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "authenticated users can read trend_sources"
on public.trend_sources
for select
to authenticated
using (public.is_owner());

create policy "authenticated users can manage trend_sources"
on public.trend_sources
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "authenticated users can read trending_topics"
on public.trending_topics
for select
to authenticated
using (public.is_owner());

create policy "authenticated users can manage trending_topics"
on public.trending_topics
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "authenticated users can read content_trend_links"
on public.content_trend_links
for select
to authenticated
using (public.is_owner());

create policy "authenticated users can manage content_trend_links"
on public.content_trend_links
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "authenticated users can read accounts"
on public.accounts
for select
to authenticated
using (public.is_owner());

create policy "authenticated users can manage accounts"
on public.accounts
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "authenticated users can read transactions"
on public.transactions
for select
to authenticated
using (public.is_owner());

create policy "authenticated users can manage transactions"
on public.transactions
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "authenticated users can read inbox_items"
on public.inbox_items
for select
to authenticated
using (public.is_owner());

create policy "authenticated users can manage inbox_items"
on public.inbox_items
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());
