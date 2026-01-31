import { useState } from "react";
import { signInWithEmail, signInWithGoogle } from "../app/auth";

export default function Login() {
  const [email, setEmail] = useState("");

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold">Log in</h1>

      <button
        onClick={async () => {
          const { error } = await signInWithGoogle();
          if (error) alert(error.message);
        }}
        className="mt-4 w-full border rounded py-2"
      >
        Continue with Google
      </button>

      <div className="my-4 text-xs text-gray-500 text-center">OR</div>

      <label className="block text-sm font-medium">Email magic link</label>
      <input
        className="w-full border rounded p-2 mt-1"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />

      <button
        onClick={async () => {
          const { error } = await signInWithEmail(email);
          if (error) alert(error.message);
          else alert("Check your email for a sign-in link.");
        }}
        className="mt-3 w-full bg-black text-white rounded py-2"
      >
        Send login link
      </button>
    </div>
  );
}
