-- World Cup Prediction League - Initial Schema
-- Phase 1: Core tables, RLS policies, and triggers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES - extends auth.users
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MATCHES - World Cup matches
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_flag TEXT, -- emoji flag
    away_flag TEXT, -- emoji flag
    group_stage TEXT, -- e.g., 'A', 'B', 'Round of 16', 'Quarter-final', etc.
    kickoff_at TIMESTAMPTZ NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    is_locked BOOLEAN DEFAULT FALSE,
    result_entered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PREDICTIONS - User predictions per match
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    home_prediction INTEGER NOT NULL,
    away_prediction INTEGER NOT NULL,
    points_awarded INTEGER DEFAULT 0,
    is_exact_score BOOLEAN DEFAULT FALSE,
    is_correct_result BOOLEAN DEFAULT FALSE,
    scored_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

-- 4. LEAGUES - Private prediction leagues
CREATE TABLE leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- invite code
    created_by UUID NOT NULL REFERENCES profiles(id),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LEAGUE_MEMBERS - Users in leagues
CREATE TABLE league_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(league_id, user_id)
);

-- 6. BONUS_PREDICTIONS - Special predictions (golden boot, winner, etc.)
CREATE TABLE bonus_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    prediction_type TEXT NOT NULL, -- 'winner', 'golden_boot', 'top_scorer', etc.
    prediction_value TEXT NOT NULL, -- team name or player name
    points_awarded INTEGER DEFAULT 0,
    is_correct BOOLEAN DEFAULT FALSE,
    result TEXT, -- actual result
    scored_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, prediction_type)
);

-- INDEXES
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_league_members_user ON league_members(user_id);
CREATE INDEX idx_league_members_league ON league_members(league_id);
CREATE INDEX idx_matches_kickoff ON matches(kickoff_at);

-- RLS POLICIES

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_predictions ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read all profiles, update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- MATCHES: Everyone can read, only admin can modify
CREATE POLICY "Matches are viewable by everyone" ON matches FOR SELECT USING (true);
CREATE POLICY "Anyone can insert matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update matches" ON matches FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete matches" ON matches FOR DELETE USING (true);

-- PREDICTIONS: Users read all, can create/update own
CREATE POLICY "Predictions viewable by everyone" ON predictions FOR SELECT USING (true);
CREATE POLICY "Users can insert own predictions" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own predictions" ON predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own predictions" ON predictions FOR DELETE USING (auth.uid() = user_id);

-- LEAGUES: Everyone can read, members can modify
CREATE POLICY "Leagues viewable by everyone" ON leagues FOR SELECT USING (true);
CREATE POLICY "Users can create leagues" ON leagues FOR INSERT WITH CHECK (true);
CREATE POLICY "Members can update league" ON leagues FOR UPDATE USING (true);

-- LEAGUE_MEMBERS: Everyone can read, users can join/leave
CREATE POLICY "League members viewable by everyone" ON league_members FOR SELECT USING (true);
CREATE POLICY "Users can join leagues" ON league_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave leagues" ON league_members FOR DELETE USING (auth.uid() = user_id);

-- BONUS_PREDICTIONS: Users can manage own
CREATE POLICY "Bonus predictions viewable by everyone" ON bonus_predictions FOR SELECT USING (true);
CREATE POLICY "Users can insert own bonus predictions" ON bonus_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bonus predictions" ON bonus_predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bonus predictions" ON bonus_predictions FOR DELETE USING (auth.uid() = user_id);

-- TRIGGER: Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'User_' || LEFT(NEW.id::TEXT, 8)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- VIEW: Global leaderboard with aggregated scores
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    p.id as user_id,
    p.username,
    COALESCE(SUM(pr.points_awarded), 0) as total_points,
    COUNT(pr.id) FILTER (WHERE pr.is_exact_score = true) as exact_scores,
    COUNT(pr.id) FILTER (WHERE pr.is_correct_result = true AND pr.is_exact_score = false) as correct_results,
    COUNT(pr.id) as total_predictions
FROM profiles p
LEFT JOIN predictions pr ON p.id = pr.user_id AND pr.scored_at IS NOT NULL
GROUP BY p.id, p.username
ORDER BY total_points DESC, exact_scores DESC;

-- VIEW: User stats with predictions
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    p.id as user_id,
    p.username,
    COALESCE(SUM(pr.points_awarded), 0) as total_points,
    COUNT(DISTINCT pr.match_id) as matches_predicted,
    COUNT(pr.id) FILTER (WHERE pr.scored_at IS NOT NULL) as scored_predictions
FROM profiles p
LEFT JOIN predictions pr ON p.id = pr.user_id
GROUP BY p.id, p.username;