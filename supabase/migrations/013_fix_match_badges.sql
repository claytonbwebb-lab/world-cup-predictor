-- Migration: 013_fix_match_badges
-- Updates all match records to use correct badge image URLs instead of 🏴 emoji flags
-- Run in Supabase SQL Editor

UPDATE matches SET home_flag = CASE home_team
  WHEN 'Arsenal'              THEN '/badges/arsenal.png'
  WHEN 'Aston Villa'          THEN '/badges/aston_villa.png'
  WHEN 'Bournemouth'          THEN '/badges/bournemouth.png'
  WHEN 'Brentford'            THEN '/badges/brentford.png'
  WHEN 'Brighton'             THEN '/badges/brighton.png'
  WHEN 'Chelsea'              THEN '/badges/chelsea.png'
  WHEN 'Crystal Palace'       THEN '/badges/crystal_palace.png'
  WHEN 'Everton'              THEN '/badges/everton.png'
  WHEN 'Fulham'               THEN '/badges/fulham.png'
  WHEN 'Ipswich Town'         THEN '/badges/ipswich_town.png'
  WHEN 'Leicester City'       THEN '/badges/leicester_city.png'
  WHEN 'Liverpool'            THEN '/badges/liverpool.png'
  WHEN 'Manchester City'      THEN '/badges/manchester_city.png'
  WHEN 'Manchester United'    THEN '/badges/manchester_united.png'
  WHEN 'Newcastle United'     THEN '/badges/newcastle_united.png'
  WHEN 'Nottingham Forest'    THEN '/badges/nottingham_forest.png'
  WHEN 'Southampton'          THEN '/badges/southampton.png'
  WHEN 'Tottenham Hotspur'    THEN '/badges/tottenham_hotspur.png'
  WHEN 'West Ham United'      THEN '/badges/west_ham_united.png'
  WHEN 'Wolverhampton'        THEN '/badges/wolverhampton.png'
  WHEN 'Wolverhampton Wanderers' THEN '/badges/wolverhampton.png'
  ELSE home_flag
END;

UPDATE matches SET away_flag = CASE away_team
  WHEN 'Arsenal'              THEN '/badges/arsenal.png'
  WHEN 'Aston Villa'          THEN '/badges/aston_villa.png'
  WHEN 'Bournemouth'          THEN '/badges/bournemouth.png'
  WHEN 'Brentford'            THEN '/badges/brentford.png'
  WHEN 'Brighton'             THEN '/badges/brighton.png'
  WHEN 'Chelsea'              THEN '/badges/chelsea.png'
  WHEN 'Crystal Palace'       THEN '/badges/crystal_palace.png'
  WHEN 'Everton'              THEN '/badges/everton.png'
  WHEN 'Fulham'               THEN '/badges/fulham.png'
  WHEN 'Ipswich Town'         THEN '/badges/ipswich_town.png'
  WHEN 'Leicester City'       THEN '/badges/leicester_city.png'
  WHEN 'Liverpool'            THEN '/badges/liverpool.png'
  WHEN 'Manchester City'      THEN '/badges/manchester_city.png'
  WHEN 'Manchester United'     THEN '/badges/manchester_united.png'
  WHEN 'Newcastle United'     THEN '/badges/newcastle_united.png'
  WHEN 'Nottingham Forest'    THEN '/badges/nottingham_forest.png'
  WHEN 'Southampton'          THEN '/badges/southampton.png'
  WHEN 'Tottenham Hotspur'    THEN '/badges/tottenham_hotspur.png'
  WHEN 'West Ham United'      THEN '/badges/west_ham_united.png'
  WHEN 'Wolverhampton'        THEN '/badges/wolverhampton.png'
  WHEN 'Wolverhampton Wanderers' THEN '/badges/wolverhampton.png'
  ELSE away_flag
END;
