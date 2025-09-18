-- Create quotes table for free quote form
create table if not exists quotes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text not null,
  company text,
  service text not null,
  message text not null,
  budget text,
  status text not null default 'nouveau',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for better query performance
create index if not exists idx_quotes_status on quotes(status);
create index if not exists idx_quotes_created_at on quotes(created_at);
create index if not exists idx_quotes_service on quotes(service);

-- Add RLS policies
alter table quotes enable row level security;

-- Allow inserts for everyone (contact form submissions)
create policy "Allow inserts for contact forms" on quotes 
  for insert with check (true);

-- Allow selects for authenticated users only (admins)
create policy "Allow selects for admins" on quotes 
  for select using (
    auth.role() = 'authenticated'
  );

-- Allow updates for authenticated users only (admins)
create policy "Allow updates for admins" on quotes 
  for update using (
    auth.role() = 'authenticated'
  );

-- Grant permissions
grant insert on quotes to anon;
grant select, update on quotes to authenticated;

-- Add trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_quotes_updated_at 
    before update on quotes 
    for each row 
    execute procedure update_updated_at_column();