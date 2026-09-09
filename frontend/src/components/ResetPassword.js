"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 sm:px-6 py-6">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-normal text-center">
          Reset Password
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm text-center mt-1 mb-5">
          Enter the OTP and your new password
        </p>

        <form onSubmit={handleResetPassword} className="space-y-4">
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
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm mb-1.5">
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
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm mb-1.5">
              New Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 pr-10 text-xs sm:text-sm outline-none focus:border-cyan-400 transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  className="text-sm"
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed text-black py-2.5 rounded-lg font-normal text-xs sm:text-sm transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          {loading && (
            <p className="text-center text-[11px] text-slate-500">
              Please wait while your password is being reset.
            </p>
          )}
        </form>

        <div className="text-center mt-5">
          <Link
            href="/login"
            className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300"
          >
            Back to Login
          </Link>
        </div>

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

export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <p className="text-slate-400 text-sm">
            Loading...
          </p>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}