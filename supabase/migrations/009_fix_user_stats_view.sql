-- Fix user_stats view to include exact_scores and correct_results
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    p.id as user_id,
    p.username,
    COALESCE(SUM(pr.points_awarded), 0) as total_points,
    COUNT(DISTINCT pr.match_id) as matches_predicted,
    COUNT(pr.id) FILTER (WHERE pr.scored_at IS NOT NULL) as scored_predictions,
    COUNT(pr.id) FILTER (WHERE pr.is_exact_score = true) as exact_scores,
    COUNT(pr.id) FILTER (WHERE pr.points_awarded > 0 AND pr.is_exact_score = false) as correct_results
FROM profiles p
LEFT JOIN predictions pr ON p.id = pr.user_id
GROUP BY p.id, p.username;
