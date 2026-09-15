-- UEFA Nations League fixtures — PPW Week 6 (22-28 Sep 2026)
-- Inserted with is_visible=false so NOT live — Steve reviews at /admin before pushing
-- To push live: UPDATE matches SET is_visible=true WHERE group_stage LIKE 'UEFA Nations League%' AND kickoff_at >= '2026-09-22';

BEGIN;

INSERT INTO matches (home_team, away_team, home_flag, away_flag, group_stage, kickoff_at, week_number, is_visible, is_locked, result_entered) VALUES
-- Matchday 1 (22-23 Sep)
('Serbia', 'Greece', 'https://media.api-sports.io/flags/1990.svg', 'https://media.api-sports.io/flags/1991.svg', 'UEFA Nations League - Matchday 1', '2026-09-24T18:45:00+00:00', 7, false, false, false),
('Portugal', 'Wales', 'https://media.api-sports.io/flags/1992.svg', 'https://media.api-sports.io/flags/1993.svg', 'UEFA Nations League - Matchday 1', '2026-09-24T18:45:00+00:00', 7, false, false, false),
('Austria', 'Israel', 'https://media.api-sports.io/flags/1994.svg', 'https://media.api-sports.io/flags/1995.svg', 'UEFA Nations League - Matchday 1', '2026-09-24T18:45:00+00:00', 7, false, false, false),
('Norway', 'Denmark', 'https://media.api-sports.io/flags/1996.svg', 'https://media.api-sports.io/flags/1997.svg', 'UEFA Nations League - Matchday 1', '2026-09-24T18:45:00+00:00', 7, false, false, false),
('Liechtenstein', 'Lithuania', 'https://media.api-sports.io/flags/1998.svg', 'https://media.api-sports.io/flags/1999.svg', 'UEFA Nations League - Matchday 1', '2026-09-24T18:45:00+00:00', 7, false, false, false),
('Andorra', 'Malta', 'https://media.api-sports.io/flags/2000.svg', 'https://media.api-sports.io/flags/2001.svg', 'UEFA Nations League - Matchday 1', '2026-09-24T18:45:00+00:00', 7, false, false, false),
('Kosovo', 'Republic of Ireland', 'https://media.api-sports.io/flags/2002.svg', 'https://media.api-sports.io/flags/2003.svg', 'UEFA Nations League - Matchday 1', '2026-09-24T18:45:00+00:00', 7, false, false, false),
('Netherlands', 'Germany', 'https://media.api-sports.io/flags/2004.svg', 'https://media.api-sports.io/flags/2005.svg', 'UEFA Nations League - Matchday 1', '2026-09-24T18:45:00+00:00', 7, false, false, false),
-- Matchday 2 (24-25 Sep)
('Armenia', 'Latvia', 'https://media.api-sports.io/flags/2006.svg', 'https://media.api-sports.io/flags/2007.svg', 'UEFA Nations League - Matchday 2', '2026-09-25T16:00:00+00:00', 7, false, false, false),
('Georgia', 'Northern Ireland', 'https://media.api-sports.io/flags/2008.svg', 'https://media.api-sports.io/flags/2009.svg', 'UEFA Nations League - Matchday 2', '2026-09-25T16:00:00+00:00', 7, false, false, false),
('Sweden', 'Romania', 'https://media.api-sports.io/flags/2010.svg', 'https://media.api-sports.io/flags/2011.svg', 'UEFA Nations League - Matchday 2', '2026-09-25T18:45:00+00:00', 7, false, false, false),
('Poland', 'Bosnia & Herzegovina', 'https://media.api-sports.io/flags/2012.svg', 'https://media.api-sports.io/flags/2013.svg', 'UEFA Nations League - Matchday 2', '2026-09-25T18:45:00+00:00', 7, false, false, false),
('Italy', 'Belgium', 'https://media.api-sports.io/flags/2014.svg', 'https://media.api-sports.io/flags/2015.svg', 'UEFA Nations League - Matchday 2', '2026-09-25T18:45:00+00:00', 7, false, false, false),
('Hungary', 'Ukraine', 'https://media.api-sports.io/flags/2016.svg', 'https://media.api-sports.io/flags/2017.svg', 'UEFA Nations League - Matchday 2', '2026-09-25T18:45:00+00:00', 7, false, false, false),
('Türkiye', 'France', 'https://media.api-sports.io/flags/2018.svg', 'https://media.api-sports.io/flags/2019.svg', 'UEFA Nations League - Matchday 2', '2026-09-25T18:45:00+00:00', 7, false, false, false),
('Montenegro', 'Cyprus', 'https://media.api-sports.io/flags/2020.svg', 'https://media.api-sports.io/flags/2021.svg', 'UEFA Nations League - Matchday 2', '2026-09-25T18:45:00+00:00', 7, false, false, false),
-- Matchday 3 (26 Sep)
('Iceland', 'Estonia', 'https://media.api-sports.io/flags/2022.svg', 'https://media.api-sports.io/flags/2023.svg', 'UEFA Nations League - Matchday 3', '2026-09-26T16:00:00+00:00', 7, false, false, false),
('Faroe Islands', 'Kazakhstan', 'https://media.api-sports.io/flags/2024.svg', 'https://media.api-sports.io/flags/2025.svg', 'UEFA Nations League - Matchday 3', '2026-09-26T16:00:00+00:00', 7, false, false, false),
('Bulgaria', 'Luxembourg', 'https://media.api-sports.io/flags/2026.svg', 'https://media.api-sports.io/flags/2027.svg', 'UEFA Nations League - Matchday 3', '2026-09-26T16:00:00+00:00', 7, false, false, false),
('San Marino', 'Finland', 'https://media.api-sports.io/flags/2028.svg', 'https://media.api-sports.io/flags/2029.svg', 'UEFA Nations League - Matchday 3', '2026-09-26T16:00:00+00:00', 7, false, false, false),
('England', 'Spain', 'https://media.api-sports.io/flags/2030.svg', 'https://media.api-sports.io/flags/2031.svg', 'UEFA Nations League - Matchday 3', '2026-09-26T18:45:00+00:00', 7, false, false, false),
('Czechia', 'Croatia', 'https://media.api-sports.io/flags/2032.svg', 'https://media.api-sports.io/flags/2033.svg', 'UEFA Nations League - Matchday 3', '2026-09-26T18:45:00+00:00', 7, false, false, false),
('Slovakia', 'Moldova', 'https://media.api-sports.io/flags/2034.svg', 'https://media.api-sports.io/flags/2035.svg', 'UEFA Nations League - Matchday 3', '2026-09-26T18:45:00+00:00', 7, false, false, false),
('Albania', 'Belarus', 'https://media.api-sports.io/flags/2036.svg', 'https://media.api-sports.io/flags/2037.svg', 'UEFA Nations League - Matchday 3', '2026-09-26T18:45:00+00:00', 7, false, false, false),
('Slovenia', 'Scotland', 'https://media.api-sports.io/flags/2038.svg', 'https://media.api-sports.io/flags/2039.svg', 'UEFA Nations League - Matchday 3', '2026-09-26T18:45:00+00:00', 7, false, false, false),
('FYR Macedonia', 'Switzerland', 'https://media.api-sports.io/flags/2040.svg', 'https://media.api-sports.io/flags/2041.svg', 'UEFA Nations League - Matchday 3', '2026-09-26T18:45:00+00:00', 7, false, false, false),
-- Matchday 3 continued (27 Sep)
('Lithuania', 'Azerbaijan', 'https://media.api-sports.io/flags/2042.svg', 'https://media.api-sports.io/flags/2043.svg', 'UEFA Nations League - Matchday 3', '2026-09-27T13:00:00+00:00', 7, false, false, false),
('Serbia', 'Netherlands', 'https://media.api-sports.io/flags/1990.svg', 'https://media.api-sports.io/flags/2004.svg', 'UEFA Nations League - Matchday 3', '2026-09-27T16:00:00+00:00', 7, false, false, false),
('Denmark', 'Wales', 'https://media.api-sports.io/flags/1997.svg', 'https://media.api-sports.io/flags/1993.svg', 'UEFA Nations League - Matchday 3', '2026-09-27T16:00:00+00:00', 7, false, false, false),
('Austria', 'Kosovo', 'https://media.api-sports.io/flags/1994.svg', 'https://media.api-sports.io/flags/2002.svg', 'UEFA Nations League - Matchday 3', '2026-09-27T16:00:00+00:00', 7, false, false, false),
('Gibraltar', 'Andorra', 'https://media.api-sports.io/flags/2044.svg', 'https://media.api-sports.io/flags/2000.svg', 'UEFA Nations League - Matchday 3', '2026-09-27T16:00:00+00:00', 7, false, false, false),
('Germany', 'Greece', 'https://media.api-sports.io/flags/2005.svg', 'https://media.api-sports.io/flags/1991.svg', 'UEFA Nations League - Matchday 3', '2026-09-27T18:45:00+00:00', 7, false, false, false),
('Norway', 'Portugal', 'https://media.api-sports.io/flags/1996.svg', 'https://media.api-sports.io/flags/1992.svg', 'UEFA Nations League - Matchday 3', '2026-09-27T18:45:00+00:00', 7, false, false, false),
('Israel', 'Republic of Ireland', 'https://media.api-sports.io/flags/1995.svg', 'https://media.api-sports.io/flags/2003.svg', 'UEFA Nations League - Matchday 3', '2026-09-27T18:45:00+00:00', 7, false, false, false),
-- Matchday 3 continued (28 Sep)
('Armenia', 'Montenegro', 'https://media.api-sports.io/flags/2006.svg', 'https://media.api-sports.io/flags/2020.svg', 'UEFA Nations League - Matchday 3', '2026-09-28T16:00:00+00:00', 7, false, false, false),
('Georgia', 'Ukraine', 'https://media.api-sports.io/flags/2008.svg', 'https://media.api-sports.io/flags/2017.svg', 'UEFA Nations League - Matchday 3', '2026-09-28T16:00:00+00:00', 7, false, false, false),
('Belgium', 'France', 'https://media.api-sports.io/flags/2015.svg', 'https://media.api-sports.io/flags/2019.svg', 'UEFA Nations League - Matchday 3', '2026-09-28T18:45:00+00:00', 7, false, false, false),
('Sweden', 'Poland', 'https://media.api-sports.io/flags/2010.svg', 'https://media.api-sports.io/flags/2012.svg', 'UEFA Nations League - Matchday 3', '2026-09-28T18:45:00+00:00', 7, false, false, false),
('Northern Ireland', 'Hungary', 'https://media.api-sports.io/flags/2009.svg', 'https://media.api-sports.io/flags/2016.svg', 'UEFA Nations League - Matchday 3', '2026-09-28T18:45:00+00:00', 7, false, false, false),
('Romania', 'Bosnia & Herzegovina', 'https://media.api-sports.io/flags/2011.svg', 'https://media.api-sports.io/flags/2013.svg', 'UEFA Nations League - Matchday 3', '2026-09-28T18:45:00+00:00', 7, false, false, false),
('Türkiye', 'Italy', 'https://media.api-sports.io/flags/2018.svg', 'https://media.api-sports.io/flags/2014.svg', 'UEFA Nations League - Matchday 3', '2026-09-28T18:45:00+00:00', 7, false, false, false),
('Latvia', 'Cyprus', 'https://media.api-sports.io/flags/2007.svg', 'https://media.api-sports.io/flags/2021.svg', 'UEFA Nations League - Matchday 3', '2026-09-28T18:45:00+00:00', 7, false, false, false)
ON CONFLICT DO NOTHING;

COMMIT;
