-- Prevent duplicate reminder emails if the cron endpoint is invoked twice concurrently.
CREATE TABLE IF NOT EXISTS reminder_email_sends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  run_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (email, run_key)
);

CREATE INDEX IF NOT EXISTS idx_reminder_email_sends_run_key
  ON reminder_email_sends(run_key);

ALTER TABLE reminder_email_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage reminder send locks" ON reminder_email_sends;
CREATE POLICY "Service role can manage reminder send locks"
  ON reminder_email_sends
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
