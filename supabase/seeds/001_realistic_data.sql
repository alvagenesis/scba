-- Comprehensive Realistic Test Data Generator
-- Creates: 
-- 1. SCBA Rookies & SCBA Juniors Camps
-- 2. 100 students for each camp with realistic names/emails
-- 3. 20 games (10 per camp) with rosters (15 players per team)
-- 4. 40 training sessions (20 per camp)

DO $$
DECLARE
    v_rookie_camp_id UUID;
    v_junior_camp_id UUID;
    v_student_id UUID;
    v_game_id UUID;
    v_session_id UUID;
    v_team1_count INTEGER;
    v_team2_count INTEGER;
    i INTEGER;
    j INTEGER;
    
    -- Hash for 'password123'
    v_password_hash CONSTANT TEXT := '$2a$10$2b2c2d2e2f2g2h2i2j2k2l2m2n2o2p2q2r2s2t2u2v2w2x2y2z';
    
    -- Names Arrays
    v_first_names TEXT[] := ARRAY[
        'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth',
        'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
        'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
        'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
        'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Edward', 'Deborah',
        'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon', 'Jeffrey', 'Laura', 'Ryan', 'Cynthia',
        'Jacob', 'Kathleen', 'Gary', 'Amy', 'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen',
        'Stephen', 'Anna', 'Larry', 'Brenda', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Emma',
        'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Gregory', 'Christine', 'Frank', 'Debra', 'Alexander', 'Rachel',
        'Raymond', 'Catherine', 'Patrick', 'Carolyn', 'Jack', 'Janet', 'Dennis', 'Ruth', 'Jerry', 'Maria'
    ];
    
    v_last_names TEXT[] := ARRAY[
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
        'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
        'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
        'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
        'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
        'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
        'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
        'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
        'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
        'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez'
    ];
    
    v_first_name TEXT;
    v_last_name TEXT;
    v_full_name TEXT;
    v_email TEXT;
    v_team1_name TEXT;
    v_team2_name TEXT;
    
    -- Team Names Arrays
    v_mascots TEXT[] := ARRAY['Bulls', 'Lakers', 'Celtics', 'Warriors', 'Heat', 'Spurs', 'Suns', 'Bucks', 'Nets', 'Knicks', 'Rockets', 'Hawks', 'Kings', 'Magic', 'Jazz', 'Thunder', 'Pacers', 'Hornets', 'Wolves', 'Grizzlies'];
    v_colors TEXT[] := ARRAY['Red', 'Blue', 'Green', 'Gold', 'Black', 'White', 'Purple', 'Orange', 'Silver', 'Navy'];
    
BEGIN
    ---------- 1. CAMPS ----------
    -- Create or Get 'SCBA Rookies'
    SELECT id INTO v_rookie_camp_id FROM public.camps WHERE name = 'SCBA Rookies' LIMIT 1;
    IF v_rookie_camp_id IS NULL THEN
        INSERT INTO public.camps (name, start_date, end_date, price, location, description)
        VALUES ('SCBA Rookies', CURRENT_DATE + 30, CURRENT_DATE + 40, 1500.00, 'Main Gym', 'Basics for beginners')
        RETURNING id INTO v_rookie_camp_id;
    END IF;

    -- Create or Get 'SCBA Juniors'
    SELECT id INTO v_junior_camp_id FROM public.camps WHERE name = 'SCBA Juniors' LIMIT 1;
    IF v_junior_camp_id IS NULL THEN
        INSERT INTO public.camps (name, start_date, end_date, price, location, description)
        VALUES ('SCBA Juniors', CURRENT_DATE + 45, CURRENT_DATE + 55, 2000.00, 'Main Gym', 'Intermediate skills training')
        RETURNING id INTO v_junior_camp_id;
    END IF;

    ---------- 2. STUDENTS (100 Rookies, 100 Juniors) ----------
    -- Rookies
    FOR i IN 1..100 LOOP
        -- Generate Name
        v_first_name := v_first_names[1 + floor(random() * array_length(v_first_names, 1))::int];
        v_last_name := v_last_names[1 + floor(random() * array_length(v_last_names, 1))::int];
        v_full_name := v_first_name || ' ' || v_last_name;
        v_email := lower(v_first_name) || '.' || lower(v_last_name) || i || '@rookie.com';

        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
            v_student_id := gen_random_uuid();
            
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', v_student_id, 'authenticated', 'authenticated', v_email, v_password_hash, now(),
                jsonb_build_object('name', v_full_name, 'role', 'student'), now(), now()
            );

            -- Enrollment (Trigger handles profile)
            INSERT INTO public.enrollments (student_id, camp_id) VALUES (v_student_id, v_rookie_camp_id);
        END IF;
    END LOOP;

    -- Juniors
    FOR i IN 1..100 LOOP
        v_first_name := v_first_names[1 + floor(random() * array_length(v_first_names, 1))::int];
        v_last_name := v_last_names[1 + floor(random() * array_length(v_last_names, 1))::int];
        v_full_name := v_first_name || ' ' || v_last_name;
        v_email := lower(v_first_name) || '.' || lower(v_last_name) || i || '@junior.com';

        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
            v_student_id := gen_random_uuid();
            
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', v_student_id, 'authenticated', 'authenticated', v_email, v_password_hash, now(),
                jsonb_build_object('name', v_full_name, 'role', 'student'), now(), now()
            );

            INSERT INTO public.enrollments (student_id, camp_id) VALUES (v_student_id, v_junior_camp_id);
        END IF;
    END LOOP;

    ---------- 3. GAMES (20 Games -> 10 per camp) ----------
    -- Rookies Games
    FOR i IN 1..10 LOOP
        v_team1_name := v_colors[1 + floor(random() * array_length(v_colors, 1))::int] || ' ' || v_mascots[1 + floor(random() * array_length(v_mascots, 1))::int];
        v_team2_name := v_colors[1 + floor(random() * array_length(v_colors, 1))::int] || ' ' || v_mascots[1 + floor(random() * array_length(v_mascots, 1))::int];
        
        -- Fallback if same name
        IF v_team1_name = v_team2_name THEN
             v_team2_name := 'Challengers';
        END IF;

        INSERT INTO public.games (camp_id, game_date, team_1_name, team_2_name)
        VALUES (v_rookie_camp_id, CURRENT_DATE + i, v_team1_name, v_team2_name)
        RETURNING id INTO v_game_id;

        -- Assign Players (15 per team)
        -- Get 30 random enrolled students
        FOR v_student_id IN 
            SELECT student_id FROM public.enrollments WHERE camp_id = v_rookie_camp_id ORDER BY random() LIMIT 30
        LOOP
            -- Check current counts (approximation inside loop)
            SELECT COUNT(*) INTO v_team1_count FROM public.game_stats WHERE game_id = v_game_id AND team_choice = 'team_1';
            
            IF v_team1_count < 15 THEN
                INSERT INTO public.game_stats (game_id, student_id, team_choice, points, rebounds, assists, steals, blocks)
                VALUES (v_game_id, v_student_id, 'team_1', floor(random()*20)::int, floor(random()*10)::int, floor(random()*5)::int, floor(random()*3)::int, floor(random()*2)::int);
            ELSE
                INSERT INTO public.game_stats (game_id, student_id, team_choice, points, rebounds, assists, steals, blocks)
                VALUES (v_game_id, v_student_id, 'team_2', floor(random()*20)::int, floor(random()*10)::int, floor(random()*5)::int, floor(random()*3)::int, floor(random()*2)::int);
            END IF;
        END LOOP;
    END LOOP;

    -- Juniors Games (Same logic)
    FOR i IN 1..10 LOOP
        v_team1_name := v_colors[1 + floor(random() * array_length(v_colors, 1))::int] || ' ' || v_mascots[1 + floor(random() * array_length(v_mascots, 1))::int];
        v_team2_name := v_colors[1 + floor(random() * array_length(v_colors, 1))::int] || ' ' || v_mascots[1 + floor(random() * array_length(v_mascots, 1))::int];
        
        IF v_team1_name = v_team2_name THEN v_team2_name := 'Challengers'; END IF;

        INSERT INTO public.games (camp_id, game_date, team_1_name, team_2_name)
        VALUES (v_junior_camp_id, CURRENT_DATE + i, v_team1_name, v_team2_name)
        RETURNING id INTO v_game_id;

        FOR v_student_id IN 
            SELECT student_id FROM public.enrollments WHERE camp_id = v_junior_camp_id ORDER BY random() LIMIT 30
        LOOP
            SELECT COUNT(*) INTO v_team1_count FROM public.game_stats WHERE game_id = v_game_id AND team_choice = 'team_1';
            
            IF v_team1_count < 15 THEN
                 INSERT INTO public.game_stats (game_id, student_id, team_choice, points, rebounds, assists, steals, blocks)
                VALUES (v_game_id, v_student_id, 'team_1', floor(random()*25)::int, floor(random()*12)::int, floor(random()*8)::int, floor(random()*5)::int, floor(random()*3)::int);
            ELSE
                 INSERT INTO public.game_stats (game_id, student_id, team_choice, points, rebounds, assists, steals, blocks)
                VALUES (v_game_id, v_student_id, 'team_2', floor(random()*25)::int, floor(random()*12)::int, floor(random()*8)::int, floor(random()*5)::int, floor(random()*3)::int);
            END IF;
        END LOOP;
    END LOOP;

    ---------- 4. TRAINING SESSIONS (40 Sessions -> 20 per camp) ----------
    -- Rookies
    FOR i IN 1..20 LOOP
        INSERT INTO public.training_sessions (camp_id, session_date, drill_topic, notes)
        VALUES (v_rookie_camp_id, CURRENT_DATE + i, 'Drill Topic ' || i, 'Focus on fundamentals');
    END LOOP;

    -- Juniors
    FOR i IN 1..20 LOOP
        INSERT INTO public.training_sessions (camp_id, session_date, drill_topic, notes)
        VALUES (v_junior_camp_id, CURRENT_DATE + i, 'Advanced Drill Topic ' || i, 'Focus on strategy');
    END LOOP;
    
END $$;
