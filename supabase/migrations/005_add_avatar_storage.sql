-- 5. Avatar Storage
-- Creates a public 'avatars' storage bucket for user profile images.
--
-- NOTE: If you created the bucket via the UI, the INSERT will be skipped safely (ON CONFLICT DO NOTHING).
-- Run this migration in Supabase Dashboard > SQL Editor.

-- Create the avatars bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ── Read policy: public bucket, anyone can view ──────────────────────────────
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
CREATE POLICY "Avatars are publicly readable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');

-- ── Upload policy: auth users can upload only to their own path ───────────────
-- Path must be: user-{userId}/avatar.{jpg|png|webp|gif}
-- The name::text casts the name column so || concatenation works in PG
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (
      (name::text) = 'user-' || auth.uid()::text || '/avatar.jpg'
   OR (name::text) = 'user-' || auth.uid()::text || '/avatar.png'
   OR (name::text) = 'user-' || auth.uid()::text || '/avatar.webp'
   OR (name::text) = 'user-' || auth.uid()::text || '/avatar.gif'
    )
  );

-- ── Update policy: auth users can replace their own avatar ───────────────────
-- upsert=true sends a PUT, so we need UPDATE + WITH CHECK
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (
      (name::text) = 'user-' || auth.uid()::text || '/avatar.jpg'
   OR (name::text) = 'user-' || auth.uid()::text || '/avatar.png'
   OR (name::text) = 'user-' || auth.uid()::text || '/avatar.webp'
   OR (name::text) = 'user-' || auth.uid()::text || '/avatar.gif'
    )
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (
      (name::text) = 'user-' || auth.uid()::text || '/avatar.jpg'
   OR (name::text) = 'user-' || auth.uid()::text || '/avatar.png'
   OR (name::text) = 'user-' || auth.uid()::text || '/avatar.webp'
   OR (name::text) = 'user-' || auth.uid()::text || '/avatar.gif'
    )
  );

-- ── Delete policy: auth users can delete their own avatar ────────────────────
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (
      (name::text) = 'user-' || auth.uid()::text || '/avatar.jpg'
   OR (name::text) = 'user-' || auth.uid()::text || '/avatar.png'
   OR (name::text) = 'user-' || auth.uid()::text || '/avatar.webp'
   OR (name::text) = 'user-' || auth.uid()::text || '/avatar.gif'
    )
  );