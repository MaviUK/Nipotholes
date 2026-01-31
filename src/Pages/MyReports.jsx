import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../app/supabase";

export default function MyReports() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const { data } = await supabase
        .from("reports")
        .select("id, created_at, status, severity")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      setRows(data ?? []);
    })();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-semibold">My Reports</h1>
      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <Link key={r.id} to={`/report/${r.id}`} className="block border rounded p-3 hover:bg-gray-50">
            <div className="flex justify-between text-sm">
              <div className="font-medium">Report #{r.id}</div>
              <div className="text-gray-500">{new Date(r.created_at).toLocaleDateString()}</div>
            </div>
            <div className="text-sm text-gray-700 mt-1">
              Status: <span className="font-medium">{r.status}</span> • Severity: {r.severity}/5
            </div>
          </Link>
        ))}
        {rows.length === 0 && <div className="text-sm text-gray-600">No reports yet.</div>}
      </div>
    </div>
  );
}
