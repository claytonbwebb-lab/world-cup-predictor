import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://suyrbsuuckcvhdvxcvsf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1eXJic3V1Y2tjdmhkdnhjdnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1MzgwNSwiZXhwIjoyMDkwNTI5ODA1fQ.L-ex1VZWkNd7f_-T6D1D0RiYmLR0HdoRA2QsYmB4NLc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const fixes = [
  { from: 'Leeds', to: 'Leeds United' },
  { from: 'Coventry', to: 'Coventry City' },
  { from: 'Hull', to: 'Hull City' },
  { from: 'Ipswich', to: 'Ipswich Town' },
  { from: 'Newcastle', to: 'Newcastle United' },
  { from: 'Nottm Forest', to: 'Nottingham Forest' },
  { from: 'Man City', to: 'Manchester City' },
  { from: 'Man Utd', to: 'Manchester United' },
  { from: 'Tottenham', to: 'Tottenham Hotspur' },
  { from: 'Brighton', to: 'Brighton & Hove Albion' },
];

async function fixTeamNames() {
  for (const fix of fixes) {
    // Update home_team for non-visible matches
    const { data: homeData, error: homeErr } = await supabase
      .from('matches')
      .update({ home_team: fix.to })
      .eq('home_team', fix.from)
      .eq('is_visible', false)
      .select('id');
    
    // Update away_team for non-visible matches
    const { data: awayData, error: awayErr } = await supabase
      .from('matches')
      .update({ away_team: fix.to })
      .eq('away_team', fix.from)
      .eq('is_visible', false)
      .select('id');
    
    const homeCount = homeData?.length ?? 0;
    const awayCount = awayData?.length ?? 0;
    
    if (homeErr || awayErr) {
      console.error(`Error fixing ${fix.from}:`, homeErr || awayErr);
    } else {
      console.log(`Fixed ${fix.from} → ${fix.to}: ${homeCount} home, ${awayCount} away`);
    }
  }
}

fixTeamNames().then(() => console.log('Done')).catch(console.error);
