import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../app/supabase";
import MapView from "../components/MapView";
import ReportModal from "../components/ReportModal";
import { toGeoJSONPoints } from "../lib/geo";

export default function Home() {
  const nav = useNavigate();
  const [reports, setReports] = useState([]);
  const [picked, setPicked] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, lat, lng, status, severity")
        .order("created_at", { ascending: false })
        .limit(2000);

      if (!error) setReports(data ?? []);
    })();
  }, []);

  const geojson = useMemo(() => toGeoJSONPoints(reports), [reports]);

  return (
    <div className="h-full relative">
      <MapView
        geojson={geojson}
        onPickLocation={(loc) => {
          setPicked(loc);
          setModalOpen(true);
        }}
        onOpenReport={(id) => nav(`/report/${id}`)}
      />

      <div className="absolute top-3 left-3 bg-white rounded-lg shadow px-3 py-2 text-sm">
        <div className="font-semibold">Stats (MVP)</div>
        <div>Total reports: {reports.length}</div>
        <div>Repaired: {reports.filter(r => r.status === "Repaired").length}</div>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="absolute bottom-4 right-4 rounded-full bg-black text-white px-4 py-3 shadow-lg"
      >
        Report pothole
      </button>

      <ReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        pickedLocation={picked}
        onCreated={(id) => {
          setModalOpen(false);
          nav(`/report/${id}`);
        }}
      />
    </div>
  );
}
