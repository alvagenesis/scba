create table attendance (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  game_id uuid references games(id) on delete cascade,
  training_session_id uuid references training_sessions(id) on delete cascade,
  status text check (status in ('present', 'absent', 'excused')) default 'present' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for faster lookups
create index attendance_student_id_idx on attendance(student_id);
create index attendance_game_id_idx on attendance(game_id);
create index attendance_training_session_id_idx on attendance(training_session_id);

-- Enable RLS
alter table attendance enable row level security;

-- Policies
create policy "Attendance viewable by everyone" on attendance
  for select using (true);

create policy "Attendance insertable by coaches" on attendance
  for insert with check (
    auth.uid() in (select id from profiles where role = 'coach')
  );

create policy "Attendance updateable by coaches" on attendance
  for update using (
    auth.uid() in (select id from profiles where role = 'coach')
  );

create policy "Attendance deletable by coaches" on attendance
  for delete using (
    auth.uid() in (select id from profiles where role = 'coach')
  );
