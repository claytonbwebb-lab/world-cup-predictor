-- Fix: Enable RLS on weeks table that was created without it in migration 010

ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;

-- Weeks is reference data — everyone can read it
CREATE POLICY "Weeks are viewable by everyone" ON weeks FOR SELECT USING (true);

-- Only service_role (admin API/cron jobs) can modify weeks data
CREATE POLICY "Service role can manage weeks" ON weeks
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
