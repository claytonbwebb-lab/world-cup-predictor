import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const FROM_EMAIL = 'Play Predict Win <noreply@playpredictwin.com>';

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

export async function GET(request: Request) {
  // Manual trigger for testing - same logic as POST, supports ?dryRun=true
  const url = new URL(request.url);
  return POST(new Request('http://localhost?' + url.searchParams.toString()));
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const dryRun = url.searchParams.get('dryRun') === 'true';
  const testEmail = url.searchParams.get('testEmail') || null;
  console.log('[reminder-emails] Cron triggered at', new Date().toISOString(), dryRun ? '(DRY RUN)' : '');
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
      (m, i) =>
        `<div style="padding:12px 16px;border-bottom:${i < tomorrowMatches.length - 1 ? '1px solid #1e293b' : 'none'};">
          <span style="color:#f8fafc;font-size:14px;font-weight:600;">${m.home_team} vs ${m.away_team}</span><br/>
          <span style="color:#64748b;font-size:12px;">${formatKickoff(m.kickoff_at)} &nbsp;·&nbsp; ${m.group_stage ?? 'Match'}</span>
        </div>`
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

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://playpredictwin.com" style="text-decoration:none;">
        <img src="https://www.playpredictwin.com/images/logos/logo3.jpg"
             alt="Play Predict Win" width="200"
             style="max-width:200px;height:auto;border-radius:10px;display:block;margin:0 auto;"/>
      </a>
    </div>

    <!-- Card -->
    <div style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">

      <!-- Green header bar -->
      <div style="background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);padding:28px 32px;">
        <h1 style="margin:0 0 8px;color:#ffffff;font-size:22px;font-weight:800;line-height:1.3;">
          ⚽ Matches tomorrow — are your predictions in?
        </h1>
        <p style="margin:0;color:#bbf7d0;font-size:14px;">
          ${predictedCount > 0 ? `You've predicted ${predictedCount} of ${totalCount} matches.` : "You haven't predicted any matches yet."} Don't miss out on points!
        </p>
      </div>

      <!-- Body -->
      <div style="padding:28px 32px;">

        <!-- Fixtures -->
        <p style="margin:0 0 12px;color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
          Tomorrow's fixtures — ${totalCount} match${totalCount > 1 ? 'es' : ''}
        </p>
        <div style="background:#0f172a;border-radius:10px;overflow:hidden;margin-bottom:28px;border:1px solid #334155;">
          ${matchesListHtml}
        </div>

        <!-- CTA button -->
        <div style="text-align:center;margin-bottom:24px;">
          <a href="https://playpredictwin.com/dashboard"
             style="display:inline-block;background:#22c55e;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 36px;border-radius:10px;">
            Submit Your Predictions →
          </a>
        </div>

        <p style="margin:0;font-size:13px;color:#64748b;text-align:center;line-height:1.6;">
          +3 pts for exact score &nbsp;·&nbsp; +1 pt for correct result<br/>
          Predictions lock at kickoff — get yours in first!
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px 0 8px;font-size:12px;color:#475569;">
      © Play Predict Win · World Cup 2026<br/>
      <a href="https://playpredictwin.com/dashboard" style="color:#475569;text-decoration:underline;">Manage preferences</a>
    </div>

  </div>
</body>
</html>`;

      try {
        if (testEmail && user.email !== testEmail) {
          return { userId: user.id, sent: false, reason: 'test-mode-skipped' };
        }
        if (dryRun) {
          console.log(`[reminder-emails] 🧪 DRY RUN — would send to ${user.email} (${user.username}) — ${predictedCount === 0 ? 'no predictions' : `${predictedCount}/${totalCount} predicted`}`);
          return { userId: user.id, email: user.email, sent: false, reason: 'dry-run', subject };
        }
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
