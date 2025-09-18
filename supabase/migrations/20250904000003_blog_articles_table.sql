-- Create blog articles table
create table if not exists blog_articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  excerpt text,
  slug text unique,
  language text default 'fr',
  status text check (status in ('draft', 'published', 'archived')) default 'draft',
  author_id uuid references auth.users(id),
  tags text[],
  featured_image_url text,
  seo_title text,
  seo_description text,
  reading_time integer,
  word_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- Create indexes for better query performance
create index if not exists idx_blog_articles_status on blog_articles(status);
create index if not exists idx_blog_articles_language on blog_articles(language);
create index if not exists idx_blog_articles_created_at on blog_articles(created_at);
create index if not exists idx_blog_articles_published_at on blog_articles(published_at);
create index if not exists idx_blog_articles_slug on blog_articles(slug);

-- Add trigger to automatically update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_blog_articles_updated_at 
  before update on blog_articles 
  for each row 
  execute function update_updated_at_column();

-- Add RLS policies
alter table blog_articles enable row level security;

-- Allow selects for everyone (published articles only)
create policy "Allow public reads for published articles" on blog_articles 
  for select using (status = 'published');

-- Allow inserts and updates for authenticated users (admins)
create policy "Allow admin writes" on blog_articles 
  for all to authenticated using (true);

-- Grant permissions
grant select on blog_articles to anon;
grant all on blog_articles to authenticated;