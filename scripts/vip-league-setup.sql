-- Card 48: VIP League — DB Migration
-- Run this in the Supabase SQL Editor for staging (hcqdgbmzizunjxynhaoz.supabase.co)
-- After running, copy the returned VIP_LEAGUE_ID and add it to .env.local as VIP_LEAGUE_ID=<value>

-- 1. Add is_vip flag to leagues table
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS is_vip boolean DEFAULT false;

-- 2. Create the VIP League and get its ID
INSERT INTO leagues (name, code, created_by, is_public, is_vip)
VALUES (
  'VIP League',
  'FDA82FB6',
  '0bf49143-9828-439b-b982-c0a5c1cc114f',  -- Malesy (Steve)
  false,
  true
)
ON CONFLICT DO NOTHING
RETURNING id, name, code, is_vip;