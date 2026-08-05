"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import getSupabaseClient from "@/lib/supabaseClient";
import { syncSquadToSupabase } from "@/lib/squadSync";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const local = localStorage.getItem("fut_current_user");
    setCurrentUser(local);

    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "reset") {
      setMode("signin");
      setMessage("Enter your email and use Forgot password to receive a reset link.");
    }

    // Supabase password recovery links include auth data in the URL hash.
    // Detect this so we can show the "set new password" form.
    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      const hashParams = new URLSearchParams(hash);
      const type = hashParams.get("type");
      const accessToken = hashParams.get("access_token");
      if (type === "recovery" || !!accessToken) {
        setIsRecoveryFlow(true);
        setMessage("Reset link verified. Enter your new password below.");
      }
    }

    const supabase = getSupabaseClient();
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryFlow(true);
        setMessage("Reset link verified. Enter your new password below.");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function migrateToSupabase(accessToken: string, userId: string) {
    try {
      const result = await syncSquadToSupabase();
      if (!result.ok) {
        const message = result.reason === "no-session"
          ? "No active account session was available to save your squad yet."
          : `Migration failed: ${result.status ?? ""} ${result.body ?? ""}`.trim();
        console.warn(message);
        setMessage(message);
      }
    } catch (e) {
      console.warn("Migration error", e);
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (isRecoveryFlow) {
      if (newPassword.length < 6) {
        setMessage("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setMessage("New password and confirmation do not match.");
        return;
      }

      setIsUpdatingPassword(true);
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      setIsUpdatingPassword(false);

      if (error) {
        setMessage(error.message || "Unable to reset password. Please request a new reset link.");
        return;
      }

      setIsRecoveryFlow(false);
      setNewPassword("");
      setConfirmNewPassword("");
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, "/signin");
      }
      setMessage("Password reset successful. You can now sign in with your new password.");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setMessage('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && !trimmedUsername) {
      setMessage('Choose a username.');
      return;
    }

    const supabase = getSupabaseClient();

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: { data: { username: trimmedUsername } },
      });
      if (error) {
        setMessage(error.message);
        return;
      }

      // signUp may not return a session if email confirmation is required
      const signIn = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
      if (signIn.error) {
        setMessage(signIn.error.message || 'Signed up — check your email to confirm your account.');
        return;
      }

      const userId = signIn.data.session?.user?.id || data.user?.id;
      const token = signIn.data.session?.access_token || '';
      if (userId) localStorage.setItem('fut_current_user', trimmedUsername || trimmedEmail);
      if (token && userId) await migrateToSupabase(token, userId);
      router.push('/');
      return;
    }

    // sign in
    const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
    if (error) {
      setMessage(error.message || 'Sign in failed');
      return;
    }
    const userId = data.session?.user?.id;
    const token = data.session?.access_token;
    const label = (data.user?.user_metadata?.username as string) || trimmedEmail;
    if (userId) localStorage.setItem('fut_current_user', label);
    if (token && userId) await migrateToSupabase(token, userId);
    router.push('/');
  };

  const handleForgotPassword = async () => {
    setMessage(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setMessage("Enter your email address first, then click Forgot password.");
      return;
    }

    setIsSendingReset(true);
    const supabase = getSupabaseClient();
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/signin?mode=reset`
      : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo,
    });
    setIsSendingReset(false);

    if (error) {
      setMessage(error.message || "Unable to send password reset email.");
      return;
    }

    setMessage("If that email exists, a password reset link has been sent.");
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

        {!isRecoveryFlow ? (
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
        ) : (
          <div className="mb-6 rounded-2xl border border-blue-700 bg-blue-900/20 p-4 text-sm text-blue-100">
            Reset your password below.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isRecoveryFlow ? (
          <div>
            <label className="block text-sm font-semibold text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          ) : null}

          {!isRecoveryFlow && mode === 'signup' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-300">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                placeholder="Choose a display name"
              />
            </div>
          ) : null}

          {!isRecoveryFlow ? (
          <div>
            <label className="block text-sm font-semibold text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Enter a password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            {mode === "signin" ? (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isSendingReset}
                  className="text-xs text-blue-300 hover:text-blue-200 disabled:text-gray-500"
                >
                  {isSendingReset ? "Sending reset link..." : "Forgot password?"}
                </button>
              </div>
            ) : null}
          </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-300">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                />
              </div>
            </>
          )}

          {message ? <p className="text-sm text-yellow-300">{message}</p> : null}

          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="w-full rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-500 transition"
          >
            {isRecoveryFlow
              ? isUpdatingPassword
                ? "Updating Password..."
                : "Set New Password"
              : mode === 'signup'
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}