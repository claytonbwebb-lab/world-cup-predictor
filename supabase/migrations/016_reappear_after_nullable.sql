-- Allow reappear_after_hours to be NULL.
-- NULL + dismissal_mode='temporary' means "dismissed once, never reappears"
-- (handled in /api/notifications/dismiss, which marks it permanently_dismissed).

ALTER TABLE notifications
  ALTER COLUMN reappear_after_hours DROP NOT NULL;
