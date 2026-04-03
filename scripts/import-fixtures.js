#!/usr/bin/env node
/**
 * Import World Cup 2026 fixtures from openfootball/github API to Supabase
 * Run: node scripts/import-fixtures.js
 */

const SUPABASE_URL = 'https://suyrbsuuckcvhdvxcvsf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oziD4SL0MCAYQgmFXlM5Rg_0chMS38t'; // anon key

const API_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

// Team to flag emoji mapping
const FLAG_MAP = {
  'Mexico': '🇲🇽', 'South Africa': '🇿🇦', 'South Korea': '🇰🇷', 'Czech Republic': '🇨🇿',
  'Canada': '🇨🇦', 'Bosnia & Herzegovina': '🇧🇦', 'Qatar': '🇶🇦', 'Switzerland': '🇨🇭',
  'Brazil': '🇧🇷', 'Morocco': '🇲🇦', 'Haiti': '🇭🇹', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'USA': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Turkey': '🇹🇷',
  'Germany': '🇩🇪', 'Curaçao': '🇨🇼', 'Ivory Coast': '🇨🇮', 'Ecuador': '🇪🇨',
  'Netherlands': '🇳🇱', 'Japan': '🇯🇵', 'Sweden': '🇸🇪', 'Tunisia': '🇹🇳',
  'Belgium': '🇧🇪', 'Egypt': '🇪🇬', 'Iran': '🇮🇷', 'New Zealand': '🇳🇿',
  'Spain': '🇪🇸', 'Cape Verde': '🇨🇻', 'Saudi Arabia': '🇸🇦', 'Uruguay': '🇺🇾',
  'France': '🇫🇷', 'Senegal': '🇸🇳', 'Iraq': '🇮🇶', 'Norway': '🇳🇴',
  'Argentina': '🇦🇷', 'Algeria': '🇩🇿', 'Austria': '🇦🇹', 'Jordan': '🇯🇴',
  'Portugal': '🇵🇹', 'DR Congo': '🇨🇩', 'Uzbekistan': '🇺🇿', 'Colombia': '🇨🇴',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Ghana': '🇬🇭', 'Panama': '🇵🇦', 'Croatia': '🇭🇷'
};

function parseKickoff(date, time) {
  // Parse "2026-06-11" and "13:00 UTC-6"
  const [year, month, day] = date.split('-').map(Number);
  const timeMatch = time.match(/(\d+):(\d+)\s*UTC([+-]\d+)/);
  if (!timeMatch) return null;
  
  const [, hour, minute, offset] = timeMatch;
  const utcHour = parseInt(hour) + parseInt(offset);
  
  return new Date(Date.UTC(year, month - 1, day, utcHour, parseInt(minute))).toISOString();
}

async function importFixtures() {
  console.log('Fetching fixtures from API...');
  const response = await fetch(API_URL);
  const data = await response.json();
  
  const matches = data.matches.filter(m => m.group && m.group.startsWith('Group'));
  console.log(`Found ${matches.length} group stage matches`);
  
  // Clear existing fixtures
  console.log('Clearing existing fixtures...');
  await fetch(`${SUPABASE_URL}/rest/v1/matches?group=not.is.null`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal'
    }
  });
  
  // Insert new fixtures
  console.log('Inserting new fixtures...');
  const toInsert = matches.map(m => ({
    home_team: m.team1,
    away_team: m.team2,
    home_flag: FLAG_MAP[m.team1] || null,
    away_flag: FLAG_MAP[m.team2] || null,
    group_stage: m.group,
    kickoff_at: parseKickoff(m.date, m.time)
  }));
  
  const chunkSize = 50;
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/matches`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(chunk)
    });
    
    if (!res.ok) {
      const err = await res.text();
      console.error(`Error inserting chunk ${i/chunkSize + 1}:`, err);
    } else {
      console.log(`Inserted ${chunk.length} matches (${i + chunk.length}/${toInsert.length})`);
    }
  }
  
  console.log('Done! ✓');
}

importFixtures().catch(console.error);