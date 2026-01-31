export function toGeoJSONPoints(reports) {
  return {
    type: "FeatureCollection",
    features: reports.map((r) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [r.lng, r.lat] },
      properties: {
        id: r.id,
        status: r.status,
        severity: r.severity ?? null,
      },
    })),
  };
}
