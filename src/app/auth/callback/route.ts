// Disabled - page.tsx handles session exchange client-side instead
// This avoids server-side storage mismatch issues with magic links
export async function GET() {
  return new Response(null, { status: 204 });
}
