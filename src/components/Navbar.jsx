import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { APP_NAME } from "../app/config";
import supabase from "../app/supabase";
import { signOut } from "../app/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold">
          {APP_NAME}
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <Link to="/" className="hover:underline">Map</Link>
          {user && <Link to="/my-reports" className="hover:underline">My Reports</Link>}
          {user && <Link to="/council" className="hover:underline">Council</Link>}

          {!user ? (
            <button
              onClick={() => nav("/login")}
              className="px-3 py-1.5 rounded bg-black text-white"
            >
              Log in
            </button>
          ) : (
            <button
              onClick={async () => {
                await signOut();
                nav("/");
              }}
              className="px-3 py-1.5 rounded border"
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
