-- Notifications system for PlayPredictWin
-- Phase 1: banners on /notificationtest2 only

-- Enable UUID extension (already enabled but safe to repeat)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── notifications ────────────────────────────────────────────────────────────
CREATE TABLE notifications (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message               TEXT        NOT NULL CHECK (char_length(message) <= 250),
    status                TEXT        NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('draft', 'published')),
    type                  TEXT        NOT NULL DEFAULT 'information'
                                CHECK (type IN ('information', 'success', 'important')),
    link_text             TEXT,
    link_url              TEXT,
    starts_at             TIMESTAMPTZ,
    ends_at               TIMESTAMPTZ,
    priority              INTEGER     NOT NULL DEFAULT 0,
    dismissal_mode        TEXT        NOT NULL DEFAULT 'temporary'
                                CHECK (dismissal_mode IN ('temporary', 'permanent')),
    reappear_after_hours  INTEGER     NOT NULL DEFAULT 24,
    created_by            UUID        REFERENCES profiles(id),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_status     ON notifications(status);
CREATE INDEX idx_notifications_priority   ON notifications(priority DESC, created_at DESC);
CREATE INDEX idx_notifications_starts_at  ON notifications(starts_at);
CREATE INDEX idx_notifications_ends_at    ON notifications(ends_at);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── user_notification_dismissals ──────────────────────────────────────────
CREATE TABLE user_notification_dismissals (
    user_id               UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    notification_id       UUID        NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    dismissed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    show_again_at         TIMESTAMPTZ,           -- NULL = permanent
    permanently_dismissed BOOLEAN     NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, notification_id)
);

CREATE INDEX idx_dismissals_user         ON user_notification_dismissals(user_id);
CREATE INDEX idx_dismissals_notification ON user_notification_dismissals(notification_id);
CREATE INDEX idx_dismissals_show_again   ON user_notification_dismissals(show_again_at);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_dismissals ENABLE ROW LEVEL SECURITY;

-- Notifications: only authenticated users can read published ones
CREATE POLICY "Authenticated users can read published notifications"
    ON notifications FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND status = 'published'
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (ends_at IS NULL OR ends_at > NOW())
    );

-- Admin: only profiles with is_admin=true can insert/update/delete
CREATE POLICY "Admins can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Admins can update notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Admins can delete notifications"
    ON notifications FOR DELETE
    USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Dismissals: users manage only their own rows
CREATE POLICY "Users can read own dismissals"
    ON user_notification_dismissals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dismissals"
    ON user_notification_dismissals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dismissals"
    ON user_notification_dismissals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dismissals (restore)"
    ON user_notification_dismissals FOR DELETE
    USING (auth.uid() = user_id);
