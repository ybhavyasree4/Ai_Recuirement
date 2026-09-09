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
  faCheckCircle,
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
      if (!res.ok) throw new Error();

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
          const text = app.recommendation
            .trim()
            .toUpperCase();

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

    if (value === null || value === undefined || isNaN(n))
      return "N/A";

    return n <= 1
      ? `${(n * 100).toFixed(2)}%`
      : `${n.toFixed(2)}%`;
  }

  function skillScore(value) {
    const n = Number(value);

    if (value === null || value === undefined || isNaN(n))
      return "N/A";

    return `${n.toFixed(2)}%`;
  }

  // FIXED SEARCH
  const filtered = candidates.filter((candidate) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    // Numeric search = exact Candidate ID
    if (/^\d+$/.test(q)) {
      return String(candidate.candidate_id) === q;
    }

    // Text search
    const text = [
      candidate.application_status,
      candidate.recommendation,
      candidate.matched_skills,
      candidate.missing_skills,
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
    <main className="min-h-screen bg-[#050816] text-white flex flex-col">
      <Navbar />

      <section className="flex-1 p-6 md:p-10">

        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </Link>

        <p className="text-cyan-400 font-semibold">
          RECRUITMENT
        </p>

        <h1 className="text-4xl md:text-5xl font-bold mt-2">
          Shortlisted Candidates
        </h1>

        <p className="text-lg text-gray-400 mt-2 mb-6">
          Candidates recommended by the AI system.
        </p>

        {/* SEARCH */}

        <div className="relative max-w-3xl mb-6">

          <FontAwesomeIcon
            icon={faIdBadge}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Candidate ID, status, skills or recommendation"
            className="w-full bg-[#0b1020] rounded-lg py-4 pl-11 pr-4 text-lg text-white outline-none"
          />

        </div>

        {/* COUNT */}

        <p className="text-gray-400 mb-5">
          Shortlisted Candidates:{" "}
          <span className="text-white font-bold">
            {filtered.length}
          </span>
        </p>

        {loading && (
          <p className="text-cyan-400 text-lg">
            Loading shortlisted candidates...
          </p>
        )}

        {error && (
          <p className="text-red-400 text-lg">
            {error}
          </p>
        )}

        {/* CARDS */}

        {!loading &&
          !error &&
          filtered.length > 0 && (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {filtered.map((candidate) => (

                <div
                  key={candidate.application_id}
                  className="bg-[#0b1020] rounded-xl p-5 h-[330px] flex flex-col"
                >

                  <div className="flex items-center justify-between">

                    <div className="w-12 h-12 rounded-full bg-cyan-400/10 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faUserCheck}
                        className="text-cyan-400 text-xl"
                      />
                    </div>

                    <span className="text-green-400 text-sm font-semibold">
                      RECOMMENDED
                    </span>

                  </div>

                  <h2 className="text-xl font-bold mt-4">
                    Candidate #{candidate.candidate_id}
                  </h2>

                  <div className="space-y-4 mt-5 flex-1">

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
                      value={matchScore(
                        candidate.match_score
                      )}
                      highlight
                    />

                    <Info
                      icon={faCheckCircle}
                      label="Skill Match"
                      value={skillScore(
                        candidate.skill_match_percentage
                      )}
                    />

                  </div>

                  <p className="text-green-400 font-semibold">
                    AI Recommended
                  </p>

                </div>

              ))}

            </div>
          )}

        {!loading &&
          !error &&
          filtered.length === 0 && (

            <div className="text-center py-16">
              <FontAwesomeIcon
                icon={faUserCheck}
                className="text-5xl text-gray-600 mb-4"
              />

              <h2 className="text-2xl font-bold">
                No Shortlisted Candidates
              </h2>

              <p className="text-gray-500 mt-2">
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
    <nav className="bg-[#080c1a] px-6 md:px-10 py-5 flex justify-between items-center">

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
            Talent<span className="text-cyan-400">IQ</span>
          </h1>

          <p className="text-xs text-gray-500">
            TALENT INTELLIGENCE
          </p>

        </div>

      </Link>

      <Link
        href="/"
        className="flex items-center gap-2 text-gray-400 hover:text-white"
      >
        <FontAwesomeIcon icon={faRightFromBracket} />
        Logout
      </Link>

    </nav>
  );
}

function Info({ icon, label, value, highlight }) {
  return (
    <div className="flex gap-3">

      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 mt-1"
      />

      <div>

        <p className="text-sm text-gray-500">
          {label}
        </p>

        <p
          className={
            highlight
              ? "text-cyan-400 text-lg font-bold"
              : "text-gray-300 text-lg font-semibold"
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
    <footer className="fixed bottom-0 left-0 w-full bg-[#080c1a] py-3 text-center text-gray-600 text-sm z-50">
      TalentIQ — AI-Powered Recruitment Platform
    </footer>
  );
}