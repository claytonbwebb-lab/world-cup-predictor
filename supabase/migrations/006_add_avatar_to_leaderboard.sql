-- 6. Add avatar_url to leaderboard view
DROP VIEW IF EXISTS leaderboard;
CREATE OR REPLACE VIEW leaderboard AS
SELECT
    p.id as user_id,
    p.username,
    p.avatar_url,
    COALESCE(SUM(pr.points_awarded), 0) as total_points,
    COUNT(pr.id) FILTER (WHERE pr.is_exact_score = true) as exact_scores,
    COUNT(pr.id) FILTER (WHERE pr.is_correct_result = true AND pr.is_exact_score = false) as correct_results,
    COUNT(pr.id) as total_predictions
FROM profiles p
LEFT JOIN predictions pr ON p.id = pr.user_id AND pr.scored_at IS NOT NULL
GROUP BY p.id, p.username, p.avatar_url
ORDER BY total_points DESC, exact_scores DESC;
