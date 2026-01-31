import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../app/supabase";

function streetViewLink(lat, lng) {
  return `https://www.google.com/maps?q&layer=c&cbll=${lat},${lng}`;
}

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [media, setMedia] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: r } = await supabase.from("reports").select("*").eq("id", id).single();
      setReport(r);

      const { data: m } = await supabase.from("report_media").select("*").eq("report_id", id);
      setMedia(m ?? []);

      const { data: h } = await supabase
        .from("report_status_history")
        .select("*")
        .eq("report_id", id)
        .order("created_at", { ascending: false });
      setHistory(h ?? []);
    })();
  }, [id]);

  if (!report) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Report #{report.id}</h1>
          <div className="text-sm text-gray-600">
            Status: <span className="font-medium">{report.status}</span> • Severity: {report.severity}/5
          </div>
          <div className="text-xs font-mono mt-2">
            {Number(report.lat).toFixed(6)}, {Number(report.lng).toFixed(6)}
          </div>
          <a className="text-blue-600 underline text-sm" href={streetViewLink(report.lat, report.lng)} target="_blank" rel="noreferrer">
            Open Street View
          </a>
        </div>
      </div>

      {report.notes && (
        <div className="border rounded p-3 text-sm">
          <div className="font-medium mb-1">Notes</div>
          {report.notes}
        </div>
      )}

      <div>
        <div className="font-medium mb-2">Photos</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {media.map((m) => (
            <a key={m.id} href={m.url} target="_blank" rel="noreferrer">
              <img src={m.url} alt="" className="w-full h-40 object-cover rounded" />
            </a>
          ))}
        </div>
      </div>

      <div className="border rounded p-3">
        <div className="font-medium mb-2">Updates</div>
        <div className="space-y-2 text-sm">
          {history.map((h) => (
            <div key={h.id} className="border rounded p-2">
              <div className="text-xs text-gray-500">{new Date(h.created_at).toLocaleString()}</div>
              <div>
                {h.old_status ? `${h.old_status} → ` : ""}<span className="font-medium">{h.new_status}</span>
              </div>
              {h.note && <div className="text-gray-700">{h.note}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
