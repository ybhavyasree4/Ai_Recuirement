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
            email,
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
        alert(data.detail || "Unable to send reset OTP");
        setLoading(false);
        return;
      }

      alert("Password reset OTP sent to your email.");

      router.push(
        `/reset-password?email=${encodeURIComponent(email)}`
      );
    } catch (error) {
      console.error("Forgot password error:", error);
      alert("Unable to connect to backend");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">
          Forgot Password
        </h1>

        <p className="text-slate-400 text-sm sm:text-base text-center mt-2 mb-6">
          Enter your email to receive a reset OTP
        </p>

        <form onSubmit={handleForgotPassword} className="space-y-5">
          <div>
            <label className="block text-sm sm:text-base mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm sm:text-base outline-none focus:border-cyan-400 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 text-black py-3 rounded-lg font-semibold text-sm sm:text-base transition"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm sm:text-base mt-6">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-cyan-400 hover:text-cyan-300"
          >
            Login
          </Link>
        </p>

        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-sm sm:text-base text-slate-500 hover:text-white transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}