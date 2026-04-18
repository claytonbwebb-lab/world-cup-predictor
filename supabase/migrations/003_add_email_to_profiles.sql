-- Fix trigger to capture email (already has email column per Steve's DB)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'User_' || LEFT(NEW.id::TEXT, 8)),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sync email for any existing profiles that have auth.users entry but no email
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id AND p.email IS NULL AND u.email IS NOT NULL;