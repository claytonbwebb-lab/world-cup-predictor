-- 5. Avatar Storage
-- Creates a public 'avatars' storage bucket for user profile images.
--
-- NOTE: If the bucket creation fails (storage not enabled or permission denied),
-- create it manually in the Supabase Dashboard > Storage > New Bucket > Name: "avatars" > Public.
--
-- After creating the bucket, also add an index on bucket_id + name for performance:
-- CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_name ON storage.objects(bucket_id, (name::text));

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

-- Allow anyone to read avatars (public bucket)
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
CREATE POLICY "Avatars are publicly readable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload/replace their own avatar.
-- File path must contain the user's ID: user-{userId}/avatar.{ext}
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (name::text) = 'user-' || auth.uid()::text || '/avatar.jpg'
     OR (name::text) = 'user-' || auth.uid()::text || '/avatar.png'
     OR (name::text) = 'user-' || auth.uid()::text || '/avatar.webp'
     OR (name::text) = 'user-' || auth.uid()::text || '/avatar.gif'
  );

-- Allow users to update (re-upload) their own avatar
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'avatars')
  WITH CHECK (
    bucket_id = 'avatars'
    AND (name::text) = 'user-' || auth.uid()::text || '/avatar.jpg'
     OR (name::text) = 'user-' || auth.uid()::text || '/avatar.png'
     OR (name::text) = 'user-' || auth.uid()::text || '/avatar.webp'
     OR (name::text) = 'user-' || auth.uid()::text || '/avatar.gif'
  );
