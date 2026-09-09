"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faFilePdf,
  faUpload,
  faCheckCircle,
  faExclamationCircle,
  faArrowLeft,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ResumeScreening() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [".pdf", ".doc", ".docx"];

    const extension = selected.name
      .toLowerCase()
      .slice(selected.name.lastIndexOf("."));

    if (
      !allowedTypes.includes(selected.type) &&
      !allowedExtensions.includes(extension)
    ) {
      setError("Please select a PDF or Word resume.");
      setFile(null);
      setMessage("");
      setProfile(null);
      return;
    }

    setFile(selected);
    setMessage("");
    setError("");
    setProfile(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume first.");
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");
    setProfile(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/upload-resume`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Resume upload failed."
        );
      }

      setMessage(
        data.message || "Resume uploaded successfully."
      );

      if (data.profile) {
        setProfile(data.profile);
      } else if (data.candidate) {
        setProfile(data.candidate);
      }

      if (data.existing !== true) {
        window.dispatchEvent(
          new Event("candidateUpdated")
        );

        localStorage.setItem(
          "candidateUpdated",
          Date.now().toString()
        );

        setFile(null);

        const input =
          document.getElementById("resume-upload");

        if (input) {
          input.value = "";
        }
      }
    } catch (err) {
      console.error("Resume upload error:", err);

      setError(
        err.message || "Unable to upload resume."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#050816] text-white flex flex-col overflow-x-hidden">
      <Navbar />

      <section className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 pb-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition mb-5"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </Link>

        <div className="mb-6">
          <p className="text-cyan-400 text-xs sm:text-sm font-semibold uppercase">
            Recruitment Tool
          </p>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1.5">
            Resume Screening
          </h1>

          <p className="text-sm sm:text-base text-gray-400 mt-1.5">
            Upload a resume to analyze and create a candidate profile.
          </p>
        </div>

        {/* Upload Section */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-5xl bg-[#0b1020] rounded-xl p-4 sm:p-5 md:p-6">
            <label
              htmlFor="resume-upload"
              className="block cursor-pointer"
            >
              <div className="bg-[#080c1a] rounded-xl p-8 sm:p-10 md:p-12 text-center hover:bg-[#0d1428] transition">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-cyan-400/10 flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon
                    icon={faFilePdf}
                    className="text-cyan-400 text-2xl sm:text-3xl"
                  />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold">
                  Upload Resume
                </h2>

                <p className="text-sm sm:text-base text-gray-400 mt-2">
                  Select a PDF or Word document
                </p>

                <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
                  Supported formats: .pdf, .doc, .docx
                </p>

                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </label>

            {/* Selected File */}
            {file && (
              <div className="mt-4 bg-[#080c1a] rounded-xl p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-cyan-400/10 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon
                      icon={faFilePdf}
                      className="text-cyan-400 text-lg"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-semibold break-words">
                      {file.name}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full mt-4 bg-cyan-400 hover:bg-cyan-300 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold text-sm sm:text-base py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faUpload} />

              {uploading
                ? "Uploading..."
                : "Upload Resume"}
            </button>

            {/* Success Message */}
            {message && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-green-500/10 text-green-400">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="mt-0.5 shrink-0 text-sm"
                />

                <p className="text-xs sm:text-sm break-words">
                  {message}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 text-red-400">
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="mt-0.5 shrink-0 text-sm"
                />

                <p className="text-xs sm:text-sm break-words">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Candidate Profile */}
        {profile && (
          <div className="w-full flex justify-center">
            <div className="mt-5 w-full max-w-5xl bg-[#0b1020] rounded-xl p-4 sm:p-5 md:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-cyan-400/10 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-cyan-400 text-lg"
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold">
                    Candidate Profile
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Extracted information
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(profile).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="bg-[#080c1a] rounded-xl px-4 py-4 min-h-[130px] flex flex-col overflow-hidden"
                    >
                      <p className="text-[10px] sm:text-[11px] text-cyan-400 uppercase font-semibold break-words">
                        {key.replaceAll("_", " ")}
                      </p>

                      <p className="text-xs sm:text-sm text-gray-300 mt-2 break-words leading-5">
                        {Array.isArray(value)
                          ? value.join(", ")
                          : typeof value === "object" &&
                            value !== null
                          ? JSON.stringify(value)
                          : String(
                              value ?? "Not available"
                            )}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

/* =========================
   NAVBAR
========================= */

function Navbar() {
  return (
    <nav className="bg-[#080c1a] w-full shrink-0">
      <div className="w-full px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 min-w-0"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-400/10 flex items-center justify-center shrink-0">
            <FontAwesomeIcon
              icon={faBrain}
              className="text-cyan-400 text-lg sm:text-xl"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold">
              Talent
              <span className="text-cyan-400">
                IQ
              </span>
            </h1>

            <p className="text-[9px] sm:text-[10px] text-gray-500">
              TALENT INTELLIGENCE
            </p>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-white transition shrink-0"
        >
          <FontAwesomeIcon icon={faRightFromBracket} />

          <span className="hidden sm:block">
            Logout
          </span>
        </Link>
      </div>
    </nav>
  );
}

/* =========================
   FOOTER
========================= */

function Footer() {
  return (
    <footer className="w-full bg-[#080c1a] py-3 text-center text-gray-600 text-[11px] sm:text-xs mt-8">
      TalentIQ — AI-Powered Recruitment Platform
    </footer>
  );
}