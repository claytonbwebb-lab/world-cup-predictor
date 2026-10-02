"use client";

import { useState, useEffect } from "react";

interface Notification {
  id: string;
  message: string;
  status: string;
  type: string;
  link_text?: string;
  link_url?: string;
  starts_at?: string;
  ends_at?: string;
  priority: number;
  dismissal_mode: string;
  reappear_after_hours: number | null;
  created_at: string;
  updated_at: string;
}

// Form state keeps numeric fields as raw strings so typing/backspacing
// isn't rewritten mid-keystroke, and datetimes as local input strings
// (converted to UTC ISO only on submit).
type FormNotif = Omit<Partial<Notification>, 'priority' | 'reappear_after_hours'> & {
  priority?: number | string;
  reappear_after_hours?: number | string | null;
};

type EditState = FormNotif | null;

// UTC ISO -> "YYYY-MM-DDTHH:mm" in local time for datetime-local inputs
function isoToLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// local input string -> UTC ISO (null if blank)
function localInputToIso(local?: string | null): string | null {
  if (!local) return null;
  const d = new Date(local);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function parseIntOr(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseInt(v, 10);
  return isNaN(n) ? null : n;
}

function formatDate(ds: string | undefined) {
  if (!ds) return "—";
  const d = new Date(ds);
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: string }) {
  const colours: Record<string, string> = {
    draft: "bg-white/10 text-white/60",
    published: "bg-green-900/60 text-green-300",
  };
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${colours[status] ?? ""}`}>
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colours: Record<string, string> = {
    information: "bg-blue-900/40 text-blue-300",
    success: "bg-green-900/40 text-green-300",
    important: "bg-red-900/40 text-red-300",
  };
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${colours[type] ?? ""}`}>
      {type}
    </span>
  );
}

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]  as Notification[]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newNotif, setNewNotif] = useState<FormNotif>({
    message: "",
    status: "draft",
    type: "information",
    link_text: "",
    link_url: "",
    starts_at: "",
    ends_at: "",
    priority: "0",
    dismissal_mode: "temporary",
    reappear_after_hours: "24",
  });

  useEffect(() => { fetchNotifications(); }, []);

  async function fetchNotifications() {
    setLoading(true);
    const res = await fetch("/api/admin/notifications");
    const json = await res.json();
    setNotifications(json.notifications ?? []);
    setLoading(false);
  }

  function flash(msg: string, isError = false) {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 3000);
  }

  async function handleCreate() {
    if (!newNotif.message?.trim()) { flash("Message is required", true); return; }
    if (newNotif.message.length > 250) { flash("Message must be ≤250 characters", true); return; }
    setSaving(true);
    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newNotif,
        priority: parseIntOr(newNotif.priority) ?? 0,
        reappear_after_hours: parseIntOr(newNotif.reappear_after_hours),
        starts_at: localInputToIso(newNotif.starts_at),
        ends_at: localInputToIso(newNotif.ends_at),
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { flash(json.error ?? "Create failed", true); return; }
    setShowCreate(false);
    setNewNotif({ message:"", status:"draft", type:"information", priority:"0", dismissal_mode:"temporary", reappear_after_hours:"24" });
    fetchNotifications();
    flash("Notification created");
  }

  async function handleSave() {
    if (!edit || !editId) return;
    if (!edit.message?.trim()) { flash("Message is required", true); return; }
    if (edit.message && edit.message.length > 250) { flash("Message must be ≤250 characters", true); return; }
    setSaving(true);
    const res = await fetch("/api/admin/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...edit,
        id: editId,
        priority: parseIntOr(edit.priority) ?? 0,
        reappear_after_hours: parseIntOr(edit.reappear_after_hours),
        starts_at: localInputToIso(edit.starts_at),
        ends_at: localInputToIso(edit.ends_at),
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { flash(json.error ?? "Save failed", true); return; }
    setEditId(null);
    setEdit(null);
    fetchNotifications();
    flash("Notification updated");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this notification? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/notifications?id=${id}`, { method: "DELETE" });
    if (!res.ok) { const json = await res.json(); flash(json.error ?? "Delete failed", true); return; }
    fetchNotifications();
    flash("Notification deleted");
  }

  async function handleResetDismissals(id: string) {
    const res = await fetch("/api/admin/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, reset_dismissals: true }),
    });
    if (!res.ok) { const json = await res.json(); flash(json.error ?? "Reset failed", true); return; }
    flash("Dismissals cleared — all users will see this notification again");
  }

  function startEdit(n: Notification) {
    setEditId(n.id);
    setEdit({
      ...n,
      priority: String(n.priority ?? 0),
      reappear_after_hours: n.reappear_after_hours === null ? "" : String(n.reappear_after_hours),
      starts_at: isoToLocalInput(n.starts_at),
      ends_at: isoToLocalInput(n.ends_at),
    });
  }

  function cancelEdit() { setEditId(null); setEdit(null); }

  return (
    <div>
      {/* Alerts */}
      {error && <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-700 text-red-200 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-lg bg-green-900/40 border border-green-700 text-green-200 text-sm">{success}</div>}

      {/* Create form */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Notifications</h2>
          <button
            onClick={() => { setShowCreate(!showCreate); setEditId(null); setEdit(null); }}
            className="text-sm px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-white font-semibold transition-colors"
          >
            {showCreate ? "Cancel" : "+ New Notification"}
          </button>
        </div>

        {showCreate && (
          <div className="space-y-3 border-t border-white/10 pt-4">
            <div>
              <label className="block text-sm text-textMuted mb-1">Message *</label>
              <textarea
                className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white resize-none"
                rows={2}
                maxLength={250}
                value={newNotif.message}
                onChange={e => setNewNotif({ ...newNotif, message: e.target.value })}
                placeholder="e.g. 🎉 Well done to [Name] who just won £50 in Week 8!"
              />
              <p className="text-xs text-textMuted mt-1">{newNotif.message?.length ?? 0}/250</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-textMuted mb-1">Status</label>
                <select
                  className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={newNotif.status}
                  onChange={e => setNewNotif({ ...newNotif, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-textMuted mb-1">Type</label>
                <select
                  className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={newNotif.type}
                  onChange={e => setNewNotif({ ...newNotif, type: e.target.value })}
                >
                  <option value="information">Information</option>
                  <option value="success">Success</option>
                  <option value="important">Important</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-textMuted mb-1">Dismissal Mode</label>
                <select
                  className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={newNotif.dismissal_mode}
                  onChange={e => setNewNotif({ ...newNotif, dismissal_mode: e.target.value })}
                >
                  <option value="temporary">Temporary</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-textMuted mb-1">Priority (higher = first)</label>
                <input
                  type="number"
                  className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={newNotif.priority ?? ""}
                  min={0}
                  onChange={e => setNewNotif({ ...newNotif, priority: e.target.value })}
                />
              </div>
            </div>

            {newNotif.dismissal_mode === "temporary" && (
              <div>
                <label className="block text-sm text-textMuted mb-1">Reappear After (hours — blank = never)</label>
                <input
                  type="number"
                  className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={newNotif.reappear_after_hours ?? ""}
                  min={1}
                  placeholder="24"
                  onChange={e => setNewNotif({ ...newNotif, reappear_after_hours: e.target.value })}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-textMuted mb-1">Start (UK, optional)</label>
                <input
                  type="datetime-local"
                  className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={newNotif.starts_at ?? ""}
                  onChange={e => setNewNotif({ ...newNotif, starts_at: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-textMuted mb-1">End (UK, optional)</label>
                <input
                  type="datetime-local"
                  className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={newNotif.ends_at ?? ""}
                  onChange={e => setNewNotif({ ...newNotif, ends_at: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-textMuted mb-1">CTA Label (optional)</label>
                <input
                  className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={newNotif.link_text ?? ""}
                  onChange={e => setNewNotif({ ...newNotif, link_text: e.target.value })}
                  placeholder="e.g. View Leaderboard"
                />
              </div>
              <div>
                <label className="block text-sm text-textMuted mb-1">CTA URL (optional)</label>
                <input
                  type="url"
                  className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={newNotif.link_url ?? ""}
                  onChange={e => setNewNotif({ ...newNotif, link_url: e.target.value })}
                  placeholder="https://playpredictwin.com/..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreate}
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/80 disabled:opacity-50 text-white font-semibold transition-colors"
              >
                {saving ? "Saving…" : "Create Notification"}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="text-center py-12 text-textMuted">Loading…</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-textMuted">No notifications yet.</div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className="card">
              {editId === n.id && edit ? (
                /* Inline edit form */
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-textMuted mb-1">Message *</label>
                    <textarea
                      className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white resize-none"
                      rows={2}
                      maxLength={250}
                      value={edit.message ?? ""}
                      onChange={e => setEdit({ ...edit, message: e.target.value })}
                    />
                    <p className="text-xs text-textMuted mt-1">{(edit.message ?? "").length}/250</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-textMuted mb-1">Status</label>
                      <select
                        className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                        value={edit.status}
                        onChange={e => setEdit({ ...edit, status: e.target.value })}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-textMuted mb-1">Type</label>
                      <select
                        className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                        value={edit.type}
                        onChange={e => setEdit({ ...edit, type: e.target.value })}
                      >
                        <option value="information">Information</option>
                        <option value="success">Success</option>
                        <option value="important">Important</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-textMuted mb-1">Dismissal Mode</label>
                      <select
                        className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                        value={edit.dismissal_mode}
                        onChange={e => setEdit({ ...edit, dismissal_mode: e.target.value })}
                      >
                        <option value="temporary">Temporary</option>
                        <option value="permanent">Permanent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-textMuted mb-1">Priority</label>
                      <input
                        type="number"
                        className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                        value={edit.priority ?? ""}
                        min={0}
                        onChange={e => setEdit({ ...edit, priority: e.target.value })}
                      />
                    </div>
                  </div>
                  {edit.dismissal_mode === "temporary" && (
                    <div>
                      <label className="block text-sm text-textMuted mb-1">Reappear After (hours — blank = never)</label>
                      <input
                        type="number"
                        className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                        value={edit.reappear_after_hours ?? ""}
                        min={1}
                        placeholder="24"
                        onChange={e => setEdit({ ...edit, reappear_after_hours: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-textMuted mb-1">Start (UK)</label>
                      <input
                        type="datetime-local"
                        className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                        value={edit.starts_at ?? ""}
                        onChange={e => setEdit({ ...edit, starts_at: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-textMuted mb-1">End (UK)</label>
                      <input
                        type="datetime-local"
                        className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                        value={edit.ends_at ?? ""}
                        onChange={e => setEdit({ ...edit, ends_at: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-textMuted mb-1">CTA Label</label>
                      <input
                        className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                        value={edit.link_text ?? ""}
                        onChange={e => setEdit({ ...edit, link_text: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-textMuted mb-1">CTA URL</label>
                      <input
                        type="url"
                        className="w-full bg-surfaceLight border border-white/10 rounded-lg px-3 py-2 text-white"
                        value={edit.link_url ?? ""}
                        onChange={e => setEdit({ ...edit, link_url: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/80 disabled:opacity-50 text-white font-semibold transition-colors"
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    <button onClick={cancelEdit} className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResetDismissals(n.id)}
                      className="ml-auto text-sm px-3 py-2 rounded-lg border border-yellow-700/40 text-yellow-400/70 hover:bg-yellow-900/20 transition-colors"
                    >
                      Clear User Dismissals
                    </button>
                  </div>
                </div>
              ) : (
                /* Read-only row */
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium leading-snug">{n.message}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <StatusBadge status={n.status} />
                      <TypeBadge type={n.type} />
                      <span className="text-xs text-textMuted">pri:{n.priority}</span>
                      <span className="text-xs text-textMuted">{n.dismissal_mode}</span>
                      {n.dismissal_mode === "temporary" && (
                        <span className="text-xs text-textMuted">{n.reappear_after_hours != null ? `↻${n.reappear_after_hours}h` : "↻ never"}</span>
                      )}
                      {n.starts_at && <span className="text-xs text-textMuted">from {formatDate(n.starts_at)}</span>}
                      {n.ends_at && <span className="text-xs text-textMuted">→ {formatDate(n.ends_at)}</span>}
                    </div>
                    {n.link_text && n.link_url && (
                      <p className="text-xs text-primary mt-1">CTA: {n.link_text} → {n.link_url}</p>
                    )}
                    <p className="text-xs text-textMuted mt-1">Created {formatDate(n.created_at)}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(n)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-white/70 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-800/40 hover:bg-red-900/30 text-red-400/70 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
