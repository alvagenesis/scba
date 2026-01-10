-- Basketball Camp Management System - Row Level Security Policies
-- This migration sets up RLS policies for role-based access control

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Everyone can view all profiles (needed for roster displays)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Coaches can update any profile
CREATE POLICY "Coaches can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- ============================================================================
-- CAMPS TABLE POLICIES
-- ============================================================================

-- Everyone can view all camps
CREATE POLICY "Camps are viewable by everyone"
  ON public.camps FOR SELECT
  USING (true);

-- Only coaches can create camps
CREATE POLICY "Coaches can create camps"
  ON public.camps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Only coaches can update camps
CREATE POLICY "Coaches can update camps"
  ON public.camps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Only coaches can delete camps
CREATE POLICY "Coaches can delete camps"
  ON public.camps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- ============================================================================
-- ENROLLMENTS TABLE POLICIES
-- ============================================================================

-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (student_id = auth.uid());

-- Coaches can view all enrollments
CREATE POLICY "Coaches can view all enrollments"
  ON public.enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Students can enroll themselves
CREATE POLICY "Students can enroll themselves"
  ON public.enrollments FOR INSERT
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );

-- Coaches can create any enrollment
CREATE POLICY "Coaches can create enrollments"
  ON public.enrollments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Coaches can delete any enrollment
CREATE POLICY "Coaches can delete enrollments"
  ON public.enrollments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- ============================================================================
-- GAMES TABLE POLICIES
-- ============================================================================

-- Students can view games for camps they're enrolled in
CREATE POLICY "Students can view games for enrolled camps"
  ON public.games FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE student_id = auth.uid() AND camp_id = games.camp_id
    )
  );

-- Coaches can view all games
CREATE POLICY "Coaches can view all games"
  ON public.games FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Only coaches can create games
CREATE POLICY "Coaches can create games"
  ON public.games FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Only coaches can update games
CREATE POLICY "Coaches can update games"
  ON public.games FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Only coaches can delete games
CREATE POLICY "Coaches can delete games"
  ON public.games FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- ============================================================================
-- GAME_STATS TABLE POLICIES
-- ============================================================================

-- Students can view only their own stats
CREATE POLICY "Students can view own stats"
  ON public.game_stats FOR SELECT
  USING (student_id = auth.uid());

-- Coaches can view all stats
CREATE POLICY "Coaches can view all stats"
  ON public.game_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Only coaches can create stats
CREATE POLICY "Coaches can create stats"
  ON public.game_stats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Only coaches can update stats
CREATE POLICY "Coaches can update stats"
  ON public.game_stats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Only coaches can delete stats
CREATE POLICY "Coaches can delete stats"
  ON public.game_stats FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- ============================================================================
-- TRAINING_SESSIONS TABLE POLICIES
-- ============================================================================

-- Students can view sessions for camps they're enrolled in
CREATE POLICY "Students can view sessions for enrolled camps"
  ON public.training_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE student_id = auth.uid() AND camp_id = training_sessions.camp_id
    )
  );

-- Coaches can view all sessions
CREATE POLICY "Coaches can view all sessions"
  ON public.training_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Only coaches can create sessions
CREATE POLICY "Coaches can create sessions"
  ON public.training_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Only coaches can update sessions
CREATE POLICY "Coaches can update sessions"
  ON public.training_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Only coaches can delete sessions
CREATE POLICY "Coaches can delete sessions"
  ON public.training_sessions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- ============================================================================
-- EVALUATIONS TABLE POLICIES
-- ============================================================================

-- Students can view only their own evaluations
CREATE POLICY "Students can view own evaluations"
  ON public.evaluations FOR SELECT
  USING (student_id = auth.uid());

-- Coaches can view all evaluations
CREATE POLICY "Coaches can view all evaluations"
  ON public.evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Only coaches can create evaluations
CREATE POLICY "Coaches can create evaluations"
  ON public.evaluations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Only coaches can update evaluations
CREATE POLICY "Coaches can update evaluations"
  ON public.evaluations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Only coaches can delete evaluations
CREATE POLICY "Coaches can delete evaluations"
  ON public.evaluations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coach'
    )
  );
