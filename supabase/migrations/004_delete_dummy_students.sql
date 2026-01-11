-- Migration to delete the dummy Rookies, Juniors and Camps
-- This will automatically cascade to public.profiles and public.enrollments

-- 1. Delete Rookie Students
DELETE FROM auth.users 
WHERE email LIKE 'rookie_%@example.com' 
  AND raw_user_meta_data->>'role' = 'student';

-- 2. Delete Junior Students
DELETE FROM auth.users 
WHERE email LIKE 'junior_%@example.com' 
  AND raw_user_meta_data->>'role' = 'student';

-- 3. Delete Dummy Camps
-- This will cascade delete any remaining enrollments or linked data
DELETE FROM public.camps 
WHERE name IN ('SCBA Rookies', 'SCBA Juniors');
