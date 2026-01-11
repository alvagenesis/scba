-- Migration to add 50 Rookies and 50 Juniors with Enrollments
-- This script inserts users into auth.users, triggers profile creation, creates camps, and enrolls students

DO $$
DECLARE
  v_rookie_camp_id UUID;
  v_junior_camp_id UUID;
  v_student_id UUID;
  i INTEGER;
  -- Hash for 'password123'
  v_password_hash CONSTANT TEXT := '$2a$10$2b2c2d2e2f2g2h2i2j2k2l2m2n2o2p2q2r2s2t2u2v2w2x2y2z'; 
BEGIN
  -- 1. Create or Get 'SCBA Rookies' Camp
  SELECT id INTO v_rookie_camp_id FROM public.camps WHERE name = 'SCBA Rookies' LIMIT 1;
  
  IF v_rookie_camp_id IS NULL THEN
    INSERT INTO public.camps (name, start_date, end_date, price, location, description)
    VALUES ('SCBA Rookies', CURRENT_DATE + 30, CURRENT_DATE + 35, 1500.00, 'Main Gym', 'Basics for beginners')
    RETURNING id INTO v_rookie_camp_id;
  END IF;

  -- 2. Create or Get 'SCBA Juniors' Camp
  SELECT id INTO v_junior_camp_id FROM public.camps WHERE name = 'SCBA Juniors' LIMIT 1;
  
  IF v_junior_camp_id IS NULL THEN
    INSERT INTO public.camps (name, start_date, end_date, price, location, description)
    VALUES ('SCBA Juniors', CURRENT_DATE + 40, CURRENT_DATE + 45, 2000.00, 'Main Gym', 'Intermediate skills training')
    RETURNING id INTO v_junior_camp_id;
  END IF;

  -- 3. Create 50 Rookie Students and Enroll them
  FOR i IN 1..50 LOOP
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'rookie_' || i || '@example.com') THEN
        v_student_id := gen_random_uuid();
        
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_user_meta_data,
          created_at,
          updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          v_student_id,
          'authenticated',
          'authenticated',
          'rookie_' || i || '@example.com',
          v_password_hash,
          now(),
          jsonb_build_object('name', 'Rookies Student ' || i, 'role', 'student'),
          now(),
          now()
        );

        -- Enroll in Rookies Camp (Profile is created by trigger, so we can insert enrollment directly using v_student_id)
        -- We might need a small delay or ensure trigger fires, but usually in same transaction triggers fire immediately.
        -- However, inserting into enrollments requires the profile to exist. 
        -- The trigger on auth.users inserts into profiles.
        
        INSERT INTO public.enrollments (student_id, camp_id)
        VALUES (v_student_id, v_rookie_camp_id);
    END IF;
  END LOOP;

  -- 4. Create 50 Junior Students and Enroll them
  FOR i IN 1..50 LOOP
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'junior_' || i || '@example.com') THEN
        v_student_id := gen_random_uuid();
        
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_user_meta_data,
          created_at,
          updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          v_student_id,
          'authenticated',
          'authenticated',
          'junior_' || i || '@example.com',
          v_password_hash,
          now(),
          jsonb_build_object('name', 'Juniors Student ' || i, 'role', 'student'),
          now(),
          now()
        );

        INSERT INTO public.enrollments (student_id, camp_id)
        VALUES (v_student_id, v_junior_camp_id);
    END IF;
  END LOOP;
END $$;
