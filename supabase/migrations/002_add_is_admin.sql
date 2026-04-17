-- Migration: Add is_admin to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set brightstacklabs@gmail.com as admin
UPDATE profiles
SET is_admin = TRUE
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'brightstacklabs@gmail.com'
);
