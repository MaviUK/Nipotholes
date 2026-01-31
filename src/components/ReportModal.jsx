import { useEffect, useMemo, useState } from "react";
import supabase from "../app/supabase";

function streetViewLink(lat, lng) {
  return `https://www.google.com/maps?q&layer=c&cbll=${lat},${lng}`;
}

export default function ReportModal({ open, onClose, pickedLocation, onCreated }) {
  const [severity, setSeverity] = useState(3);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const hasLocation = !!pickedLocation?.lat && !!pickedLocation?.lng;

  const svUrl = useMemo(() => {
    if (!hasLocation) return null;
    return streetViewLink(pickedLocation.lat, pickedLocation.lng);
  }, [hasLocation, pickedLocation]);

  useEffect(() => {
    if (!open) {
      setSeverity(3);
      setNotes("");
      setFiles([]);
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-3 z-50">
      <div className="w-full max-w-lg bg-white rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Report a pothole</div>
          <button onClick={onClose} className="text-sm underline">Close</button>
        </div>

        {!hasLocation ? (
          <div className="text-sm">
            Click the map to pick the exact location.
          </div>
        ) : (
          <>
            <div className="text-sm mb-2">
              Location selected:
              <div className="font-mono text-xs mt-1">
                {pickedLocation.lat.toFixed(6)}, {pickedLocation.lng.toFixed(6)}
              </div>
              <a className="text-blue-600 underline text-sm" href={svUrl} target="_blank" rel="noreferrer">
                Open Street View to confirm exact spot
              </a>
            </div>

            <label className="block text-sm font-medium mt-3">Severity</label>
            <input
              type="range"
              min="1"
              max="5"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-600">Severity: {severity}/5</div>

            <label className="block text-sm font-medium mt-3">Notes (optional)</label>
            <textarea
              className="w-full border rounded p-2 text-sm"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. outside house #24, near drain cover, hazardous at night..."
            />

            <label className="block text-sm font-medium mt-3">
              Photo evidence (required)
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="block w-full text-sm"
            />
            <div className="text-xs text-gray-600 mt-1">
              Tip: take at least 2 photos (close-up + context shot).
            </div>

            <button
              disabled={saving || files.length === 0}
              onClick={async () => {
                setSaving(true);
                try {
                  const { data: userData } = await supabase.auth.getUser();
                  const user = userData.user;
                  if (!user) throw new Error("You must be logged in.");

                  // 1) Insert report
                  const { data: report, error: rErr } = await supabase
                    .from("reports")
                    .insert({
                      lat: pickedLocation.lat,
                      lng: pickedLocation.lng,
                      status: "New",
                      severity,
                      notes,
                      created_by: user.id,
                    })
                    .select("*")
                    .single();

                  if (rErr) throw rErr;

                  // 2) Upload files + insert media rows
                  const uploads = [];
                  for (const f of files) {
                    const path = `${user.id}/${report.id}/${crypto.randomUUID()}-${f.name}`;
                    const { error: upErr } = await supabase.storage
                      .from("report-media")
                      .upload(path, f, { cacheControl: "3600", upsert: false });

                    if (upErr) throw upErr;

                    const { data: pub } = supabase.storage.from("report-media").getPublicUrl(path);
                    uploads.push({ report_id: report.id, url: pub.publicUrl, type: "photo" });
                  }

                  const { error: mErr } = await supabase.from("report_media").insert(uploads);
                  if (mErr) throw mErr;

                  // 3) Status history
                  await supabase.from("report_status_history").insert({
                    report_id: report.id,
                    old_status: null,
                    new_status: "New",
                    note: "Report submitted",
                    changed_by: user.id,
                  });

                  onCreated?.(report.id);
                } catch (e) {
                  alert(e?.message || "Failed to submit report");
                } finally {
                  setSaving(false);
                }
              }}
              className="mt-4 w-full rounded bg-black text-white py-2 disabled:opacity-50"
            >
              {saving ? "Submitting…" : "Submit report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
