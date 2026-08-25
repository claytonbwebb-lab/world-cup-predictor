-- Safe: CREATE OR REPLACE FUNCTION only; no data mutation.
-- Revert: DROP FUNCTION get_leaderboard(INT, TIMESTAMPTZ, TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION get_leaderboard(
  p_week_number INT DEFAULT NULL,
  p_month_start TIMESTAMPTZ DEFAULT NULL,
  p_month_end TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  total_points INT,
  exact_scores INT,
  correct_results INT,
  total_predictions INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    COALESCE(s.total_points, 0)::INT,
    COALESCE(s.exact_scores, 0)::INT,
    COALESCE(s.correct_results, 0)::INT,
    COALESCE(s.total_predictions, 0)::INT
  FROM profiles p
  LEFT JOIN (
    SELECT
      pred.user_id,
      SUM(pred.points_awarded) AS total_points,
      SUM(CASE WHEN pred.is_exact_score THEN 1 ELSE 0 END) AS exact_scores,
      SUM(CASE WHEN pred.is_correct_result AND NOT pred.is_exact_score THEN 1 ELSE 0 END) AS correct_results,
      COUNT(*) AS total_predictions
    FROM predictions pred
    JOIN matches m ON m.id = pred.match_id
    WHERE pred.scored_at IS NOT NULL
      AND (p_week_number IS NULL OR m.week_number = p_week_number)
      AND (p_month_start IS NULL OR m.kickoff_at >= p_month_start)
      AND (p_month_end IS NULL OR m.kickoff_at <= p_month_end)
    GROUP BY pred.user_id
  ) s ON s.user_id = p.id
  WHERE p.id != '00000000-0000-0000-0000-000000000000'
  ORDER BY
    COALESCE(s.total_points, 0) DESC,
    COALESCE(s.exact_scores, 0) DESC,
    COALESCE(s.correct_results, 0) DESC,
    p.id;
END;
$$;
