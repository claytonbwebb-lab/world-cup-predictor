'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { isIOS, isStandalone } from '@/utils/pwa';

const DEFAULT_AVATAR = '/default-avatar.png';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);

  const { isSupported, isSubscribed, permission, subscribe, unsubscribe, loading: pushLoading } = usePushNotifications();

  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    setUser(user);

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url, marketing_consent')
      .eq('id', user.id)
      .single();

    if (profile) {
      setProfile(profile);
      setUsername(profile.username || '');
      setAvatarPreview(profile.avatar_url || null);
      setMarketingConsent(profile.marketing_consent || false);
    }
    setLoading(false);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploadingAvatar(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Upload failed');
      // Revert preview
      setAvatarPreview(profile?.avatar_url || null);
    } else {
      setSuccess('Avatar updated!');
      setProfile((p: any) => ({ ...p, avatar_url: data.url }));
    }
    setUploadingAvatar(false);
  }

  async function handleUsernameUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      setSaving(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id);

    if (error) {
      setError('Failed to update username: ' + error.message);
    } else {
      setSuccess('Username updated!');
    }
    setSaving(false);
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError('Failed to update password: ' + error.message);
    } else {
      setSuccess('Password updated!');
      setNewPassword('');
      setConfirmPassword('');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="text-center py-16 text-textMuted">Loading profile...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-textMuted mb-8">Manage your account details</p>

        {success && (
          <div className="bg-primary/10 border border-primary/30 text-primary px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">

          {/* Avatar */}
          <div className="card">
            <h2 className="text-lg font-bold mb-1">Profile Picture</h2>
            <p className="text-textMuted text-sm mb-4">This is shown next to your name in leagues and on the leaderboard</p>
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarPreview || DEFAULT_AVATAR}
                  alt="Your avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="btn-primary mb-2"
                >
                  {uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
                </button>
                <p className="text-textMuted text-xs">JPEG, PNG, WebP or GIF · Max 5MB</p>
                {profile?.avatar_url && (
                  <button
                    onClick={async () => {
                      setAvatarPreview(null);
                      setSaving(true);
                      const { error } = await supabase
                        .from('profiles')
                        .update({ avatar_url: null, updated_at: new Date().toISOString() })
                        .eq('id', user.id);
                      if (!error) {
                        setProfile((p: any) => ({ ...p, avatar_url: null }));
                        setSuccess('Avatar removed.');
                      }
                      setSaving(false);
                    }}
                    disabled={saving}
                    className="text-red-400 hover:text-red-300 text-xs mt-2 underline"
                  >
                    {saving ? 'Removing...' : 'Remove photo'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="card">
            <h2 className="text-lg font-bold mb-1">Username</h2>
            <p className="text-textMuted text-sm mb-4">This is how you appear to other players</p>
            <form onSubmit={handleUsernameUpdate} className="flex gap-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input flex-1"
                placeholder="football_fan"
                minLength={3}
                pattern="^[a-zA-Z0-9_]+$"
              />
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>

          {/* Email */}
          <div className="card">
            <h2 className="text-lg font-bold mb-1">Email Address</h2>
            <p className="text-textMuted text-sm">Your email address: <span className="text-primary">{user?.email}</span></p>
          </div>

          {/* Password */}
          <div className="card">
            <h2 className="text-lg font-bold mb-1">Password</h2>
            <p className="text-textMuted text-sm mb-4">Update your password</p>
            <form onSubmit={handlePasswordUpdate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input w-full"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input w-full"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <button type="submit" disabled={saving || !newPassword} className="btn-primary">
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* GDPR Consent */}
          <div className="card">
            <h2 className="text-lg font-bold mb-1">Marketing Communications</h2>
            <p className="text-textMuted text-sm mb-4">Stay up to date with football tips, predictions, and exclusive offers from Play Predict Win</p>
            <div className="flex items-start gap-3 bg-background/50 border border-border rounded-lg p-4">
              <input
                type="checkbox"
                id="marketing_consent"
                checked={marketingConsent}
                onChange={async (e) => {
                  const checked = e.target.checked;
                  setMarketingConsent(checked);
                  setSaving(true);
                  setError('');
                  setSuccess('');
                  const { error } = await supabase
                    .from('profiles')
                    .update({ marketing_consent: checked })
                    .eq('id', user.id);
                  if (error) {
                    setError('Failed to save preference: ' + error.message);
                    setMarketingConsent(!checked);
                  } else {
                    setSuccess(checked ? 'Subscribed to marketing emails!' : 'Unsubscribed from marketing emails.');
                  }
                  setSaving(false);
                }}
                disabled={saving}
                className="mt-0.5 accent-primary shrink-0"
              />
              <label htmlFor="marketing_consent" className="text-sm text-textMuted leading-snug">
                I would like to receive marketing emails from Play Predict Win about special offers, football content, and updates. I understand I can unsubscribe at any time.
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <h2 className="text-lg font-bold mb-1">Push Notifications</h2>
            <p className="text-textMuted text-sm mb-4">Get reminders for upcoming matches so you never miss a prediction.</p>

            {/* iOS Safari (not standalone) — prompt to install */}
            {isIOS() && !isStandalone() && (
              <p className="text-textMuted text-sm">To enable push notifications on iPhone, tap the Share button in Safari then "Add to Home Screen", then open the app from your home screen.</p>
            )}

            {/* Truly unsupported browser */}
            {!isSupported && !isIOS() && (
              <p className="text-textMuted text-sm">Push notifications aren&apos;t supported in this browser. Try Chrome or Safari 16+.</p>
            )}

            {/* Supported: show status */}
            {isSupported && (!isIOS() || isStandalone()) && (
              <div className="flex items-center gap-4">
                {permission === 'granted' && isSubscribed ? (
                  <>
                    <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Match reminders enabled</p>
                      <button
                        onClick={unsubscribe}
                        disabled={pushLoading}
                        className="text-primary hover:underline text-xs mt-1"
                      >
                        {pushLoading ? 'Disabling...' : 'Disable reminders'}
                      </button>
                    </div>
                  </>
                ) : permission === 'denied' ? (
                  <>
                    <span className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0" />
                    <p className="text-sm text-textMuted">Notifications are blocked &mdash; enable them in your browser/device settings.</p>
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 bg-amber-500 rounded-full flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Match reminders off</p>
                      <button
                        onClick={async () => {
                          await subscribe();
                          localStorage.setItem('ppw_notif_dismissed', 'true');
                        }}
                        disabled={pushLoading}
                        className="text-primary hover:underline text-xs mt-1"
                      >
                        {pushLoading ? 'Enabling...' : 'Enable reminders'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Reset localStorage helper (only in dev and if dismissed) */}
            {process.env.NODE_ENV === 'development' && (typeof window !== 'undefined' && localStorage.getItem('ppw_notif_dismissed')) && (
              <button
                onClick={() => {
                  localStorage.removeItem('ppw_notif_dismissed');
                  alert('Notification prompt reset for testing. Reload the page.');
                  window.location.reload();
                }}
                className="text-textMuted hover:text-white text-xs mt-4 underline"
              >
                Reset notification prompt
              </button>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
