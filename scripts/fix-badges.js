const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hcqdgbmzizunjxynhaoz.supabase.co',
  process.env.SERVICE_ROLE_KEY
);

const BADGES = {
  'Manchester United':   '/badges/manchester_united.png',
  'Manchester City':     '/badges/manchester_city.png',
  'Liverpool':           '/badges/liverpool.png',
  'Arsenal':             '/badges/arsenal.png',
  'Chelsea':             '/badges/chelsea.png',
  'Tottenham Hotspur':   '/badges/tottenham_hotspur.png',
  'Wolverhampton':       '/badges/wolverhampton.png',
  'Fulham':              '/badges/fulham.png',
  'Brighton':            '/badges/brighton.png',
  'Aston Villa':         '/badges/aston_villa.png',
  'Everton':             '/badges/everton.png',
  'AFC Bournemouth':     '/badges/bournemouth.png',
  'Newcastle United':    '/badges/newcastle_united.png',
  'Southampton':         '/badges/southampton.png',
  'Nottingham Forest':   '/badges/nottingham_forest.png',
  'Crystal Palace':      '/badges/crystal_palace.png',
  'West Ham United':     '/badges/west_ham_united.png',
  'Leicester City':      '/badges/leicester_city.png',
  'Ipswich Town':        '/badges/ipswich_town.png',
  'Brentford':           '/badges/brentford.png',
};

async function fixBadges() {
  console.log('Fetching all matches...');
  const { data, error } = await supabase.from('matches').select('id, home_team, away_team');
  if (error) { console.error(error); return; }
  console.log(`Found ${data.length} matches — updating badge URLs...`);

  let updated = 0;
  for (const m of data) {
    const homeBadge = BADGES[m.home_team];
    const awayBadge = BADGES[m.away_team];
    if (homeBadge && awayBadge) {
      await supabase.from('matches').update({ home_flag: homeBadge, away_flag: awayBadge }).eq('id', m.id);
      updated++;
    } else {
      console.log(`  No badge mapping for: ${m.home_team} / ${m.away_team}`);
    }
  }
  console.log(`\n✅ Updated ${updated} matches with club badge URLs`);
}

fixBadges().catch(console.error);