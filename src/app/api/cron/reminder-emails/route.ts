import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const FROM_EMAIL = 'World Cup Predictor <noreply@playpredictwin.com>';

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
  return new Resend(process.env.RESEND_API_KEY);
}

function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  // Manual trigger for testing - same logic as POST
  return POST(new Request('http://localhost'));
}

export async function POST(request: Request) {
  console.log('[reminder-emails] Cron triggered at', new Date().toISOString());
  console.log('[reminder-emails] RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);
  console.log('[reminder-emails] SUPABASE_SERVICE_ROLE_KEY set:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('[reminder-emails] NEXT_PUBLIC_SUPABASE_URL set:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);

  const supabase = createServerClient();

  // ── Step 1: Find all matches kicking off tomorrow (UK midnight to midnight) ──
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setUTCHours(23, 59, 59, 999);

  console.log('[reminder-emails] Querying matches between', tomorrow.toISOString(), 'and', tomorrowEnd.toISOString());

  const { data: tomorrowMatches, error: matchesError } = await supabase
    .from('matches')
    .select('id, home_team, away_team, kickoff_at, group_stage')
    .gte('kickoff_at', tomorrow.toISOString())
    .lte('kickoff_at', tomorrowEnd.toISOString())
    .order('kickoff_at', { ascending: true });

  if (matchesError) {
    console.error('[reminder-emails] ❌ Failed to fetch matches:', matchesError);
    return NextResponse.json({ error: 'Database error', detail: matchesError.message }, { status: 500 });
  }

  if (!tomorrowMatches || tomorrowMatches.length === 0) {
    console.log('[reminder-emails] ✅ No matches tomorrow — skipping');
    return NextResponse.json({ message: 'No matches tomorrow — skipping', sent: 0 });
  }

  console.log(`[reminder-emails] ✅ Found ${tomorrowMatches.length} matches tomorrow:`, tomorrowMatches.map(m => `${m.home_team} vs ${m.away_team}`));

  const tomorrowMatchIds = tomorrowMatches.map((m) => m.id);

  // ── Step 2: Find all users with an email address ──
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, username, email')
    .not('email', 'is', null)
    .neq('email', '');

  if (usersError) {
    console.error('[reminder-emails] ❌ Failed to fetch users:', usersError);
    return NextResponse.json({ error: 'Database error', detail: usersError.message }, { status: 500 });
  }

  console.log(`[reminder-emails] ✅ Found ${users?.length ?? 0} users with emails`);

  // ── Step 3: Fetch all predictions for tomorrow's matches ──
  const { data: predictions, error: predError } = await supabase
    .from('predictions')
    .select('user_id, match_id')
    .in('match_id', tomorrowMatchIds);

  if (predError) {
    console.error('[reminder-emails] ❌ Failed to fetch predictions:', predError);
    return NextResponse.json({ error: 'Database error', detail: predError.message }, { status: 500 });
  }

  console.log(`[reminder-emails] ✅ Found ${predictions?.length ?? 0} predictions for tomorrow's matches`);

  // Build a Set of "user → predicted matchIds" for O(1) lookup
  const userPredictedMap = new Map<string, Set<string>>();
  for (const pred of predictions ?? []) {
    if (!userPredictedMap.has(pred.user_id)) {
      userPredictedMap.set(pred.user_id, new Set());
    }
    userPredictedMap.get(pred.user_id)!.add(pred.match_id);
  }

  // ── Step 4: For each user, check if they're missing any prediction ──
  const matchesListHtml = tomorrowMatches
    .map(
      (m) =>
        `<li><strong>${m.home_team} vs ${m.away_team}</strong> — ${formatKickoff(m.kickoff_at)} (${m.group_stage ?? 'Match'})</li>`
    )
    .join('');

  const results = await Promise.allSettled(
    (users ?? []).map(async (user) => {
      const predicted = userPredictedMap.get(user.id) ?? new Set();
      const missing = tomorrowMatchIds.filter((id) => !predicted.has(id));

      if (missing.length === 0) {
        console.log(`[reminder-emails] ⏭️ ${user.email} — all predicted, skipping`);
        return { userId: user.id, sent: false, reason: 'all-predicted' };
      }

      const predictedCount = tomorrowMatchIds.length - missing.length;
      const totalCount = tomorrowMatches.length;
      const subject =
        predictedCount === 0
          ? 'World Cup predictions due — you haven\'t predicted any matches for tomorrow!'
          : `World Cup predictions reminder — ${predictedCount}/${totalCount} matches predicted`;

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 24px; font-weight: 900; color: #fbbf24; text-decoration: none; }
    .h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 8px; }
    .subtitle { color: #94a3b8; font-size: 14px; margin: 0; }
    .matches { background: #0f172a; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .matches ul { margin: 0; padding: 0 0 0 20px; }
    .matches li { color: #fbbf24; font-size: 15px; padding: 6px 0; border-bottom: 1px solid #1e293b; }
    .matches li:last-child { border-bottom: none; }
    .btn { display: inline-block; background: #fbbf24; color: #0f172a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 16px 0; }
    .footer { text-align: center; font-size: 12px; color: #475569; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <a href="https://playpredictwin.com" class="logo">⚽ PlayPredictWin</a>
      </div>
      <h1 class="h1">Matches are coming — are your predictions in?</h1>
      <p class="subtitle">
        You've submitted ${predictedCount > 0 ? `predictions for ${predictedCount} of ${totalCount} matches` : 'no predictions yet'} for tomorrow's fixtures. Submit your predictions before kickoff to earn points!
      </p>
      <div class="matches">
        <strong style="color:#e2e8f0; font-size:13px; display:block; margin-bottom:12px;">
          TOMORROW'S FIXTURES — ${totalCount} match${totalCount > 1 ? 'es' : ''}
        </strong>
        <ul>${matchesListHtml}</ul>
      </div>
      <a href="https://playpredictwin.com/predictions" class="btn">Submit Your Predictions →</a>
      <p style="font-size:13px; color:#94a3b8; margin:0;">
        You received this because you have an account on PlayPredictWin and have outstanding predictions for tomorrow's World Cup matches.
      </p>
    </div>
    <div class="footer">
      © PlayPredictWin · World Cup 2026<br/>
      <a href="https://playpredictwin.com/settings" style="color:#475569;">Unsubscribe from reminder emails</a>
    </div>
  </div>
</body>
</html>`;

      try {
        console.log(`[reminder-emails] 📧 Sending email to ${user.email} (${user.username}) — ${predictedCount === 0 ? 'no predictions' : `${predictedCount}/${totalCount} predicted`}`);
        await getResend().emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject,
          html,
        });
        console.log(`[reminder-emails] ✅ Email sent to ${user.email}`);
        return { userId: user.id, sent: true };
      } catch (err) {
        console.error(`[reminder-emails] ❌ Failed to send to ${user.email}:`, err);
        return { userId: user.id, sent: false, reason: 'send-error' };
      }
    })
  );

  const sent = results.filter((r) => r.status === 'fulfilled' && r.value.sent).length;
  const failed = results.filter((r) => r.status === 'rejected' || !r.value.sent).length;

  console.log(`[reminder-emails] 📊 Done — sent: ${sent}, skipped/failed: ${failed}`);

  return NextResponse.json({
    message: `Reminder emails processed`,
    matchesTomorrow: tomorrowMatches.length,
    emailsSent: sent,
    skipped: failed,
  });
}

function formatKickoff(utcStr: string): string {
  const d = new Date(utcStr);
  return d.toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}
