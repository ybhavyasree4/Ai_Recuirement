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
    <main className="min-h-screen w-full bg-[#050816] text-white flex flex-col">

      <Navbar />

      <section className="flex-1 w-full px-5 sm:px-7 md:px-10 lg:px-14 py-7 md:py-10 pb-20">

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
          Skill Gap Analysis
        </h1>

        <p className="text-gray-400 text-base md:text-lg mt-2 mb-7">
          Select a candidate to view matched and missing skills.
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
            placeholder="Search by Candidate ID, Job ID, skills or status"
            className="w-full bg-[#0b1020] rounded-lg py-4 pl-11 pr-4 text-base md:text-lg text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-cyan-400"
          />

        </div>

        {error && (
          <p className="text-red-400 text-lg mb-5">
            {error}
          </p>
        )}

        {!error && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

            {/* LEFT PANEL */}

            <div className="bg-[#0b1020] rounded-xl p-5">

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-xl font-bold">
                  Candidates
                </h2>

                <span className="text-cyan-400 font-bold">
                  {loading ? "..." : filtered.length}
                </span>

              </div>

              {loading ? (

                <p className="text-cyan-400 text-base text-center py-8">
                  Loading candidates...
                </p>

              ) : (

                <div className="space-y-3 max-h-[650px] overflow-y-auto">

                  {filtered.map((app) => (

                    <button
                      key={app.application_id}
                      onClick={() => setSelected(app)}
                      className={`w-full text-left rounded-lg p-4 transition ${
                        selected?.application_id ===
                        app.application_id
                          ? "bg-cyan-400/10"
                          : "bg-[#080c1a] hover:bg-cyan-400/5"
                      }`}
                    >

                      <p
                        className={`text-lg font-semibold ${
                          selected?.application_id ===
                          app.application_id
                            ? "text-cyan-400"
                            : "text-gray-200"
                        }`}
                      >
                        Candidate #{app.candidate_id}
                      </p>

                      <p className="text-base text-gray-500 mt-1">
                        Job #{app.job_id}
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        Application #{app.application_id}
                      </p>

                    </button>

                  ))}

                </div>

              )}

              {!loading && filtered.length === 0 && (
                <p className="text-gray-500 text-base text-center py-8">
                  No candidates found.
                </p>
              )}

            </div>

            {/* RIGHT PANEL */}

            <div className="lg:col-span-3">

              <div className="bg-[#0b1020] rounded-xl p-6 md:p-8 min-h-[650px]">

                {/* BEFORE CANDIDATE SELECTION */}

                {!selected ? (

                  <div className="min-h-[550px] flex items-center justify-center text-center">

                    <div className="max-w-2xl">

                      <h2 className="text-3xl md:text-4xl font-bold">
                        Skill Gap Analysis
                      </h2>

                      <p className="text-gray-400 text-lg md:text-xl mt-4 leading-8">
                        Identify the skills a candidate already has
                        and the skills they need to develop for a
                        specific job.
                      </p>

                      <p className="text-cyan-400 text-lg font-semibold mt-6">
                        Select a candidate to view their skill gap.
                      </p>

                    </div>

                  </div>

                ) : (

                  /* SELECTED CANDIDATE */

                  <>

                    <div className="mb-7">

                      <p className="text-cyan-400 text-sm font-semibold">
                        CANDIDATE #{selected.candidate_id}
                      </p>

                      <h2 className="text-2xl md:text-3xl font-bold mt-2">
                        Skill Gap Analysis
                      </h2>

                      <p className="text-gray-400 text-base md:text-lg mt-2">
                        Job #{selected.job_id} · Application #
                        {selected.application_id}
                      </p>

                    </div>

                    {/* MATCHED SKILLS */}

                    <div className="bg-[#080c1a] rounded-xl p-6 mb-5">

                      <div className="flex items-center gap-3 mb-5">

                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-green-400 text-xl"
                        />

                        <h3 className="text-xl font-bold text-green-400">
                          Matched Skills
                        </h3>

                      </div>

                      <p className="text-gray-300 text-base md:text-lg leading-7 break-words">
                        {formatSkills(
                          selected.matched_skills ||
                          selected.related_skils_in_job
                        )}
                      </p>

                    </div>

                    {/* MISSING SKILLS */}

                    <div className="bg-[#080c1a] rounded-xl p-6 mb-5">

                      <div className="flex items-center gap-3 mb-5">

                        <FontAwesomeIcon
                          icon={faXmarkCircle}
                          className="text-red-400 text-xl"
                        />

                        <h3 className="text-xl font-bold text-red-400">
                          Missing Skills
                        </h3>

                      </div>

                      <p className="text-gray-300 text-base md:text-lg leading-7 break-words">
                        {formatSkills(
                          selected.missing_skills
                        )}
                      </p>

                    </div>

                    {/* SKILL MATCH */}

                    <div className="bg-[#080c1a] rounded-xl p-6">

                      <div className="flex items-center gap-3">

                        <FontAwesomeIcon
                          icon={faChartLine}
                          className="text-cyan-400 text-xl"
                        />

                        <h3 className="text-xl font-bold text-cyan-400">
                          Skill Match Percentage
                        </h3>

                      </div>

                      <p className="text-4xl md:text-5xl font-bold text-cyan-400 mt-3">
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
            Talent<span className="text-cyan-400">IQ</span>
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