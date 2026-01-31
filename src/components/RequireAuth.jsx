import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getSession } from "../app/auth";

export default function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    (async () => {
      setSession(await getSession());
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}
