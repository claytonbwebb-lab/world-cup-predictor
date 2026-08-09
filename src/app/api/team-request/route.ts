import { NextRequest, NextResponse } from 'next/server';

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char] || char));
}

export async function POST(req: NextRequest) {
  const { email, team } = await req.json();

  const cleanEmail = String(email || '').trim();
  const cleanTeam = String(team || '').trim();

  if (!cleanEmail || !cleanTeam) {
    return NextResponse.json({ error: 'Please enter your email and team name.' }, { status: 400 });
  }

  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const senderUrl = process.env.VPS_TEAM_REQUEST_API_URL || 'https://mission.brightstacklabs.co.uk/api/ppw/team-request';

  const emailContent = `New team request from Play Predict Win

Email: ${cleanEmail}
Requested team: ${cleanTeam}`;

  try {
    const response = await fetch(senderUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        team: cleanTeam,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Team request sender failed:', response.status, details);
      return NextResponse.json({ error: 'Failed to send request. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Team request error:', err);
    return NextResponse.json({ error: 'Failed to send request. Please try again.' }, { status: 500 });
  }
}
