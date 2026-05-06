-- 7. Set default avatar_url for existing users who don't have one
-- New users get null (handled in app logic via DEFAULT_AVATAR constant)
-- This only populates the column for existing rows; the default-avatar.png
-- in /public is served when avatar_url is null.

-- Note: Run this AFTER deploying the code that references /default-avatar.png
-- The column is already nullable, so this is safe to re-run.
UPDATE profiles SET avatar_url = NULL WHERE avatar_url IS NULL;
