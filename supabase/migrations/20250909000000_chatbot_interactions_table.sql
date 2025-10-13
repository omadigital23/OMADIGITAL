-- Create chatbot interactions table for tracking chatbot conversations
create table if not exists chatbot_interactions (
  message_id text primary key,
  user_id uuid,
  session_id text not null,
  message_text text not null,
  response_text text not null,
  input_method text check (input_method in ('text', 'voice')),
  response_time integer not null,
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  timestamp timestamptz not null default now(),
  conversation_length integer,
  user_satisfaction integer check (user_satisfaction >= 1 and user_satisfaction <= 5)
);

-- Create indexes for better query performance
create index if not exists idx_chatbot_interactions_session_id on chatbot_interactions(session_id);
create index if not exists idx_chatbot_interactions_timestamp on chatbot_interactions(timestamp);
create index if not exists idx_chatbot_interactions_user_id on chatbot_interactions(user_id);

-- Add RLS policies
alter table chatbot_interactions enable row level security;

-- Allow inserts for everyone (chatbot data)
create policy "Allow inserts for chatbot interactions" on chatbot_interactions 
  for insert with check (true);

-- Allow selects for admins only (simplified to avoid recursion)
create policy "Allow selects for admins" on chatbot_interactions 
  for select using (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Allow updates for admins only
create policy "Allow updates for admins" on chatbot_interactions 
  for update using (
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Grant permissions
grant insert on chatbot_interactions to anon;
grant select, update on chatbot_interactions to authenticated;