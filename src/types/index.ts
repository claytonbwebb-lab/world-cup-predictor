export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Match = {
  id: string;
  home_team: string;
  away_team: string;
  home_flag: string | null;
  away_flag: string | null;
  group_stage: string | null;
  kickoff_at: string;
  home_score: number | null;
  away_score: number | null;
  is_locked: boolean;
  result_entered: boolean;
  created_at: string;
  updated_at: string;
};

export type Prediction = {
  id: string;
  user_id: string;
  match_id: string;
  home_prediction: number;
  away_prediction: number;
  points_awarded: number;
  is_exact_score: boolean;
  is_correct_result: boolean;
  scored_at: string | null;
  created_at: string;
  updated_at: string;
};

export type League = {
  id: string;
  name: string;
  code: string;
  created_by: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type LeagueMember = {
  id: string;
  league_id: string;
  user_id: string;
  joined_at: string;
};

export type BonusPrediction = {
  id: string;
  user_id: string;
  prediction_type: string;
  prediction_value: string;
  points_awarded: number;
  is_correct: boolean;
  result: string | null;
  scored_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LeaderboardEntry = {
  user_id: string;
  username: string;
  total_points: number;
  exact_scores: number;
  correct_results: number;
  total_predictions: number;
};

export type UserStats = {
  user_id: string;
  username: string;
  total_points: number;
  matches_predicted: number;
  scored_predictions: number;
};

export type MatchWithPrediction = Match & {
  prediction?: Prediction;
};