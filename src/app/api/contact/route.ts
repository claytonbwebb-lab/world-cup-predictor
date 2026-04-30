import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const emailContent = `
New contact form submission from PlayPredictWin.com

Name: ${name}
Email: ${email}
Message: ${message}
  `.trim();

  const smtp = {
    host: 'smtp.zoho.eu',
    port: 465,
    secure: true,
    auth: {
      user: 'info@brightstacklabs.co.uk',
      pass: '73fw65KxrMPQ',
    },
  };

  try {
    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport(smtp);

    await transporter.sendMail({
      from: '"Play Predict Win" <info@brightstacklabs.co.uk>',
      to: 'partners@playpredictwin.com',
      replyTo: email,
      subject: `New Contact: ${name}`,
      text: emailContent,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Failed to send', detail: String(err) }, { status: 500 });
  }
}