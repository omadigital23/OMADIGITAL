-- Create web vitals table for Core Web Vitals monitoring
create table if not exists web_vitals (
  id uuid default gen_random_uuid() primary key,
  metric_name text not null,
  metric_value numeric not null,
  metric_rating text check (metric_rating in ('good', 'needs-improvement', 'poor')),
  metric_delta numeric,
  metric_id text,
  page_url text,
  user_agent text,
  created_at timestamptz not null default now(),
  session_id text,
  ip_address text,
  metadata jsonb
);

-- Create indexes for better query performance
create index if not exists idx_web_vitals_metric_name on web_vitals(metric_name);
create index if not exists idx_web_vitals_metric_rating on web_vitals(metric_rating);
create index if not exists idx_web_vitals_created_at on web_vitals(created_at);
create index if not exists idx_web_vitals_page_url on web_vitals(page_url);

-- Add RLS policies
alter table web_vitals enable row level security;

-- Allow inserts for everyone (analytics data)
create policy "Allow inserts for analytics" on web_vitals 
  for insert with check (true);

-- Allow selects for admins only
create policy "Allow selects for admins" on web_vitals 
  for select using (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Grant permissions
grant insert on web_vitals to anon;
grant select on web_vitals to authenticated;