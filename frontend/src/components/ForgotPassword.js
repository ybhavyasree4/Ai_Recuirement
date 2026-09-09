
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Unable to send reset OTP");
        setLoading(false);
        return;
      }

      alert("Password reset OTP sent to your email.");

      router.push(
        `/reset-password?email=${encodeURIComponent(email.trim())}`
      );
    } catch (error) {
      console.error("Forgot password error:", error);
      alert("Unable to connect to backend");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 sm:px-6 py-6">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-normal text-center">
          Forgot Password
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm text-center mt-1 mb-5">
          Enter your email to receive a reset OTP
        </p>

        <form onSubmit={handleForgotPassword} className="space-y-4">
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
              disabled={loading}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-cyan-400 transition disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed text-black py-2.5 rounded-lg font-normal text-xs sm:text-sm transition"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          {loading && (
            <p className="text-center text-[11px] text-slate-500">
              Please wait...
            </p>
          )}
        </form>

        <p className="text-center text-slate-400 text-xs sm:text-sm mt-5">
          Remember your password?{" "}
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
  );
}