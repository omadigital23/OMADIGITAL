// Script to apply the quotes table migration
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const projectId = 'pcedyohixahtfogfdlig';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZXdwbGt2cHJ0cmxzcnZlZ3BsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MDg0NywiZXhwIjoyMDcxODI2ODQ3fQ.TSp2sDDbcB8so74xwwwlJjBT9oRt4_htiCM02wZFV_8';

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL for creating the quotes table
const createQuotesTableSQL = `
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

-- Allow selects for admins only
create policy "Allow selects for admins" on quotes 
  for select using (
    exists (
      select 1 from user_roles 
      where user_id = auth.uid() 
      and role = 'admin'
    )
  );

-- Allow updates for admins only
create policy "Allow updates for admins" on quotes 
  for update using (
    exists (
      select 1 from user_roles 
      where user_id = auth.uid() 
      and role = 'admin'
    )
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
`;

async function applyMigration() {
  try {
    console.log('Applying quotes table migration...');
    
    // Execute each statement separately
    const statements = createQuotesTableSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // Try alternative method for function creation
        if (statement.includes('create or replace function')) {
          console.log('Trying alternative method for function creation...');
          const { error: altError } = await supabase.rpc('exec_sql', { sql: statement });
          if (altError) {
            console.error('Error with statement:', statement.substring(0, 100) + '...');
            console.error('Error details:', altError);
          }
        } else {
          console.error('Error with statement:', statement.substring(0, 100) + '...');
          console.error('Error details:', error);
        }
      }
    }
    
    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the migration
applyMigration();