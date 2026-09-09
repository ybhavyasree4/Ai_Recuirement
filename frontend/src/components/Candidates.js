"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faArrowLeft,
  faRightFromBracket,
  faMagnifyingGlass,
  faUser,
  faGraduationCap,
  faBriefcase,
  faLanguage,
  faCertificate,
  faLocationDot,
  faBullseye,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/candidates`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setCandidates(
          data.sort(
            (a, b) =>
              Number(a.candidate_id) -
              Number(b.candidate_id)
          )
        );
      })
      .catch(() => setError("Unable to load candidates."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = candidates.filter((c) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    if (/^\d+$/.test(q)) {
      return String(c.candidate_id) === q;
    }

    return [
      c.name,
      c.resume_file_name,
      c.degree_names,
      c.professional_company_names,
      c.related_skils_in_job,
      c.educational_institution_name,
      c.major_field_of_studies,
      c.positions,
      c.locations,
      c.languages,
      c.career_objective,
      c.certification_providers,
    ]
      .filter(Boolean)
      .flatMap((v) =>
        Array.isArray(v) ? v : [v]
      )
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  // =========================
  // SELECTED CANDIDATE
  // =========================

  if (selected) {
    return (
      <main className="min-h-screen bg-[#050816] text-white flex flex-col overflow-x-hidden">
        <Navbar />

        <section className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 pb-14">

          <button
            onClick={() => {
              setSelected(null);
              window.scrollTo(0, 0);
            }}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-5 text-sm transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Candidates
          </button>

          {/* PROFILE HEADER */}

          <div className="bg-[#0b1020] rounded-xl p-4 sm:p-5 mb-5 overflow-hidden">
            <div className="flex items-center gap-3 sm:gap-4">

              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cyan-400/10 flex items-center justify-center shrink-0">
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-cyan-400 text-lg sm:text-xl"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs text-gray-500">
                  Candidate ID: {selected.candidate_id}
                </p>

                <h2 className="text-xl sm:text-2xl font-bold break-words">
                  {selected.name ||
                    `Candidate ${selected.candidate_id}`}
                </h2>

                <p className="text-xs sm:text-sm text-gray-400 break-words">
                  {formatValue(selected.resume_file_name)}
                </p>
              </div>

            </div>
          </div>

          {/* RESUME */}

          <Section icon={faFileLines} title="Resume">
            <Detail
              label="Resume File"
              value={selected.resume_file_name}
            />

            <Detail
              label="Resume Path"
              value={selected.resume_file_path}
            />

            <Detail
              label="Resume Text"
              value={selected.resume_text}
              full
            />
          </Section>

          {/* PERSONAL INFORMATION */}

          <Section
            icon={faLocationDot}
            title="Personal Information"
          >
            <Detail
              label="Address"
              value={selected.address}
              full
            />

            <Detail
              label="Languages"
              value={selected.languages}
            />

            <Detail
              label="Proficiency"
              value={selected.proficiency_levels}
            />
          </Section>

          {/* CAREER OBJECTIVE */}

          <Section
            icon={faBullseye}
            title="Career Objective"
          >
            <Detail
              label="Objective"
              value={selected.career_objective}
              full
            />
          </Section>

          {/* EDUCATION */}

          <Section
            icon={faGraduationCap}
            title="Education"
          >
            <Detail
              label="Institution"
              value={selected.educational_institution_name}
            />

            <Detail
              label="Degree"
              value={selected.degree_names}
            />

            <Detail
              label="Passing Year"
              value={selected.passing_years}
            />

            <Detail
              label="Result"
              value={selected.educational_results}
            />

            <Detail
              label="Field of Study"
              value={selected.major_field_of_studies}
            />
          </Section>

          {/* PROFESSIONAL EXPERIENCE */}

          <Section
            icon={faBriefcase}
            title="Professional Experience"
          >
            <Detail
              label="Companies"
              value={selected.professional_company_names}
              full
            />

            <Detail
              label="Company URLs"
              value={selected.company_urls}
              full
            />

            <Detail
              label="Positions"
              value={selected.positions}
            />

            <Detail
              label="Locations"
              value={selected.locations}
            />

            <Detail
              label="Responsibilities"
              value={selected.responsibilities}
              full
            />

            <Detail
              label="Roles"
              value={selected.role_positions}
              full
            />
          </Section>

          {/* SKILLS */}

          <Section
            icon={faBullseye}
            title="Skills"
          >
            <Detail
              label="Skills"
              value={selected.related_skils_in_job}
              full
            />
          </Section>

          {/* LANGUAGES */}

          <Section
            icon={faLanguage}
            title="Languages & Proficiency"
          >
            <Detail
              label="Languages"
              value={selected.languages}
            />

            <Detail
              label="Proficiency"
              value={selected.proficiency_levels}
            />
          </Section>

          {/* CERTIFICATIONS */}

          <Section
            icon={faCertificate}
            title="Certifications"
          >
            <Detail
              label="Certifications"
              value={selected.certification_providers}
              full
            />
          </Section>

        </section>

        <Footer />
      </main>
    );
  }

  // =========================
  // CANDIDATES LIST
  // =========================

  return (
    <main className="min-h-screen bg-[#050816] text-white flex flex-col overflow-x-hidden">

      <Navbar />

      <section className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 pb-14">

        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-5 text-sm transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </Link>

        <p className="text-cyan-400 text-xs sm:text-sm font-semibold">
          RECRUITMENT
        </p>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1.5">
          Candidates
        </h1>

        <p className="text-gray-400 text-sm sm:text-base mt-1.5 mb-5">
          View and manage candidate profiles.
        </p>

        {/* SEARCH */}

        <div className="relative w-full max-w-3xl mb-5">

          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by Candidate ID, degree, company or skill"
            className="w-full bg-[#0b1020] rounded-lg py-3 pl-10 pr-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-400/30"
          />

        </div>

        {/* LOADING */}

        {loading && (
          <p className="text-cyan-400 text-sm">
            Loading candidates...
          </p>
        )}

        {/* ERROR */}

        {error && (
          <p className="text-red-400 text-sm">
            {error}
          </p>
        )}

        {/* CANDIDATE CARDS */}

        {!loading &&
          !error &&
          filtered.length > 0 && (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">

              {filtered.map((c) => (

                <div
                  key={c.candidate_id}
                  className="bg-[#0b1020] rounded-xl p-4 min-h-[290px] h-full flex flex-col overflow-hidden"
                >

                  <div className="w-11 h-11 rounded-full bg-cyan-400/10 flex items-center justify-center mb-3 shrink-0">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-cyan-400 text-lg"
                    />
                  </div>

                  <p className="text-[11px] text-gray-500">
                    Candidate ID: {c.candidate_id}
                  </p>

                  <h3 className="text-base sm:text-lg font-bold mt-1 break-words">
                    {c.name ||
                      `Candidate ${c.candidate_id}`}
                  </h3>

                  <div className="mt-3 space-y-3 flex-1 min-w-0">

                    <Info
                      label="Resume"
                      value={c.resume_file_name}
                    />

                    <Info
                      label="Education"
                      value={c.degree_names}
                    />

                    <Info
                      label="Skills"
                      value={c.related_skils_in_job}
                    />

                    <Info
                      label="Experience"
                      value={
                        c.professional_company_names
                      }
                    />

                  </div>

                  <button
                    onClick={() => {
                      setSelected(c);
                      window.scrollTo(0, 0);
                    }}
                    className="w-full py-2.5 mt-4 rounded-lg bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-black text-xs sm:text-sm font-semibold transition"
                  >
                    View Candidate
                  </button>

                </div>

              ))}

            </div>
          )}

        {/* NO RESULTS */}

        {!loading &&
          !error &&
          filtered.length === 0 && (

            <p className="text-center text-gray-500 text-sm py-14">
              No candidates found.
            </p>

          )}

      </section>

      <Footer />

    </main>
  );
}

// =========================
// NAVBAR
// =========================

function Navbar() {
  return (
    <nav className="bg-[#080c1a] px-4 sm:px-6 md:px-8 py-3">

      <div className="flex justify-between items-center gap-4">

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
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs sm:text-sm shrink-0 transition"
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
          <span>Logout</span>
        </Link>

      </div>

    </nav>
  );
}

// =========================
// SECTION
// =========================

function Section({ icon, title, children }) {
  return (
    <div className="bg-[#0b1020] rounded-xl p-4 sm:p-5 mb-4 overflow-hidden">

      <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2.5 break-words">
        <FontAwesomeIcon
          icon={icon}
          className="text-cyan-400 shrink-0 text-sm"
        />

        {title}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>

    </div>
  );
}

// =========================
// DETAIL
// =========================

function Detail({ label, value, full }) {
  return (
    <div
      className={`min-w-0 ${
        full ? "md:col-span-2" : ""
      }`}
    >
      <p className="text-[10px] sm:text-[11px] text-gray-500 uppercase">
        {label}
      </p>

      <p className="text-xs sm:text-sm text-gray-300 mt-1 break-words whitespace-pre-line overflow-hidden">
        {formatValue(value)}
      </p>
    </div>
  );
}

// =========================
// INFO
// =========================

function Info({ label, value }) {
  return (
    <div className="min-w-0">

      <p className="text-[10px] sm:text-[11px] text-gray-500">
        {label}
      </p>

      <p className="text-xs sm:text-sm text-gray-300 mt-1 break-words whitespace-normal overflow-hidden">
        {formatValue(value)}
      </p>

    </div>
  );
}

// =========================
// FORMAT VALUE
// =========================

function formatValue(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "Not specified";
  }

  if (Array.isArray(value)) {
    return value.length
      ? value.join(", ")
      : "Not specified";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "Not specified";
    }
  }

  return String(value);
}

// =========================
// FOOTER
// =========================

function Footer() {
  return (
    <footer className="w-full bg-[#080c1a] py-3 text-center text-gray-600 text-[11px] sm:text-xs">
      TalentIQ — AI-Powered Recruitment Platform
    </footer>
  );
}