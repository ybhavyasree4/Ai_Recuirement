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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    try {
      const res = await fetch(`${API_URL}/candidates`);

      if (!res.ok) {
        throw new Error("Failed to load candidates");
      }

      const data = await res.json();

      data.sort(
        (a, b) =>
          Number(a.candidate_id) - Number(b.candidate_id)
      );

      setCandidates(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load candidates.");
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

  /*
    SEARCH

    Number:
    25  -> Candidate ID 25 only
    182 -> Candidate ID 182 only
    2   -> Candidate ID 2 only

    Text:
    Searches candidate name and other candidate details.
  */

  const filtered = candidates.filter((candidate) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    // Exact Candidate ID search
    if (/^\d+$/.test(query)) {
      return (
        String(candidate.candidate_id) === query
      );
    }

    // Text search
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
    <main className="min-h-screen w-full bg-[#050816] text-white flex flex-col">

      <Navbar />

      <section className="flex-1 w-full px-6 md:px-10 lg:px-14 py-8">

        {/* BACK */}

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 text-lg text-gray-400 hover:text-cyan-400 transition mb-8"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </Link>

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-cyan-400 text-lg font-semibold uppercase">
            Recruitment Tool
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            Candidate Profiling
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mt-3">
            Explore structured candidate information and
            professional profiles.
          </p>

        </div>

        {/* SEARCH */}

        <div className="relative mb-7">

          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-5 top-4 text-gray-500 text-lg"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder="Search candidates..."
            className="w-full bg-[#0b1020] rounded-xl py-4 pl-12 pr-5 text-lg text-white outline-none placeholder:text-gray-600 focus:bg-[#0d1428]"
          />

        </div>

        {/* ERROR */}

        {error && (
          <div className="bg-red-500/10 text-red-400 rounded-xl p-5 text-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start">

          {/* LEFT CANDIDATES PANEL */}

          <div className="bg-[#0b1020] rounded-xl h-[calc(100vh-300px)] min-h-[500px] flex flex-col overflow-hidden">

            <div className="p-6 shrink-0">

              <div className="flex items-center justify-between">

                <h2 className="text-2xl font-bold">
                  Candidates
                </h2>

                <span className="text-base text-cyan-400 font-semibold">
                  {filtered.length}
                </span>

              </div>

              <p className="text-base text-gray-500 mt-2">
                Available candidate profiles
              </p>

            </div>

            {/* CANDIDATE LIST */}

            <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">

              {filtered.length === 0 ? (

                <div className="p-8 text-center text-gray-500 text-lg">
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
                    className={`w-full text-left rounded-xl p-5 mb-2 transition ${
                      selected?.candidate_id ===
                      candidate.candidate_id
                        ? "bg-cyan-400/10"
                        : "hover:bg-white/5"
                    }`}
                  >

                    <div className="flex items-center gap-4">

                      <div className="w-13 h-13 min-w-13 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                        <FontAwesomeIcon
                          icon={faUsers}
                          className="text-cyan-400 text-xl"
                        />

                      </div>

                      <div className="min-w-0">

                        <p className="text-lg font-semibold truncate">
                          {candidate.name ||
                            `Candidate ${candidate.candidate_id}`}
                        </p>

                        <p className="text-base text-gray-500 mt-1">
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

          <div className="bg-[#0b1020] rounded-xl p-7 md:p-8 min-h-[500px]">

            {/* LOADING */}

            {loading ? (

              <div className="min-h-[550px] flex flex-col items-center justify-center text-center">

                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className="text-cyan-400 text-4xl mb-5"
                />

                <h2 className="text-2xl font-bold">
                  Loading Candidate Profile
                </h2>

                <p className="text-lg text-gray-500 mt-2">
                  Preparing candidate information...
                </p>

              </div>

            ) : !selected ? (

              /* EMPTY STATE */

              <div className="min-h-[550px] flex flex-col items-center justify-center text-center px-6">

                <div className="w-20 h-20 rounded-xl bg-cyan-400/10 flex items-center justify-center mb-6">

                  <FontAwesomeIcon
                    icon={faUserTie}
                    className="text-cyan-400 text-4xl"
                  />

                </div>

                <h2 className="text-3xl font-bold">
                  Candidate Insights
                </h2>

                <p className="text-lg text-gray-400 mt-3 max-w-xl">
                  Choose a candidate from the list to explore
                  their complete professional profile.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 w-full max-w-3xl">

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

                <div className="mb-7">

                  <p className="text-cyan-400 text-base font-semibold uppercase">
                    Candidate Details
                  </p>

                  <h2 className="text-3xl md:text-4xl font-bold mt-2">
                    Candidate Profile
                  </h2>

                  <p className="text-lg text-gray-500 mt-2">
                    Candidate ID:{" "}
                    {selected.candidate_id}
                  </p>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

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
                          className={`bg-[#080c1a] rounded-xl px-6 py-5 min-h-[160px] flex flex-col overflow-hidden ${
                            longText
                              ? "sm:col-span-2 lg:col-span-3"
                              : ""
                          }`}
                        >

                          <p className="text-sm text-cyan-400 uppercase font-semibold">
                            {label(key)}
                          </p>

                          <p
                            className={`text-lg text-gray-300 mt-3 leading-7 break-words whitespace-pre-wrap ${
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
    <div className="bg-[#080c1a] rounded-xl p-5 flex flex-col items-center justify-center min-h-[120px]">

      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 text-2xl mb-3"
      />

      <p className="text-base font-semibold text-gray-300">
        {text}
      </p>

    </div>
  );
}

/* NAVBAR */

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
          className="flex items-center gap-2 text-lg text-gray-400 hover:text-white transition"
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
    <footer className="fixed bottom-0 left-0 w-full bg-[#080c1a] py-3 text-center text-gray-600 text-sm z-50">
      TalentIQ — AI-Powered Recruitment Platform
    </footer>
  );
}