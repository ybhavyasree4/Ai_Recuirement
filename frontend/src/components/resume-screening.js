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
    <main className="min-h-screen w-full bg-[#050816] text-white flex flex-col">
      <Navbar />

      <section className="flex-1 w-full px-6 md:px-10 lg:px-14 py-8 pb-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 text-lg text-gray-400 hover:text-cyan-400 transition mb-8"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <p className="text-cyan-400 text-lg font-semibold uppercase">
            Recruitment Tool
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            Resume Screening
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mt-3">
            Upload a resume to analyze and create a candidate profile.
          </p>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-5xl bg-[#0b1020] rounded-xl px-8 md:px-12 py-10">
            <label
              htmlFor="resume-upload"
              className="block cursor-pointer"
            >
              <div className="bg-[#080c1a] rounded-xl p-12 md:p-16 text-center hover:bg-[#0d1428] transition">
                <div className="w-20 h-20 rounded-xl bg-cyan-400/10 flex items-center justify-center mx-auto mb-6">
                  <FontAwesomeIcon
                    icon={faFilePdf}
                    className="text-cyan-400 text-4xl"
                  />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold">
                  Upload Resume
                </h2>

                <p className="text-xl text-gray-400 mt-4">
                  Select a PDF or Word document
                </p>

                <p className="text-lg text-gray-500 mt-2">
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

            {file && (
              <div className="mt-6 bg-[#080c1a] rounded-xl p-6">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-cyan-400/10 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon
                      icon={faFilePdf}
                      className="text-cyan-400 text-2xl"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xl font-semibold break-words">
                      {file.name}
                    </p>

                    <p className="text-lg text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full mt-6 bg-cyan-400 hover:bg-cyan-300 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold text-xl py-5 rounded-xl transition flex items-center justify-center gap-3"
            >
              <FontAwesomeIcon icon={faUpload} />

              {uploading
                ? "Uploading..."
                : "Upload Resume"}
            </button>

            {message && (
              <div className="mt-6 flex items-start gap-3 p-5 rounded-xl bg-green-500/10 text-green-400">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="mt-1 shrink-0"
                />

                <p className="text-lg break-words">
                  {message}
                </p>
              </div>
            )}

            {error && (
              <div className="mt-6 flex items-start gap-3 p-5 rounded-xl bg-red-500/10 text-red-400">
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="mt-1 shrink-0"
                />

                <p className="text-lg break-words">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {profile && (
          <div className="w-full flex justify-center">
            <div className="mt-6 w-full max-w-5xl bg-[#0b1020] rounded-xl px-8 md:px-12 py-8">
              <div className="flex items-center gap-4 mb-7">
                <div className="w-14 h-14 rounded-xl bg-cyan-400/10 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-cyan-400 text-2xl"
                  />
                </div>

                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Candidate Profile
                  </h2>

                  <p className="text-base md:text-lg text-gray-500 mt-1">
                    Extracted information
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Object.entries(profile).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="bg-[#080c1a] rounded-xl px-5 py-5 min-h-[150px] flex flex-col overflow-hidden"
                    >
                      <p className="text-sm text-cyan-400 uppercase font-semibold">
                        {key.replaceAll("_", " ")}
                      </p>

                      <p className="text-lg text-gray-300 mt-3 break-words">
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

function Navbar() {
  return (
    <nav className="bg-[#080c1a] w-full shrink-0">
      <div className="w-full px-6 md:px-10 lg:px-14 py-5 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-xl bg-cyan-400/10 flex items-center justify-center">
            <FontAwesomeIcon
              icon={faBrain}
              className="text-cyan-400 text-2xl"
            />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Talent<span className="text-cyan-400">IQ</span>
            </h1>

            <p className="text-xs text-gray-500">
              TALENT INTELLIGENCE
            </p>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 text-lg text-gray-400 hover:text-white transition"
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

function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#080c1a] py-3 text-center text-gray-600 text-sm z-50">
      TalentIQ — AI-Powered Recruitment Platform
    </footer>
  );
}