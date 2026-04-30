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
  const url = new URL(request.url);
  return POST(new Request('http://localhost?' + url.searchParams.toString()));
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const dryRun = url.searchParams.get('dryRun') === 'true';
  const testEmail = url.searchParams.get('testEmail') || null;
  console.log('[reminder-emails] Cron triggered at', new Date().toISOString(), dryRun ? '(DRY RUN)' : '');

  const supabase = createServerClient();

  // ── Step 1: Find all matches kicking off tomorrow ──
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setUTCHours(23, 59, 59, 999);

  const { data: tomorrowMatches, error: matchesError } = await supabase
    .from('matches')
    .select('id, home_team, away_team, kickoff_at, group_stage')
    .gte('kickoff_at', tomorrow.toISOString())
    .lte('kickoff_at', tomorrowEnd.toISOString())
    .order('kickoff_at', { ascending: true });

  if (matchesError) {
    return NextResponse.json({ error: 'Database error', detail: matchesError.message }, { status: 500 });
  }
  if (!tomorrowMatches || tomorrowMatches.length === 0) {
    console.log('[reminder-emails] No matches tomorrow — skipping');
    return NextResponse.json({ message: 'No matches tomorrow — skipping', sent: 0 });
  }

  const tomorrowMatchIds = tomorrowMatches.map((m) => m.id);
  console.log(`[reminder-emails] ${tomorrowMatches.length} matches tomorrow`);

  // ── Step 2: Find all users with an email address ──
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, username, email')
    .not('email', 'is', null)
    .neq('email', '');

  if (usersError) {
    return NextResponse.json({ error: 'Database error', detail: usersError.message }, { status: 500 });
  }

  // ── Step 3: Fetch predictions for tomorrow's matches ──
  const { data: predictions, error: predError } = await supabase
    .from('predictions')
    .select('user_id, match_id')
    .in('match_id', tomorrowMatchIds);

  if (predError) {
    return NextResponse.json({ error: 'Database error', detail: predError.message }, { status: 500 });
  }

  const userPredictedMap = new Map<string, Set<string>>();
  for (const pred of predictions ?? []) {
    if (!userPredictedMap.has(pred.user_id)) userPredictedMap.set(pred.user_id, new Set());
    userPredictedMap.get(pred.user_id)!.add(pred.match_id);
  }

  // ── Step 4: Build fixture list HTML (shared across all emails) ──
  const matchesListHtml = tomorrowMatches
    .map((m, i) => `<div style="padding:12px 16px;border-bottom:${i < tomorrowMatches.length - 1 ? '1px solid #1e293b' : 'none'};">
      <span style="color:#f8fafc;font-size:14px;font-weight:600;">${m.home_team} vs ${m.away_team}</span><br/>
      <span style="color:#64748b;font-size:12px;">${formatKickoff(m.kickoff_at)} &nbsp;·&nbsp; ${m.group_stage ?? 'Match'}</span>
    </div>`)
    .join('');

  // ── Step 5: Determine who needs emails, build payloads ──
  type EmailPayload = { userId: string; email: string; subject: string; html: string };
  const toSend: EmailPayload[] = [];
  const skippedResults: any[] = [];

  for (const user of (users ?? [])) {
    const predicted = userPredictedMap.get(user.id) ?? new Set();
    const missing = tomorrowMatchIds.filter((id) => !predicted.has(id));

    if (missing.length === 0) {
      skippedResults.push({ userId: user.id, sent: false, reason: 'all-predicted' });
      continue;
    }

    if (testEmail && user.email !== testEmail) {
      skippedResults.push({ userId: user.id, sent: false, reason: 'test-mode-skipped' });
      continue;
    }

    const predictedCount = tomorrowMatchIds.length - missing.length;
    const totalCount = tomorrowMatches.length;

    const subject = predictedCount === 0
      ? "World Cup predictions due — you haven't predicted any matches for tomorrow!"
      : `World Cup predictions reminder — ${predictedCount}/${totalCount} matches predicted`;

    if (dryRun) {
      console.log(`[reminder-emails] 🧪 DRY RUN — would send to ${user.email}`);
      skippedResults.push({ userId: user.id, email: user.email, sent: false, reason: 'dry-run', subject });
      continue;
    }

    const html = buildEmailHtml(predictedCount, totalCount, matchesListHtml);
    toSend.push({ userId: user.id, email: user.email, subject, html });
  }

  // ── Step 6: Batch send in chunks of 100 ──
  const sentResults: any[] = [];
  const BATCH_SIZE = 100;

  for (let i = 0; i < toSend.length; i += BATCH_SIZE) {
    const chunk = toSend.slice(i, i + BATCH_SIZE);
    const batch = chunk.map(({ email, subject, html }) => ({ from: FROM_EMAIL, to: email, subject, html }));
    console.log(`[reminder-emails] 📦 Sending batch ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} emails`);

    try {
      const { data: batchData, error: batchError } = await getResend().batch.send(batch);
      if (batchError) {
        console.error('[reminder-emails] ❌ Batch error:', batchError);
        chunk.forEach(({ userId, email }) =>
          sentResults.push({ userId, email, sent: false, reason: 'resend-error', error: String((batchError as any).message ?? batchError) })
        );
      } else {
        const ids: any[] = (batchData as any)?.data ?? [];
        chunk.forEach(({ userId, email }, idx) => {
          console.log(`[reminder-emails] ✅ ${email} (id: ${ids[idx]?.id})`);
          sentResults.push({ userId, email, sent: true, resendId: ids[idx]?.id });
        });
      }
    } catch (err) {
      console.error('[reminder-emails] ❌ Batch exception:', err);
      chunk.forEach(({ userId, email }) =>
        sentResults.push({ userId, email, sent: false, reason: 'send-error' })
      );
    }
  }

  const results = [...skippedResults, ...sentResults];
  const sent = sentResults.filter((r) => r.sent).length;
  const failed = results.filter((r) => !r.sent).length;

  console.log(`[reminder-emails] 📊 Done — sent: ${sent}, skipped/failed: ${failed}`);

  return NextResponse.json({
    message: 'Reminder emails processed',
    matchesTomorrow: tomorrowMatches.length,
    emailsSent: sent,
    skipped: failed,
    detail: results,
  });
}

function buildEmailHtml(predictedCount: number, totalCount: number, matchesListHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://playpredictwin.com" style="text-decoration:none;">
        <img src="https://www.playpredictwin.com/images/logos/logo3.jpg"
             alt="Play Predict Win" width="200"
             style="max-width:200px;height:auto;border-radius:10px;display:block;margin:0 auto;"/>
      </a>
    </div>

    <div style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
      <div style="background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);padding:28px 32px;">
        <h1 style="margin:0 0 8px;color:#ffffff;font-size:22px;font-weight:800;line-height:1.3;">
          ⚽ Matches tomorrow — are your predictions in?
        </h1>
        <p style="margin:0;color:#bbf7d0;font-size:14px;">
          ${predictedCount > 0 ? `You've predicted ${predictedCount} of ${totalCount} matches.` : "You haven't predicted any matches yet."} Don't miss out on points!
        </p>
      </div>

      <div style="padding:28px 32px;">
        <p style="margin:0 0 12px;color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
          Tomorrow's fixtures — ${totalCount} match${totalCount > 1 ? 'es' : ''}
        </p>
        <div style="background:#0f172a;border-radius:10px;overflow:hidden;margin-bottom:28px;border:1px solid #334155;">
          ${matchesListHtml}
        </div>

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

    <div style="text-align:center;padding:20px 0 8px;font-size:12px;color:#475569;">
      © Play Predict Win · World Cup 2026<br/>
      <a href="https://playpredictwin.com/dashboard" style="color:#475569;text-decoration:underline;">Manage preferences</a>
    </div>

  </div>
</body>
</html>`;
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
