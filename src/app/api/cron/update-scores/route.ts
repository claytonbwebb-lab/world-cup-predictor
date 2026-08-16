import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY!;
const API_FOOTBALL_HOST = 'v3.football.api-sports.io';
const FROM_EMAIL = 'Play Predict Win <noreply@playpredictwin.com>';
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const ADMIN_EMAIL = 'steve.males@gmail.com';

// How long after kickoff to wait before fetching scores
const KO_GRACE_MINS = 135; // 2h 15m
// Retry interval in minutes
const RETRY_INTERVAL_MINS = 15;
// Max retries before alerting
const MAX_RETRIES = 3;

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function fetchLiveScore(homeTeam: string, awayTeam: string, date: string): Promise<{ homeScore: number; awayScore: number } | null> {
  const url = `https://${API_FOOTBALL_HOST}/fixtures?date=${date}&league=39&season=2026`;
  const res = await fetch(url, {
    headers: { 'x-apisports-key': API_FOOTBALL_KEY },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const fixtures = data.response || [];

  for (const f of fixtures) {
    const h = f.teams.home.name.toLowerCase();
    const a = f.teams.away.name.toLowerCase();
    const hn = homeTeam.toLowerCase();
    const an = awayTeam.toLowerCase();
    if ((h.includes(hn) || hn.includes(h)) && (a.includes(an) || an.includes(a))) {
      const hs = f.goals?.home ?? f.score?.fulltime?.home;
      const as = f.goals?.away ?? f.score?.fulltime?.away;
      if (hs !== null && hs !== undefined && as !== null && as !== undefined) {
        return { homeScore: hs, awayScore: as };
      }
    }
  }
  return null;
}

async function sendAlertEmail(matchInfo: string, error: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `⚠️ Score update failed: ${matchInfo}`,
      html: `<p>Failed to fetch score for <strong>${matchInfo}</strong> after ${MAX_RETRIES} attempts.</p><p>Last error: ${error}</p><p>Manual check needed at <a href="https://www.playpredictwin.com/admin">/admin</a></p>`,
    }),
  });
  return res.ok;
}

export async function POST() {
  const supabase = createSupabaseClient();

  // Find matches that:
  // - Have kicked off KO_GRACE_MINS ago or more
  // - Don't have a result entered yet
  // - Haven't been retried more than MAX_RETRIES times already
  const cutoff = new Date(Date.now() - KO_GRACE_MINS * 60 * 1000).toISOString();
  const retryCutoff = new Date(Date.now() - RETRY_INTERVAL_MINS * 60 * 1000).toISOString();

  const { data: matches } = await supabase
    .from('matches')
    .select('id, home_team, away_team, kickoff_at, retry_count')
    .eq('result_entered', false)
    .is('home_score', null)
    .lt('kickoff_at', cutoff)
    .or(`retry_count.is.null,retry_count.lt.${MAX_RETRIES}`)
    .order('kickoff_at', { ascending: true });

  if (!matches || matches.length === 0) {
    return NextResponse.json({ ok: true, message: 'No matches need score updates' });
  }

  console.log(`[update-scores] Checking ${matches.length} matches for scores...`);

  const results = { updated: 0, retried: 0, failed: 0, alerts: 0 };

  for (const match of matches) {
    // Check if enough time has passed since last retry
    const lastRetry = match.retry_count > 0 ? retryCutoff : null;
    // Simple: always try if retry_count < MAX_RETRIES

    const date = match.kickoff_at.slice(0, 10);
    const score = await fetchLiveScore(match.home_team, match.away_team, date);
    const matchInfo = `${match.home_team} vs ${match.away_team} (${date})`;

    if (score) {
      // Score found — update the match
      const { error } = await supabase
        .from('matches')
        .update({
          home_score: score.homeScore,
          away_score: score.awayScore,
          result_entered: true,
          is_locked: true,
          retry_count: 0,
        })
        .eq('id', match.id);

      if (error) {
        console.error(`[update-scores] DB update error for ${matchInfo}:`, error);
      } else {
        console.log(`[update-scores] ✅ Scored: ${matchInfo} => ${score.homeScore}-${score.awayScore}`);
        results.updated++;
      }
    } else {
      // No score yet — increment retry count
      const newRetryCount = (match.retry_count || 0) + 1;

      if (newRetryCount >= MAX_RETRIES) {
        console.warn(`[update-scores] ❌ All retries exhausted for ${matchInfo}`);
        await sendAlertEmail(matchInfo, 'No score returned after all retries');
        results.alerts++;
      } else {
        console.log(`[update-scores] ⏳ No score yet for ${matchInfo} (retry ${newRetryCount}/${MAX_RETRIES})`);
      }

      await supabase
        .from('matches')
        .update({ retry_count: newRetryCount })
        .eq('id', match.id);

      results.retried++;
    }
  }

  console.log(`[update-scores] Done. updated=${results.updated} retried=${results.retried} failed=${results.failed} alerts=${results.alerts}`);

  return NextResponse.json({
    ok: true,
    checked: matches.length,
    ...results,
  });
}
