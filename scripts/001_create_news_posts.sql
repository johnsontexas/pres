-- Create news_posts table for admin-uploaded news content
create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  media_url text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.news_posts enable row level security;

-- Everyone can view news posts
create policy "news_posts_select_all" on public.news_posts for select using (true);

-- Only authenticated users can insert (admin check done in app)
create policy "news_posts_insert_auth" on public.news_posts for insert with check (auth.uid() = author_id);

-- Only the author can update their posts
create policy "news_posts_update_own" on public.news_posts for update using (auth.uid() = author_id);

-- Only the author can delete their posts
create policy "news_posts_delete_own" on public.news_posts for delete using (auth.uid() = author_id);
