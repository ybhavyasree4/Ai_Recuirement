"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faArrowLeft,
  faChartLine,
  faRightFromBracket,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Ranking() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/applications`);

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();

      data.sort(
        (a, b) =>
          Number(b.match_score || 0) -
          Number(a.match_score || 0)
      );

      setApplications(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load ranking data.");
    } finally {
      setLoading(false);
    }
  }

  function formatScore(value) {
    const n = Number(value);

    if (
      value === null ||
      value === undefined ||
      isNaN(n)
    ) {
      return "N/A";
    }

    return `${n.toFixed(2)}%`;
  }

  function formatRecommendation(value) {
    if (!value) return "Not available";

    if (typeof value === "string") {
      try {
        const data = JSON.parse(value);

        if (typeof data === "object") {
          return (
            data.recommendation ||
            data.message ||
            value
          );
        }

        return value;
      } catch {
        return value;
      }
    }

    if (typeof value === "object") {
      return (
        value.recommendation ||
        value.message ||
        JSON.stringify(value)
      );
    }

    return String(value);
  }

  const filtered = applications.filter((app) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    if (/^\d+$/.test(q)) {
      return String(app.candidate_id) === q;
    }

    const text = [
      app.candidate_id,
      app.job_id,
      app.application_id,
      app.match_score,
      app.application_status,
      app.recommendation,
      app.matched_skills,
      app.missing_skills,
    ]
      .filter(Boolean)
      .flatMap((v) =>
        Array.isArray(v) ? v : [v]
      )
      .join(" ")
      .toLowerCase();

    return text.includes(q);
  });

  return (
    <main className="min-h-screen w-full bg-[#050816] text-white flex flex-col overflow-x-hidden">
      <Navbar />

      <section className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 pb-10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 mb-5"
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="text-xs"
          />
          Back to Dashboard
        </Link>

        <p className="text-cyan-400 font-normal text-xs sm:text-sm uppercase">
          Recruitment Tool
        </p>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal mt-1">
          Candidate Ranking
        </h1>

        <p className="text-gray-400 text-sm sm:text-base mt-2 mb-5 font-normal">
          Candidates ranked based on their match score.
        </p>

        <div className="relative w-full max-w-3xl mb-5">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Candidate ID, Job ID, Application ID or recommendation"
            className="w-full bg-[#0b1020] rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-5 font-normal">
            {error}
          </p>
        )}

        {!error && (
          <div className="bg-[#0b1020] rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faChartLine}
                    className="text-cyan-400 text-lg"
                  />
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-normal">
                    Ranked Candidates
                  </h2>

                  <p className="text-xs text-gray-500 font-normal">
                    Highest match score first
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-400 font-normal">
                Candidates:{" "}
                <span className="text-cyan-400 font-normal">
                  {loading ? "..." : filtered.length}
                </span>
              </p>
            </div>

            {loading && (
              <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
                <p className="text-sm text-gray-400 font-normal">
                  Loading ranking data...
                </p>

                <p className="text-[11px] text-gray-600 mt-1 font-normal">
                  Please wait while candidate ranking is loaded.
                </p>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map((application, index) => (
                  <div
                    key={
                      application.application_id ||
                      index
                    }
                    className="bg-[#080c1a] rounded-xl p-4 min-h-[260px] flex flex-col overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                        <span className="text-cyan-400 text-sm font-normal">
                          #{index + 1}
                        </span>
                      </div>

                      <span className="text-cyan-400 text-lg font-normal">
                        {formatScore(
                          application.match_score
                        )}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-normal mt-4 break-words">
                      Candidate #{application.candidate_id}
                    </h3>

                    <div className="space-y-3 mt-4 flex-1">
                      <Info
                        label="Application ID"
                        value={`#${application.application_id}`}
                      />

                      <Info
                        label="Job ID"
                        value={`#${application.job_id}`}
                      />

                      <Info
                        label="Match Score"
                        value={formatScore(
                          application.match_score
                        )}
                        highlight
                      />

                      <Info
                        label="Recommendation"
                        value={formatRecommendation(
                          application.recommendation
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="py-12 text-center">
                <h2 className="text-lg sm:text-xl font-normal">
                  No candidates found
                </h2>

                <p className="text-xs text-gray-500 mt-2 font-normal">
                  No ranking results match your search.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function Info({ label, value, highlight }) {
  return (
    <div>
      <p className="text-[10px] sm:text-[11px] text-gray-500 font-normal">
        {label}
      </p>

      <p
        className={
          highlight
            ? "text-cyan-400 text-sm sm:text-base font-normal mt-1 break-words"
            : "text-gray-300 text-xs sm:text-sm font-normal mt-1 break-words"
        }
      >
        {value}
      </p>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="bg-[#080c1a] w-full shrink-0">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-3 flex justify-between items-center">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center">
            <FontAwesomeIcon
              icon={faBrain}
              className="text-cyan-400 text-lg"
            />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-normal">
              Talent<span className="text-cyan-400">IQ</span>
            </h1>

            <p className="text-[9px] text-gray-500">
              TALENT INTELLIGENCE
            </p>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <FontAwesomeIcon
            icon={faRightFromBracket}
            className="text-xs"
          />

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
    <footer className="w-full bg-[#080c1a] py-3 text-center text-gray-600 text-[11px] sm:text-xs mt-8">
      TalentIQ — AI-Powered Recruitment Platform
    </footer>
  );
}