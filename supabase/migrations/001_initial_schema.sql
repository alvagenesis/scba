-- Basketball Camp Management System - Initial Schema
-- This migration creates all tables for the application

-- ============================================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with role and additional info
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'coach')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster role-based queries
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- CAMPS TABLE
-- Stores basketball camp information
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.camps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- ============================================================================
-- ENROLLMENTS TABLE
-- Links students to camps (junction table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  camp_id UUID NOT NULL REFERENCES public.camps(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, camp_id) -- Prevent duplicate enrollments
);

-- Create indexes for faster lookups
CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_camp ON public.enrollments(camp_id);

-- ============================================================================
-- GAMES TABLE
-- Stores game records for each camp
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  camp_id UUID NOT NULL REFERENCES public.camps(id) ON DELETE CASCADE,
  game_date DATE NOT NULL,
  opponent_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster camp-based queries
CREATE INDEX idx_games_camp ON public.games(camp_id);

-- ============================================================================
-- GAME_STATS TABLE
-- Links students to games with their performance statistics
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.game_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  rebounds INTEGER DEFAULT 0 CHECK (rebounds >= 0),
  assists INTEGER DEFAULT 0 CHECK (assists >= 0),
  steals INTEGER DEFAULT 0 CHECK (steals >= 0),
  blocks INTEGER DEFAULT 0 CHECK (blocks >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, student_id) -- One stat record per student per game
);

-- Create indexes for faster lookups
CREATE INDEX idx_game_stats_game ON public.game_stats(game_id);
CREATE INDEX idx_game_stats_student ON public.game_stats(student_id);

-- ============================================================================
-- TRAINING_SESSIONS TABLE
-- Stores training/practice sessions for each camp
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.training_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  camp_id UUID NOT NULL REFERENCES public.camps(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  drill_topic TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster camp-based queries
CREATE INDEX idx_training_sessions_camp ON public.training_sessions(camp_id);

-- ============================================================================
-- EVALUATIONS TABLE
-- Links students to training sessions with coach evaluations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_session_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  strengths TEXT,
  weaknesses TEXT,
  coach_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(training_session_id, student_id) -- One evaluation per student per session
);

-- Create indexes for faster lookups
CREATE INDEX idx_evaluations_session ON public.evaluations(training_session_id);
CREATE INDEX idx_evaluations_student ON public.evaluations(student_id);

-- ============================================================================
-- TRIGGERS
-- Automatically create profile when user signs up
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'role');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- UPDATE TIMESTAMP TRIGGERS
-- Automatically update 'updated_at' on record modification
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.camps FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.game_stats FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.training_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.evaluations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
