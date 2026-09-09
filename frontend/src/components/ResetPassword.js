"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            new_password: newPassword,
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
        alert(data.detail || "Password reset failed");
        setLoading(false);
        return;
      }

      alert("Password reset successfully.");

      router.replace("/login");
    } catch (error) {
      console.error("Reset password error:", error);
      alert("Unable to connect to backend");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl">

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center">
          Reset Password
        </h1>

        <p className="text-slate-400 text-sm sm:text-base text-center mt-2 mb-6">
          Enter the OTP and your new password
        </p>

        {/* Form */}
        <form onSubmit={handleResetPassword} className="space-y-5">

          {/* Email */}
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

          {/* OTP */}
          <div>
            <label className="block text-sm sm:text-base mb-2">
              OTP
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              placeholder="Enter 6-digit OTP"
              inputMode="numeric"
              maxLength={6}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm sm:text-base outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm sm:text-base mb-2">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm sm:text-base outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Reset Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 text-black py-3 rounded-lg font-semibold text-sm sm:text-base transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-sm sm:text-base text-cyan-400 hover:text-cyan-300"
          >
            Back to Login
          </Link>
        </div>

        {/* Back to Home */}
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

export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <p className="text-slate-400">Loading...</p>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}