"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faArrowLeft,
  faUsers,
  faMagnifyingGlass,
  faRightFromBracket,
  faSpinner,
  faUserTie,
  faGraduationCap,
  faBriefcase,
  faCode,
  faLanguage,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CandidateProfiling() {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  // Loading candidate list
  const [candidatesLoading, setCandidatesLoading] =
    useState(true);

  // Loading selected profile
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    setCandidatesLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/candidates`);

      if (!res.ok) {
        throw new Error("Failed to load candidates");
      }

      const data = await res.json();

      data.sort(
        (a, b) =>
          Number(a.candidate_id) -
          Number(b.candidate_id)
      );

      setCandidates(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load candidates.");
    } finally {
      setCandidatesLoading(false);
    }
  }

  async function loadProfile(id) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_URL}/candidate-profile/${id}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail || "Failed to load profile"
        );
      }

      setSelected(data);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = candidates.filter((candidate) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    if (/^\d+$/.test(query)) {
      return (
        String(candidate.candidate_id) === query
      );
    }

    return JSON.stringify(candidate)
      .toLowerCase()
      .includes(query);
  });

  function label(key) {
    const names = {
      candidate_id: "Candidate ID",
      name: "Name",
      resume_file_name: "Resume File",
      resume_file_path: "Resume Path",
      resume_text: "Resume",
      address: "Address",
      career_objective: "Career Objective",
      educational_institution_name: "Institution",
      degree_names: "Degree",
      passing_years: "Passing Year",
      educational_results: "Result",
      major_field_of_studies: "Field of Study",
      professional_company_names: "Company",
      company_urls: "Company URL",
      related_skils_in_job: "Skills",
      positions: "Position",
      locations: "Location",
      responsibilities: "Responsibilities",
      role_positions: "Role",
      languages: "Languages",
      proficiency_levels: "Proficiency",
      certification_providers: "Certifications",
    };

    return (
      names[key] ||
      key.replaceAll("_", " ")
    );
  }

  function displayValue(data) {
    if (
      data === null ||
      data === undefined ||
      data === ""
    ) {
      return "Not available";
    }

    if (Array.isArray(data)) {
      return data.join(", ");
    }

    if (typeof data === "object") {
      return JSON.stringify(data);
    }

    return String(data);
  }

  return (
    <main className="min-h-screen w-full bg-[#050816] text-white flex flex-col overflow-x-hidden">
      <Navbar />

      <section className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 pb-12">

        {/* BACK */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition mb-5"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </Link>

        {/* HEADER */}
        <div className="mb-6">
          <p className="text-cyan-400 text-xs sm:text-sm font-medium uppercase">
            Recruitment Tool
          </p>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium mt-1.5">
            Candidate Profiling
          </h1>

          <p className="text-sm sm:text-base text-gray-400 mt-1.5">
            Explore structured candidate information and
            professional profiles.
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative mb-5">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder="Search candidates..."
            className="w-full bg-[#0b1020] rounded-lg py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-gray-600 focus:bg-[#0d1428]"
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/10 text-red-400 rounded-xl p-3 text-sm mb-5 break-words">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-4 items-start">

          {/* LEFT CANDIDATES PANEL */}
          <div className="bg-[#0b1020] rounded-xl h-[calc(100vh-270px)] min-h-[450px] flex flex-col overflow-hidden">

            {/* LEFT PANEL HEADER */}
            <div className="p-4 shrink-0">

              <div className="flex items-center justify-between gap-3">

                <h2 className="text-lg font-medium">
                  Candidates
                </h2>

                {!candidatesLoading && (
                  <span className="text-sm text-cyan-400 font-normal">
                    {filtered.length}
                  </span>
                )}

              </div>

              <p className="text-xs text-gray-500 mt-1.5">
                {candidatesLoading
                  ? "Loading candidate profiles..."
                  : "Available candidate profiles"}
              </p>

            </div>

            {/* CANDIDATE LIST */}
            <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2">

              {/* LOADING CANDIDATES */}
              {candidatesLoading ? (

                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center px-4">

                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    className="text-cyan-400 text-2xl mb-3"
                  />

                  <p className="text-sm text-gray-400">
                    Loading candidates...
                  </p>

                  <p className="text-[11px] text-gray-600 mt-1">
                    Please wait while candidate data is loaded.
                  </p>

                </div>

              ) : filtered.length === 0 ? (

                /* ONLY SHOW THIS AFTER LOADING IS COMPLETE */
                <div className="p-6 text-center text-gray-500 text-sm">
                  No candidates found.
                </div>

              ) : (

                filtered.map((candidate) => (

                  <button
                    key={candidate.candidate_id}
                    onClick={() =>
                      loadProfile(
                        candidate.candidate_id
                      )
                    }
                    className={`w-full text-left rounded-lg p-3 mb-1.5 transition ${
                      selected?.candidate_id ===
                      candidate.candidate_id
                        ? "bg-cyan-400/10"
                        : "hover:bg-white/5"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 min-w-10 rounded-lg bg-cyan-400/10 flex items-center justify-center shrink-0">

                        <FontAwesomeIcon
                          icon={faUsers}
                          className="text-cyan-400 text-base"
                        />

                      </div>

                      <div className="min-w-0">

                        <p className="text-sm font-normal truncate">
                          {candidate.name ||
                            `Candidate ${candidate.candidate_id}`}
                        </p>

                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Candidate ID:{" "}
                          {candidate.candidate_id}
                        </p>

                      </div>

                    </div>

                  </button>

                ))
              )}

            </div>

          </div>

          {/* RIGHT PROFILE PANEL */}
          <div className="bg-[#0b1020] rounded-xl p-4 sm:p-5 md:p-6 min-h-[450px]">

            {/* LOADING PROFILE */}
            {loading ? (

              <div className="min-h-[500px] flex flex-col items-center justify-center text-center">

                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className="text-cyan-400 text-3xl mb-4"
                />

                <h2 className="text-xl font-normal">
                  Loading Candidate Profile
                </h2>

                <p className="text-sm text-gray-500 mt-1.5">
                  Preparing candidate information...
                </p>

              </div>

            ) : !selected ? (

              /* EMPTY STATE */

              <div className="min-h-[500px] flex flex-col items-center justify-center text-center px-4">

                <div className="w-16 h-16 rounded-xl bg-cyan-400/10 flex items-center justify-center mb-5">

                  <FontAwesomeIcon
                    icon={faUserTie}
                    className="text-cyan-400 text-3xl"
                  />

                </div>

                <h2 className="text-2xl font-normal">
                  Candidate Insights
                </h2>

                <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-xl">
                  Choose a candidate from the list to explore
                  their complete professional profile.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 w-full max-w-3xl">

                  <Insight
                    icon={faGraduationCap}
                    text="Education"
                  />

                  <Insight
                    icon={faBriefcase}
                    text="Experience"
                  />

                  <Insight
                    icon={faCode}
                    text="Skills"
                  />

                  <Insight
                    icon={faLanguage}
                    text="Languages"
                  />

                </div>

              </div>

            ) : (

              /* PROFILE */

              <>

                <div className="mb-5">

                  <p className="text-cyan-400 text-xs sm:text-sm font-normal uppercase">
                    Candidate Details
                  </p>

                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-normal mt-1.5">
                    Candidate Profile
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
                    Candidate ID:{" "}
                    {selected.candidate_id}
                  </p>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  {Object.entries(selected)
                    .filter(
                      ([key]) =>
                        key !== "profiling_status"
                    )
                    .map(([key, val]) => {

                      const longText =
                        key === "resume_text" ||
                        key === "career_objective" ||
                        key === "responsibilities";

                      return (

                        <div
                          key={key}
                          className={`bg-[#080c1a] rounded-xl px-4 py-4 min-h-[140px] flex flex-col overflow-hidden ${
                            longText
                              ? "sm:col-span-2 lg:col-span-3"
                              : ""
                          }`}
                        >

                          <p className="text-[10px] sm:text-[11px] text-cyan-400 uppercase font-normal break-words">
                            {label(key)}
                          </p>

                          <p
                            className={`text-xs sm:text-sm text-gray-300 mt-2 leading-5 break-words whitespace-pre-wrap font-normal ${
                              longText
                                ? "text-justify"
                                : ""
                            }`}
                          >
                            {displayValue(val)}
                          </p>

                        </div>

                      );
                    })}

                </div>

              </>

            )}

          </div>

        </div>

      </section>

      <Footer />

    </main>
  );
}

/* INSIGHT CARD */

function Insight({ icon, text }) {
  return (
    <div className="bg-[#080c1a] rounded-xl p-4 flex flex-col items-center justify-center min-h-[100px]">

      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 text-xl mb-2"
      />

      <p className="text-xs sm:text-sm font-normal text-gray-400">
        {text}
      </p>

    </div>
  );
}

/* NAVBAR */

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

            <h1 className="text-lg sm:text-xl font-medium">
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

          <FontAwesomeIcon
            icon={faRightFromBracket}
          />

          <span className="hidden sm:block">
            Logout
          </span>

        </Link>

      </div>

    </nav>
  );
}

/* FOOTER */

function Footer() {
  return (
    <footer className="w-full bg-[#080c1a] py-3 text-center text-gray-600 text-[11px] sm:text-xs mt-8">
      TalentIQ — AI-Powered Recruitment Platform
    </footer>
  );
}