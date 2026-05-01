import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.redirect('https://assets.ikhnaie.me/click.html?wgcampaignid=1747476&wgprogramid=295320', 302);
}