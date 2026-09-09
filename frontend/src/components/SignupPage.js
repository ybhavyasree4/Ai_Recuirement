"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (loading || googleLoading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
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
        alert(data.detail || "Signup failed");
        setLoading(false);
        return;
      }

      alert("Verification OTP sent to your email.");

      router.push(
        `/verify-email?email=${encodeURIComponent(email)}`
      );
    } catch (error) {
      console.error("Signup error:", error);
      alert("Unable to connect to backend");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    if (googleLoading || loading) return;

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
        alert(data.detail || "Google signup failed");
        setGoogleLoading(false);
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      console.error("Google signup error:", error);
      alert("Unable to connect to backend");
      setGoogleLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
    >
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 sm:px-6 py-6">
        <div className="w-full max-w-sm bg-black border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl">

          <h1 className="text-xl sm:text-2xl font-normal text-center">
            Create Account
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm text-center mt-1 mb-5">
            Join TalentIQ
          </p>

          <form onSubmit={handleSignup} className="space-y-4">

            <div>
              <label className="block text-xs sm:text-sm mb-1.5">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm mb-1.5">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm mb-1.5">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="new-password"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 text-black py-2.5 rounded-lg font-normal text-xs sm:text-sm transition"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-slate-700 flex-1"></div>

            <span className="text-slate-500 text-xs">
              OR
            </span>

            <div className="h-px bg-slate-700 flex-1"></div>
          </div>

          <div className="flex justify-center">
            {googleLoading ? (
              <p className="text-slate-400 text-xs">
                Signing up with Google...
              </p>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSignup}
                onError={() => {
                  console.error("Google Signup Failed");
                  alert("Google signup failed");
                  setGoogleLoading(false);
                }}
                theme="outline"
                size="large"
                width="220"
                text="continue_with"
                shape="rectangular"
              />
            )}
          </div>

          <p className="text-center text-slate-400 text-xs sm:text-sm mt-5">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Login
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