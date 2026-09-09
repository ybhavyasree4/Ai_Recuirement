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

    // Numeric search = exact Candidate ID
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
    <main className="min-h-screen w-full bg-[#050816] text-white flex flex-col">

      <Navbar />

      <section className="flex-1 w-full px-5 sm:px-7 md:px-10 lg:px-14 py-7 md:py-10 pb-24">

        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6 text-base md:text-lg"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </Link>

        <p className="text-cyan-400 font-semibold text-base">
          RECRUITMENT TOOL
        </p>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2">
          Candidate Ranking
        </h1>

        <p className="text-gray-400 text-base md:text-lg mt-2 mb-7">
          Candidates ranked based on their match score.
        </p>

        {/* SEARCH */}

        <div className="relative w-full max-w-3xl mb-7">

          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Candidate ID, Job ID, Application ID or recommendation"
            className="w-full bg-[#0b1020] rounded-lg py-4 pl-11 pr-4 text-base md:text-lg text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-cyan-400"
          />

        </div>

        {error && (
          <p className="text-red-400 text-lg mb-5">
            {error}
          </p>
        )}

        {!error && (
          <div className="bg-[#0b1020] rounded-xl p-5 sm:p-6">

            {/* HEADER */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                  <FontAwesomeIcon
                    icon={faChartLine}
                    className="text-cyan-400 text-xl"
                  />

                </div>

                <div>

                  <h2 className="text-xl md:text-2xl font-bold">
                    Ranked Candidates
                  </h2>

                  <p className="text-sm md:text-base text-gray-500">
                    Highest match score first
                  </p>

                </div>

              </div>

              <p className="text-gray-400 text-base">
                Candidates:{" "}
                <span className="text-cyan-400 font-bold">
                  {loading ? "..." : filtered.length}
                </span>
              </p>

            </div>

            {/* LOADING */}

            {loading && (
              <div className="py-12 text-center">
                <p className="text-cyan-400 text-lg">
                  Loading ranking data...
                </p>
              </div>
            )}

            {/* CARDS */}

            {!loading && filtered.length > 0 && (

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

                {filtered.map((application, index) => (

                  <div
                    key={
                      application.application_id ||
                      index
                    }
                    className="bg-[#080c1a] rounded-xl p-5 min-h-[330px] flex flex-col"
                  >

                    {/* RANK */}

                    <div className="flex items-center justify-between">

                      <div className="w-11 h-11 rounded-lg bg-cyan-400/10 flex items-center justify-center">

                        <span className="text-cyan-400 text-lg font-bold">
                          #{index + 1}
                        </span>

                      </div>

                      <span className="text-cyan-400 text-xl font-bold">
                        {formatScore(
                          application.match_score
                        )}
                      </span>

                    </div>

                    {/* CANDIDATE */}

                    <h3 className="text-xl font-bold mt-5">
                      Candidate #{application.candidate_id}
                    </h3>

                    {/* DETAILS */}

                    <div className="space-y-4 mt-5 flex-1">

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

            {/* EMPTY */}

            {!loading && filtered.length === 0 && (

              <div className="py-16 text-center">

                <h2 className="text-2xl font-bold">
                  No candidates found
                </h2>

                <p className="text-gray-500 text-base mt-2">
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

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p
        className={
          highlight
            ? "text-cyan-400 text-lg font-bold mt-1"
            : "text-gray-300 text-base md:text-lg font-semibold mt-1 break-words"
        }
      >
        {value}
      </p>

    </div>
  );
}

function Navbar() {
  return (
    <nav className="bg-[#080c1a] px-5 sm:px-7 md:px-10 py-5 flex justify-between items-center">

      <Link
        href="/dashboard"
        className="flex items-center gap-3"
      >

        <FontAwesomeIcon
          icon={faBrain}
          className="text-cyan-400 text-2xl"
        />

        <div>

          <h1 className="text-2xl font-bold">
            Talent<span className="text-cyan-400">
              IQ
            </span>
          </h1>

          <p className="text-xs text-gray-500">
            TALENT INTELLIGENCE
          </p>

        </div>

      </Link>

      <Link
        href="/"
        className="flex items-center gap-2 text-base md:text-lg text-gray-400 hover:text-white"
      >
        <FontAwesomeIcon icon={faRightFromBracket} />
        Logout
      </Link>

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