-- 1. Profiles Table
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  email text unique,
  display_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  constraint username_length check (char_length(username) >= 3)
);

-- RLS for Profiles
alter table profiles enable row level security;
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 2. Exercises Table
create table if not exists exercises (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  muscle_group text not null,
  equipment text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add unique constraint to name if it doesn't exist
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'exercises_name_key') then
    alter table exercises add constraint exercises_name_key unique (name);
  end if;
end $$;

-- RLS for Exercises
alter table exercises enable row level security;
drop policy if exists "Exercises are readable by everyone." on exercises;
create policy "Exercises are readable by everyone." on exercises for select using (true);

-- 3. Routines Table
create table if not exists routines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Routines
alter table routines enable row level security;
drop policy if exists "Users can manage their own routines." on routines;
create policy "Users can manage their own routines." on routines for all using (auth.uid() = user_id);

-- 4. Workouts Table
create table if not exists workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  duration text,
  total_volume numeric,
  exercises jsonb not null default '[]'::jsonb,
  completed_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Workouts
alter table workouts enable row level security;
drop policy if exists "Users can manage their own workouts." on workouts;
create policy "Users can manage their own workouts." on workouts for all using (auth.uid() = user_id);

-- 5. Seed Popular Exercises
insert into exercises (name, muscle_group, equipment) values
  ('Bench Press (Barbell)', 'Chest', 'Barbell'),
  ('Incline Bench Press (Barbell)', 'Chest', 'Barbell'),
  ('Dumbbell Bench Press', 'Chest', 'Dumbbell'),
  ('Chest Fly (Dumbbell)', 'Chest', 'Dumbbell'),
  ('Squat (Barbell)', 'Legs', 'Barbell'),
  ('Leg Press', 'Legs', 'Machine'),
  ('Leg Extension', 'Legs', 'Machine'),
  ('Leg Curl', 'Legs', 'Machine'),
  ('Deadlift (Barbell)', 'Back', 'Barbell'),
  ('Pull Up', 'Back', 'Bodyweight'),
  ('Lat Pulldown', 'Back', 'Machine'),
  ('Bent Over Row (Barbell)', 'Back', 'Barbell'),
  ('Overhead Press (Barbell)', 'Shoulders', 'Barbell'),
  ('Lateral Raise (Dumbbell)', 'Shoulders', 'Dumbbell'),
  ('Bicep Curl (Dumbbell)', 'Arms', 'Dumbbell'),
  ('Hammer Curl (Dumbbell)', 'Arms', 'Dumbbell'),
  ('Triceps Pushdown', 'Arms', 'Cable'),
  ('Skull Crusher', 'Arms', 'Barbell'),
  ('Plank', 'Abs', 'Bodyweight'),
  ('Crunches', 'Abs', 'Bodyweight')
on conflict (name) do nothing;
