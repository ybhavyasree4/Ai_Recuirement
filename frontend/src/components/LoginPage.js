"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GoogleOAuthProvider,
  GoogleLogin,
} from "@react-oauth/google";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading || googleLoading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        alert(data.detail || "Invalid email or password");
        setLoading(false);
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to backend");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (googleLoading || loading) return;

    if (!credentialResponse?.credential) {
      alert("Google authentication failed");
      setGoogleLoading(false);
      return;
    }

    setGoogleLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        alert(data.detail || "Google login failed");
        setGoogleLoading(false);
        return;
      }

      console.log("Google login successful:", data);

      router.replace("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
      alert("Unable to connect to backend");
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
    alert("Google login failed");
    setGoogleLoading(false);
  };

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
    >
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 sm:px-6 py-6">

        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl">

          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-normal">
              Login
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Sign in to TalentIQ
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-4 mt-5"
          >

            <div>
              <label className="block text-xs sm:text-sm mb-1.5 text-slate-200">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm mb-1.5 text-slate-200">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-cyan-400 hover:text-cyan-300 text-xs sm:text-sm transition"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed text-black py-2.5 rounded-lg font-normal text-xs sm:text-sm transition"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-slate-700 flex-1"></div>

            <span className="text-slate-500 text-[11px]">
              OR
            </span>

            <div className="h-px bg-slate-700 flex-1"></div>
          </div>

          <div className="flex justify-center w-full">
            {googleLoading ? (
              <div className="h-[40px] flex items-center justify-center gap-2 text-slate-400 text-xs">
                <span className="w-4 h-4 border-2 border-slate-600 border-t-cyan-400 rounded-full animate-spin"></span>
                Signing in with Google...
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleGoogleError}
                theme="outline"
                size="medium"
                text="continue_with"
                shape="rectangular"
                width="220"
                ux_mode="popup"
                auto_select={false}
              />
            )}
          </div>

          <p className="text-center text-slate-400 text-xs sm:text-sm mt-5">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-cyan-400 hover:text-cyan-300 transition"
            >
              Sign Up
            </Link>
          </p>

          <div className="text-center mt-3">
            <Link
              href="/"
              className="text-xs sm:text-sm text-slate-500 hover:text-white transition"
            >
              Back to Home
            </Link>
          </div>

        </div>
      </main>
    </GoogleOAuthProvider>
  );
}