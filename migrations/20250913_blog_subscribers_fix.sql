-- Migration to fix blog_subscribers table schema
-- This migration adds missing columns for proper newsletter functionality

-- Add confirmed_at column for email confirmation tracking
ALTER TABLE blog_subscribers ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Add confirmation_token column for email confirmation
ALTER TABLE blog_subscribers ADD COLUMN IF NOT EXISTS confirmation_token VARCHAR(255);

-- Add created_at column with default value
ALTER TABLE blog_subscribers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Remove deprecated confirmed column if it exists
ALTER TABLE blog_subscribers DROP COLUMN IF EXISTS confirmed;

-- Add comments for documentation
COMMENT ON COLUMN blog_subscribers.confirmed_at IS 'Timestamp when the subscriber confirmed their email address';
COMMENT ON COLUMN blog_subscribers.confirmation_token IS 'Unique token for email confirmation';
COMMENT ON COLUMN blog_subscribers.created_at IS 'Timestamp when the subscriber was created';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_confirmation_token ON blog_subscribers(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_confirmed_at ON blog_subscribers(confirmed_at);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_created_at ON blog_subscribers(created_at);