"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import getSupabaseClient from "@/lib/supabaseClient";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const local = localStorage.getItem("fut_current_user");
    setCurrentUser(local);
  }, []);

  async function migrateToSupabase(accessToken: string, userId: string) {
    try {
      const bought = JSON.parse(localStorage.getItem("boughtPlayers") || "[]");
      const positions = JSON.parse(localStorage.getItem("pitchPositions") || "{}");
      const bench = JSON.parse(localStorage.getItem("benchPlayers") || "[]");
      const budget = parseInt(localStorage.getItem("budget") || "0", 10) || 0;

      const payload = { budget, positions, bench, bought };

      const res = await fetch('/api/squads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // mark migrated and clear legacy local keys
        localStorage.setItem('migrated_to_supabase', '1');
        localStorage.removeItem('boughtPlayers');
        localStorage.removeItem('pitchPositions');
        localStorage.removeItem('benchPlayers');
        // keep budget locally if desired but it's now in Supabase
      } else {
        console.warn('Migration to Supabase failed', await res.text());
      }
    } catch (e) {
      console.warn('Migration error', e);
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const uname = username.trim().toLowerCase();
    if (!uname || password.length < 4) {
      setMessage('Provide a username and a password (≥4 chars).');
      return;
    }

    const email = `${uname}@local.dev`;

    if (mode === 'signup') {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
        return;
      }
      // signUp may not return session until email confirmed; attempt sign in
      const signIn = await supabase.auth.signInWithPassword({ email, password });
      if (signIn.error) {
        setMessage(signIn.error.message || 'Signed up — please confirm your email.');
      } else {
        const userId = signIn.data.session?.user?.id || data.user?.id;
        const token = signIn.data.session?.access_token || '';
        if (userId) localStorage.setItem('fut_current_user', userId);
        if (token && userId) await migrateToSupabase(token, userId);
        router.push('/');
      }
      return;
    }

    // sign in
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message || 'Sign in failed');
      return;
    }
    const userId = data.session?.user?.id;
    const token = data.session?.access_token;
    if (userId) localStorage.setItem('fut_current_user', userId);
    if (token && userId) await migrateToSupabase(token, userId);
    router.push('/');
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    localStorage.removeItem('fut_current_user');
    setCurrentUser(null);
    setMessage('Logged out.');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-gray-800 bg-gray-900/95 p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Account</h1>
            <p className="text-gray-400">Sign in or create an account to save your roster (Supabase).</p>
          </div>
          <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">
            ← Back home
          </Link>
        </div>

        {currentUser ? (
          <div className="rounded-2xl border border-green-600 bg-green-900/20 p-4 mb-6">
            <p className="font-semibold text-green-200">Signed in as <span className="text-white">{currentUser}</span></p>
            <button
              onClick={handleLogout}
              className="mt-3 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-white font-semibold"
            >
              Sign out
            </button>
          </div>
        ) : null}

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${mode === 'signin' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${mode === 'signup' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Enter a password"
            />
          </div>

          {message ? <p className="text-sm text-yellow-300">{message}</p> : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-500 transition"
          >
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
