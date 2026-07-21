"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUser, validateUser, getCurrentUser, logoutUser } from "@/lib/user";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "signup") {
      const result = createUser(username, password);
      setMessage(result.message);
      if (result.success) {
        router.push("/");
      }
      return;
    }

    const result = validateUser(username, password);
    setMessage(result.message);
    if (result.success) {
      router.push("/");
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setMessage("Logged out.");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-gray-800 bg-gray-900/95 p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Account</h1>
            <p className="text-gray-400">Sign in or create an account to save your roster.</p>
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
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${mode === "signin" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${mode === "signup" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
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
              placeholder="Enter a username"
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
            {mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
