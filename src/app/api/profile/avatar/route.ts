import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Authenticate
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse multipart form
  let file: File;
  try {
    const formData = await req.formData();
    file = formData.get('avatar') as File;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 });
  }

  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP or GIF.' }, { status: 400 });
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 400 });
  }

  // Determine extension from mime type
  const ext = file.type === 'image/jpeg' ? 'jpg'
    : file.type === 'image/png' ? 'png'
    : file.type === 'image/webp' ? 'webp'
    : 'gif';

  const filePath = `user-${user.id}/avatar.${ext}`;

  // Convert File to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true, // replace existing avatar
    });

  if (uploadError) {
    console.error('Avatar upload error:', uploadError);
    return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Save URL to profiles table
  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`; // cache-bust
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (updateError) {
    console.error('Profile update error:', updateError);
    return NextResponse.json({ error: 'Failed to save avatar URL' }, { status: 500 });
  }

  return NextResponse.json({ url: urlData.publicUrl });
}
