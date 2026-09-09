"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faArrowLeft,
  faRightFromBracket,
  faMagnifyingGlass,
  faCheckCircle,
  faXmarkCircle,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SkillGap() {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/applications`);

      if (!res.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await res.json();

      data.sort(
        (a, b) =>
          Number(a.candidate_id || 0) -
          Number(b.candidate_id || 0)
      );

      setApplications(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load skill gap data.");
    } finally {
      setLoading(false);
    }
  }

  function formatSkills(value) {
    if (!value) return "No skills available";

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    return String(value);
  }

  function skillScore(value) {
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
      app.application_status,
      app.matched_skills,
      app.missing_skills,
      app.related_skils_in_job,
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
          Skill Gap Analysis
        </h1>

        <p className="text-gray-400 text-sm sm:text-base mt-2 mb-5 font-normal">
          Select a candidate to view matched and missing skills.
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
            placeholder="Search by Candidate ID, Job ID, skills or status"
            className="w-full bg-[#0b1020] rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-5 font-normal">
            {error}
          </p>
        )}

        {!error && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-[#0b1020] rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-normal">
                  Candidates
                </h2>

                <span className="text-xs text-cyan-400 font-normal">
                  {loading ? "..." : filtered.length}
                </span>
              </div>

              {loading ? (
                <div className="min-h-[300px] flex flex-col items-center justify-center text-center px-3">
                  <p className="text-sm text-gray-400 font-normal">
                    Loading candidates...
                  </p>

                  <p className="text-[11px] text-gray-600 mt-1 font-normal">
                    Please wait while candidate data is loaded.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filtered.map((app) => (
                    <button
                      key={app.application_id}
                      onClick={() => setSelected(app)}
                      className={`w-full text-left rounded-lg p-3 transition ${
                        selected?.application_id ===
                        app.application_id
                          ? "bg-cyan-400/10"
                          : "bg-[#080c1a] hover:bg-cyan-400/5"
                      }`}
                    >
                      <p
                        className={`text-sm font-normal ${
                          selected?.application_id ===
                          app.application_id
                            ? "text-cyan-400"
                            : "text-gray-200"
                        }`}
                      >
                        Candidate #{app.candidate_id}
                      </p>

                      <p className="text-xs text-gray-500 mt-1 font-normal">
                        Job #{app.job_id}
                      </p>

                      <p className="text-[11px] text-gray-600 mt-1 font-normal">
                        Application #{app.application_id}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8 font-normal">
                  No candidates found.
                </p>
              )}
            </div>

            <div className="lg:col-span-3">
              <div className="bg-[#0b1020] rounded-xl p-4 sm:p-5 md:p-6 min-h-[600px]">
                {!selected ? (
                  <div className="min-h-[500px] flex items-center justify-center text-center px-4">
                    <div className="max-w-2xl">
                      <h2 className="text-2xl sm:text-3xl font-normal">
                        Skill Gap Analysis
                      </h2>

                      <p className="text-gray-400 text-sm sm:text-base mt-3 leading-6 font-normal">
                        Identify the skills a candidate already has
                        and the skills they need to develop for a
                        specific job.
                      </p>

                      <p className="text-cyan-400 text-sm font-normal mt-5">
                        Select a candidate to view their skill gap.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-5">
                      <p className="text-cyan-400 text-[11px] font-normal uppercase">
                        Candidate #{selected.candidate_id}
                      </p>

                      <h2 className="text-xl sm:text-2xl font-normal mt-1">
                        Skill Gap Analysis
                      </h2>

                      <p className="text-gray-400 text-xs sm:text-sm mt-2 font-normal">
                        Job #{selected.job_id} · Application #
                        {selected.application_id}
                      </p>
                    </div>

                    <div className="bg-[#080c1a] rounded-xl p-4 sm:p-5 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-green-400 text-base"
                        />

                        <h3 className="text-base sm:text-lg font-normal text-green-400">
                          Matched Skills
                        </h3>
                      </div>

                      <p className="text-gray-300 text-xs sm:text-sm leading-6 break-words font-normal">
                        {formatSkills(
                          selected.matched_skills ||
                          selected.related_skils_in_job
                        )}
                      </p>
                    </div>

                    <div className="bg-[#080c1a] rounded-xl p-4 sm:p-5 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon
                          icon={faXmarkCircle}
                          className="text-red-400 text-base"
                        />

                        <h3 className="text-base sm:text-lg font-normal text-red-400">
                          Missing Skills
                        </h3>
                      </div>

                      <p className="text-gray-300 text-xs sm:text-sm leading-6 break-words font-normal">
                        {formatSkills(
                          selected.missing_skills
                        )}
                      </p>
                    </div>

                    <div className="bg-[#080c1a] rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faChartLine}
                          className="text-cyan-400 text-base"
                        />

                        <h3 className="text-base sm:text-lg font-normal text-cyan-400">
                          Skill Match Percentage
                        </h3>
                      </div>

                      <p className="text-3xl sm:text-4xl font-normal text-cyan-400 mt-2">
                        {skillScore(
                          selected.skill_match_percentage
                        )}
                      </p>
                    </div>
                  </>
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