-- Migration to add team names to games and team choice to game stats

-- 1. Alter games table to add team names
ALTER TABLE public.games
ADD COLUMN team_1_name TEXT NOT NULL DEFAULT 'Team 1',
ADD COLUMN team_2_name TEXT NOT NULL DEFAULT 'Team 2';

-- Copy existing opponent_name to team_2_name for backward compatibility/data preservation
UPDATE public.games
SET team_2_name = opponent_name;

-- We can keep opponent_name for now or drop it. 
-- The plan mentioned replacing it, but to be safe and avoid breaking running app immediately if used elsewhere, 
-- we will just make it nullable or ignore it for now, but typically migrations should be clean.
-- Let's make it nullable so we don't forcedly need it, eventually we can drop it.
ALTER TABLE public.games
ALTER COLUMN opponent_name DROP NOT NULL;

-- 2. Alter game_stats to add team choice
ALTER TABLE public.game_stats
ADD COLUMN team_choice TEXT CHECK (team_choice IN ('team_1', 'team_2'));

-- Create index for faster filtering by team
CREATE INDEX idx_game_stats_team ON public.game_stats(game_id, team_choice);
