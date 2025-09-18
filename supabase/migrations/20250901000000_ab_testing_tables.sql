-- Create A/B test results table
create table if not exists ab_test_results (
  id uuid default gen_random_uuid() primary key,
  test_name text not null,
  variant text not null,
  conversion boolean not null default false,
  user_id uuid,
  session_id text,
  timestamp timestamptz not null default now(),
  metadata jsonb
);

-- Create indexes for better query performance
create index if not exists idx_ab_test_results_test_name on ab_test_results(test_name);
create index if not exists idx_ab_test_results_variant on ab_test_results(variant);
create index if not exists idx_ab_test_results_conversion on ab_test_results(conversion);
create index if not exists idx_ab_test_results_timestamp on ab_test_results(timestamp);

-- Add RLS policies
alter table ab_test_results enable row level security;

-- Allow inserts for everyone (analytics data)
create policy "Allow inserts for analytics" on ab_test_results 
  for insert with check (true);

-- Allow selects for admins only
create policy "Allow selects for admins" on ab_test_results 
  for select using (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Grant permissions
grant insert on ab_test_results to anon;
grant select on ab_test_results to authenticated;