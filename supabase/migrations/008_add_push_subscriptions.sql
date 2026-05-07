-- Add push subscriptions table for web push notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, endpoint)
);

-- Index for efficient lookup when sending notifications
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id) WHERE is_active = TRUE;

-- Allow service role to read subscriptions (for cron job)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Service role can do anything
CREATE POLICY "Service role full access" ON push_subscriptions
  FOR ALL TO service_role
  USING (true);

-- Users can only manage their own subscriptions
CREATE POLICY "Users manage own subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);