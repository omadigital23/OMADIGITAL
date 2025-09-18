-- Create analytics events table
create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  event_name text not null,
  event_properties jsonb,
  user_id uuid,
  session_id text,
  timestamp timestamptz not null default now(),
  url text,
  user_agent text,
  ip_address text,
  metadata jsonb
);

-- Create indexes for better query performance
create index if not exists idx_analytics_events_event_name on analytics_events(event_name);
create index if not exists idx_analytics_events_timestamp on analytics_events(timestamp);
create index if not exists idx_analytics_events_user_id on analytics_events(user_id);
create index if not exists idx_analytics_events_session_id on analytics_events(session_id);

-- Add RLS policies
alter table analytics_events enable row level security;

-- Allow inserts for everyone (analytics data)
create policy "Allow inserts for analytics" on analytics_events 
  for insert with check (true);

-- Allow selects for admins only
create policy "Allow selects for admins" on analytics_events 
  for select using (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Grant permissions
grant insert on analytics_events to anon;
grant select on analytics_events to authenticated;