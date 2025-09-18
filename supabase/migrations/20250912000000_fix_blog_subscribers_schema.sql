-- Fix blog_subscribers table schema to match API expectations

-- Add missing columns if they don't exist
ALTER TABLE blog_subscribers ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE blog_subscribers ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'unsubscribed', 'bounced'));
ALTER TABLE blog_subscribers ADD COLUMN IF NOT EXISTS source VARCHAR(100);
ALTER TABLE blog_subscribers ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE blog_subscribers ADD COLUMN IF NOT EXISTS confirmation_token VARCHAR(255);
ALTER TABLE blog_subscribers ADD COLUMN IF NOT EXISTS unsubscribe_token VARCHAR(255) UNIQUE;
ALTER TABLE blog_subscribers ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
ALTER TABLE blog_subscribers ADD COLUMN IF NOT EXISTS last_email_sent TIMESTAMPTZ;
ALTER TABLE blog_subscribers ADD COLUMN IF NOT EXISTS subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE blog_subscribers ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

-- Remove the old confirmed column if it exists
ALTER TABLE blog_subscribers DROP COLUMN IF EXISTS confirmed;

-- Add comments for clarity
COMMENT ON COLUMN blog_subscribers.confirmed_at IS 'Timestamp when the subscriber confirmed their email address';
COMMENT ON COLUMN blog_subscribers.unsubscribe_token IS 'Unique token for unsubscribing from the newsletter';
COMMENT ON COLUMN blog_subscribers.confirmation_token IS 'Token for confirming the subscription';