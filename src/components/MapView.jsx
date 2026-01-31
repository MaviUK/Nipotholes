import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import { MAPBOX_TOKEN, NI_BOUNDS } from "../app/config";

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function MapView({ geojson, onPickLocation, onOpenReport }) {
  const mapRef = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN) return;

    map.current = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-6.8, 54.65],
      zoom: 8,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Limit panning to NI-ish bounds
    map.current.setMaxBounds([
      [NI_BOUNDS.west, NI_BOUNDS.south],
      [NI_BOUNDS.east, NI_BOUNDS.north],
    ]);

    map.current.on("click", (e) => {
      // if user clicked a report pin, open it
      const features = map.current.queryRenderedFeatures(e.point, { layers: ["reports-circle"] });
      if (features?.length) {
        const id = features[0].properties.id;
        onOpenReport?.(id);
        return;
      }
      // otherwise choose location for new report
      onPickLocation?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    map.current.on("load", () => {
      map.current.addSource("reports", {
        type: "geojson",
        data: geojson ?? { type: "FeatureCollection", features: [] },
      });

      map.current.addLayer({
        id: "reports-circle",
        type: "circle",
        source: "reports",
        paint: {
          "circle-radius": 6,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#111",
          "circle-color": [
            "match",
            ["get", "status"],
            "Repaired", "#16a34a",
            "Scheduled", "#f59e0b",
            "Inspected", "#3b82f6",
            "Acknowledged", "#8b5cf6",
            "New", "#ef4444",
            "#6b7280"
          ],
        },
      });
    });

    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    if (!map.current) return;
    const src = map.current.getSource("reports");
    if (src) src.setData(geojson ?? { type: "FeatureCollection", features: [] });
  }, [geojson]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="p-4 text-sm">
        Missing <code>VITE_MAPBOX_TOKEN</code> in your .env
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
}
