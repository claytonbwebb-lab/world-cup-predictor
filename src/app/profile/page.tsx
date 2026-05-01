'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);

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
      .select('username, marketing_consent')
      .eq('id', user.id)
      .single();

    if (profile) {
      setProfile(profile);
      setUsername(profile.username || '');
      setMarketingConsent(profile.marketing_consent || false);
    }
    setLoading(false);
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

        </div>
      </main>
      <Footer />
    </div>
  );
}
