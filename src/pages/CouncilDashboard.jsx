import { useEffect, useState } from "react";
import supabase from "../app/supabase";


/**
 * MVP stub:
 * Later we’ll load the user’s role + council_area_id and filter reports accordingly.
 */
export default function CouncilDashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    (async () => {
      // TEMP: show latest 50. In phase 2 we’ll enforce council-area filtering + role gating via RLS.
      const { data } = await supabase
        .from("reports")
        .select("id, created_at, status, severity")
        .order("created_at", { ascending: false })
        .limit(50);

      setReports(data ?? []);
    })();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-semibold">Council Dashboard (MVP)</h1>
      <p className="text-sm text-gray-600 mt-1">
        Next step: council-role enforcement + update status UI.
      </p>

      <div className="mt-4 space-y-2">
        {reports.map((r) => (
          <div key={r.id} className="border rounded p-3 text-sm">
            <div className="flex justify-between">
              <div className="font-medium">Report #{r.id}</div>
              <div className="text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
            </div>
            <div>Status: <b>{r.status}</b> • Severity: {r.severity}/5</div>
          </div>
        ))}
      </div>
    </div>
  );
}
