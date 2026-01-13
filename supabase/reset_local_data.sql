-- DATA RESET SCRIPT
-- Since the Supabase CLI is not available, copy and paste this into your Supabase Dashboard > SQL Editor to reset data.

-- 1. Truncate tables (Removes all data from these tables)
TRUNCATE TABLE public.attendance CASCADE;
TRUNCATE TABLE public.game_stats CASCADE;
TRUNCATE TABLE public.games CASCADE;
TRUNCATE TABLE public.evaluations CASCADE;
TRUNCATE TABLE public.training_sessions CASCADE;
TRUNCATE TABLE public.enrollments CASCADE;
TRUNCATE TABLE public.camps CASCADE;

-- 2. Delete Users (This will cascade to public.profiles)
-- CAUTION: This deletes ALL users.
-- If you want to keep your current logged-in user, you might want to filter by email.
-- For example: DELETE FROM auth.users WHERE email != 'your_email@gmail.com';

DELETE FROM auth.users;

-- 3. You can now run the 001_realistic_data.sql script again to repopulate fresh data.
