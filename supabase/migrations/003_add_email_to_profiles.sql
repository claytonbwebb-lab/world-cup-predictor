-- Fix trigger to capture email and set search_path explicitly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'User_' || LEFT(NEW.id::TEXT, 8)),
        NEW.email
    );
    RETURN NEW;
END;
$$;

-- Sync email for any existing profiles that have auth.users entry but no email
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id AND p.email IS NULL AND u.email IS NOT NULL;
