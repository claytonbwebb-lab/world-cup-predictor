-- Add marketing_consent column to profiles for GDPR compliance
ALTER TABLE profiles ADD COLUMN marketing_consent BOOLEAN DEFAULT FALSE;
