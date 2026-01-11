-- Migration: Add email column to profiles and backfill data

-- 1. Add email column to profiles table
ALTER TABLE public.profiles
ADD COLUMN email TEXT;

-- 2. Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, email)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'name', 
    NEW.raw_user_meta_data->>'role',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill existing profiles with data from auth.users
-- This requires the user permissions to read from auth.users, which might be restricted.
-- If this fails, we might need a trusted execution environment or manual admin run.
-- Standard Supabase projects usually allow the postgres role to access auth.users.

DO $$
BEGIN
    UPDATE public.profiles p
    SET email = u.email
    FROM auth.users u
    WHERE p.id = u.id
    AND p.email IS NULL;
END $$;
