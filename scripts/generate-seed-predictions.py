#!/usr/bin/env python3
"""
Generates a SQL seed file for predictions across all users and completed matches.
Run: python3 scripts/generate-seed-predictions.py > supabase/migrations/012_seed_predictions.sql
Then paste into Supabase SQL Editor.
"""
import hashlib

# Real users (Malesy, Fabs, Stevemales) + fake test users
USERS = [
    ('0bf49143-9828-439b-b982-c0a5c1cc114f', 'Malesy',      1),
    ('c6ab716c-bcd5-44ef-b1f4-342faa0556f7', 'Fabs',        2),
    ('e7d24191-adbf-4317-8b26-b008d1870a44', 'Stevemales',  3),
    ('11111111-1111-1111-1111-111111111111', 'FootyTipster_Dave',   4),
    ('22222222-2222-2222-2222-222222222222', 'PremierPicks_Emma',  5),
    ('33333333-3333-3333-3333-333333333333', 'GoalGuru_Alex',      6),
    ('44444444-4444-4444-4444-444444444444', 'ScoreMaster_Sam',    7),
    ('55555555-5555-5555-5555-555555555555', 'PredictorPro_Ian',   8),
]

# All completed matches (weeks 1-5) with real scores
MATCHES = [
    # Week 1
    ('c62c05e6-5bec-46da-95ab-58f8f3aaf908', 2, 1),
    ('62af7dd5-84af-454f-a0ab-c5f175d7a177', 2, 2),
    ('932b1512-1b84-4d68-8fb9-577619dd5b8c', 1, 0),
    ('311b264b-499d-4181-abc0-c5c122240b59', 0, 2),
    ('9329972e-f084-466d-9935-ca0d4a579f86', 0, 1),
    ('cd1b2283-4b8a-4bf3-bd5d-cea3f4aac478', 1, 0),
    ('75cc3cb2-6a76-47bb-be44-16859c98d9cf', 3, 1),
    ('075a951e-8313-4d6a-b33b-44ad0d671715', 1, 2),
    ('b5ad6ef5-9547-4476-9b2e-1634c71e986d', 3, 1),
    ('abd1e6ca-8dac-4947-8fcb-8c451bd20c3c', 1, 3),
    # Week 2
    ('da7e87e1-cd1c-4a13-8e35-0acf2df7a0be', 1, 1),
    ('e0947679-4317-4a60-9ec1-21c0e48c3cbd', 0, 2),
    ('0e54a3d0-8b65-4fdb-a24f-aad325ed7188', 2, 0),
    ('14f2c080-fb64-4993-a5d8-0a50cd8c4c55', 1, 0),
    ('6514f72e-c3b8-412e-a902-f432b5735bff', 4, 1),
    ('4039bc50-5a91-48e4-ad09-bf6ae1b27abd', 1, 1),
    ('f52bdd34-fb66-473c-aa31-a014cc2c46c2', 2, 3),
    ('b1d76ee1-e11a-4949-ae29-f9197012d8ca', 2, 2),
    ('068d45e7-c2cb-4293-bf6f-de4193b50c3f', 3, 2),
    ('efcf196e-d9ed-4e7a-9fdd-a8b01c9bce5d', 3, 0),
    # Week 3
    ('0e8664e7-ac2f-4cf2-a01c-ac18a82d62c5', 1, 2),
    ('1875237c-7bfa-4a71-96e9-f58da26d37d5', 2, 2),
    ('44a236c0-b99e-49bb-bbff-7d8fdb0de8b5', 1, 1),
    ('0256e211-a36b-4f16-b540-2577bfeca658', 2, 1),
    ('21e391d1-d876-4869-86a9-de316aee907c', 3, 0),
    ('c62d3b72-46dc-472a-83ea-a0dcff8ca77c', 1, 2),
    ('1649a8e1-be97-4648-b827-d886d98ab22f', 0, 1),
    ('5325d35d-ffbc-4006-8358-4a2d4c00810c', 1, 0),
    ('f2ef3c0f-6fdd-44ad-b4e3-980bf6f82a04', 2, 0),
    ('225f0f05-ae5f-47e6-9544-29851b6cb9ab', 1, 1),
    # Week 4
    ('ef8b5da2-3d54-40bd-9f73-c37fc8f4b260', 2, 2),
    ('26532f9e-252a-40ad-b52b-9f461d04261c', 3, 0),
    ('11f5c941-853e-4dc3-8f73-6896fe9ec641', 2, 1),
    ('028e458c-7f03-4b9f-a8a2-75089dcc5b31', 2, 0),
    ('a4c799af-28d4-4ca1-bbf9-e5e17b76e33a', 0, 1),
    ('9c9e25a2-9902-4d91-a198-6253428a9df4', 2, 0),
    ('19b3244a-1d6e-4653-b40a-7ad976cb4805', 1, 1),
    ('45c8f24b-a7cb-4267-aae6-c1f00d74a555', 0, 2),
    ('3d7c563a-770b-4d0c-ad03-0e4a6f6b39c5', 1, 2),
    ('a8aa347e-d3ee-4768-ba6d-36ae63876a1b', 1, 3),
    # Week 5
    ('d817ceea-c79f-40cb-af49-c2a811c65ab0', 3, 0),
    ('d6af76fd-dff2-4356-a099-bc9f979f5f82', 1, 1),
    ('3f4f1042-ec80-40e5-9867-7d7bd92cb082', 2, 1),
    ('1e0b9f55-fba5-4e8c-ae2c-8edd19488044', 2, 0),
    ('55797643-1511-4871-9d24-3c32b290ff82', 1, 2),
    ('06fab1fd-37c5-44c2-8060-f16e84f01e37', 2, 2),
    ('f396860b-00db-4439-944a-926bcb92bb9a', 1, 0),
    ('c1ba2081-adf7-470e-b42a-0e81e88a8ce7', 2, 0),
    ('2cd28d0c-d02d-495b-9d6f-16dddc7163bd', 1, 1),
    ('6fe4a719-ccdb-40cb-a597-25034b38a303', 0, 0),
]

def prng(seed_str, offset=0):
    """Deterministic pseudo-random from string seed."""
    h = hashlib.sha256(f"{seed_str}_{offset}".encode()).digest()
    return (h[0] * 256 + h[1]) / 65535

def make_prediction(user_idx, match_id, actual_home, actual_away):
    """Generate a plausible prediction with some variance from actual score."""
    seed = f"{user_idx}_{match_id}"
    r1 = prng(seed, 0)
    r2 = prng(seed, 1)
    r3 = prng(seed, 2)  # variance factor

    # Each user has a home/away bias that shifts predictions somewhat
    home_biases = [0, 1, -1, 2, 0, 1, -1, 0]
    away_biases = [0, 0, 1, -1, 1, 0, 1, -1]

    var = int(r3 * 2)  # 0-1 variance up or down

    home = actual_home + home_biases[user_idx % 8] + (0 if r1 < 0.5 else var)
    away = actual_away + away_biases[user_idx % 8] + (0 if r2 < 0.5 else var)
    home = max(0, min(6, round(home)))
    away = max(0, min(6, round(away)))
    return home, away

def score_prediction(pred_home, pred_away, actual_home, actual_away):
    exact = pred_home == actual_home and pred_away == actual_away
    if exact:
        return 3, True, True
    if actual_home > actual_away:
        pred_result = 'H' if pred_home > pred_away else ('D' if pred_home == pred_away else 'A')
        actual_result = 'H'
    elif actual_home == actual_away:
        pred_result = 'D' if pred_home == actual_away else ('H' if pred_home > pred_away else 'A')
        actual_result = 'D'
    else:
        pred_result = 'A' if pred_home < actual_away else ('D' if pred_home == actual_away else 'H')
        actual_result = 'A'
    correct = pred_result == actual_result
    return 1 if correct else 0, exact, correct

lines = []
lines.append("-- ============================================================")
lines.append("-- 012_seed_predictions.sql")
lines.append("-- Seeds predictions for all 8 users (real + fake) across weeks 1-5")
lines.append("-- Run in Supabase SQL Editor")
lines.append("-- ============================================================")
lines.append("")
lines.append("BEGIN;")
lines.append("")
lines.append("-- Clear any existing predictions for these users/matches to avoid conflicts")
lines.append("DELETE FROM predictions WHERE user_id IN (")
for i, (uid, name, _) in enumerate(USERS):
    lines.append(f"  '{uid}'{',' if i < len(USERS)-1 else ''}")
lines.append(");")
lines.append("")

count = 0
for match_id, actual_home, actual_away in MATCHES:
    for uid, name, idx in USERS:
        pred_home, pred_away = make_prediction(idx, match_id, actual_home, actual_away)
        pts, exact, correct = score_prediction(pred_home, pred_away, actual_home, actual_away)
        scored_at = "NOW()" if pts > 0 else "NULL"
        lines.append(
            f"INSERT INTO predictions (user_id, match_id, home_prediction, away_prediction, "
            f"points_awarded, is_exact_score, is_correct_result, scored_at) VALUES ("
            f"'{uid}', '{match_id}', {pred_home}, {pred_away}, {pts}, {str(exact).lower()}, "
            f"{str(correct).lower()}, {scored_at});"
        )
        count += 1

lines.append("")
lines.append("COMMIT;")
lines.append(f"-- Total: {len(MATCHES)} matches × {len(USERS)} users = {count} predictions")

print("\n".join(lines))
