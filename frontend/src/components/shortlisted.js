
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faArrowLeft,
  faRightFromBracket,
  faUserCheck,
  faIdBadge,
  faBriefcase,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Shortlisted() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    try {
      const res = await fetch(`${API_URL}/applications`);

      if (!res.ok) {
        throw new Error();
      }

      const applications = await res.json();

      const shortlisted = applications.filter((app) => {
        if (!app.recommendation) return false;

        try {
          const data = JSON.parse(app.recommendation);

          return (
            data.recommendation?.trim().toUpperCase() ===
            "RECOMMENDED"
          );
        } catch {
          const text = app.recommendation.trim().toUpperCase();

          return (
            text.includes("RECOMMENDED") &&
            !text.includes("NOT RECOMMENDED")
          );
        }
      });

      shortlisted.sort(
        (a, b) =>
          Number(b.match_score || 0) -
          Number(a.match_score || 0)
      );

      setCandidates(shortlisted);
    } catch (err) {
      console.error(err);
      setError("Unable to load shortlisted candidates.");
    } finally {
      setLoading(false);
    }
  }

  function matchScore(value) {
    const n = Number(value);

    if (
      value === null ||
      value === undefined ||
      isNaN(n)
    ) {
      return "N/A";
    }

    return n <= 1
      ? `${(n * 100).toFixed(2)}%`
      : `${n.toFixed(2)}%`;
  }

  const filtered = candidates.filter((candidate) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    if (/^\d+$/.test(q)) {
      return String(candidate.candidate_id) === q;
    }

    const text = [
      candidate.application_status,
      candidate.recommendation,
    ]
      .filter(Boolean)
      .flatMap((v) => (Array.isArray(v) ? v : [v]))
      .join(" ")
      .toLowerCase();

    return text.includes(q);
  });

  return (
    <main className="min-h-screen bg-[#050816] text-white flex flex-col">
      <Navbar />

      <section className="flex-1 w-full max-w-[1600px] mx-auto p-5 sm:p-6 md:p-8 lg:p-10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-5 transition text-sm"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </Link>

        <p className="text-cyan-400 font-semibold text-xs sm:text-sm">
          RECRUITMENT
        </p>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 break-words">
          Shortlisted Candidates
        </h1>

        <p className="text-sm sm:text-base text-gray-400 mt-2 mb-5">
          Candidates recommended by the AI system.
        </p>

        <div className="relative w-full max-w-3xl mb-5">
          <FontAwesomeIcon
            icon={faIdBadge}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Candidate ID, status or recommendation"
            className="w-full bg-[#0b1020] rounded-lg py-3 pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-400/30"
          />
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Shortlisted Candidates:{" "}
          <span className="text-white font-bold">
            {filtered.length}
          </span>
        </p>

        {loading && (
          <p className="text-cyan-400 text-sm">
            Loading shortlisted candidates...
          </p>
        )}

        {error && (
          <p className="text-red-400 text-sm">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
              {filtered.map((candidate) => (
                <div
                  key={candidate.application_id}
                  className="bg-[#0b1020] rounded-xl p-4 sm:p-5 min-h-[300px] flex flex-col overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-cyan-400/10 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon
                        icon={faUserCheck}
                        className="text-cyan-400 text-base sm:text-lg"
                      />
                    </div>

                    <span className="text-green-400 text-[11px] sm:text-xs font-semibold whitespace-nowrap">
                      RECOMMENDED
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold mt-3 break-words">
                    Candidate #{candidate.candidate_id}
                  </h2>

                  <div className="space-y-4 mt-5 flex-1 min-w-0">
                    <Info
                      icon={faIdBadge}
                      label="Application ID"
                      value={`#${candidate.application_id}`}
                    />

                    <Info
                      icon={faBriefcase}
                      label="Job ID"
                      value={`#${candidate.job_id}`}
                    />

                    <Info
                      icon={faChartLine}
                      label="Match Score"
                      value={matchScore(candidate.match_score)}
                      highlight
                    />
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/5">
                    <p className="text-green-400 font-semibold text-xs sm:text-sm">
                      AI Recommended
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        {!loading &&
          !error &&
          filtered.length === 0 && (
            <div className="text-center py-14 px-4">
              <FontAwesomeIcon
                icon={faUserCheck}
                className="text-4xl text-gray-600 mb-3"
              />

              <h2 className="text-lg sm:text-xl font-bold">
                No Shortlisted Candidates
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                No candidates match your search.
              </p>
            </div>
          )}
      </section>

      <Footer />
    </main>
  );
}

function Navbar() {
  return (
    <nav className="bg-[#080c1a] px-5 sm:px-6 md:px-10 py-4 flex justify-between items-center gap-4">
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 min-w-0"
      >
        <FontAwesomeIcon
          icon={faBrain}
          className="text-cyan-400 text-lg sm:text-xl shrink-0"
        />

        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold">
            Talent
            <span className="text-cyan-400">IQ</span>
          </h1>

          <p className="text-[9px] sm:text-[10px] text-gray-500">
            TALENT INTELLIGENCE
          </p>
        </div>
      </Link>

      <Link
        href="/"
        className="flex items-center gap-2 text-gray-400 hover:text-white text-xs sm:text-sm shrink-0 transition"
      >
        <FontAwesomeIcon icon={faRightFromBracket} />
        <span>Logout</span>
      </Link>
    </nav>
  );
}

function Info({ icon, label, value, highlight }) {
  return (
    <div className="flex gap-2.5 min-w-0">
      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 mt-1 shrink-0 text-sm"
      />

      <div className="min-w-0 flex-1">
        <p className="text-[11px] sm:text-xs text-gray-500">
          {label}
        </p>

        <p
          className={
            highlight
              ? "text-cyan-400 text-sm sm:text-base font-bold break-words"
              : "text-gray-300 text-sm sm:text-base font-semibold break-words"
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-[#080c1a] py-3 text-center text-gray-600 text-[11px] sm:text-xs mt-6">
      TalentIQ — AI-Powered Recruitment Platform
    </footer>
  );
}

