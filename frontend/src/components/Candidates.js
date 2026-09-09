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

  if (selected) {
    return (
      <main className="min-h-screen bg-[#050816] text-white pb-16">
        <Navbar />

        <section className="p-6 md:p-10">
          <button
            onClick={() => {
              setSelected(null);
              window.scrollTo(0, 0);
            }}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Candidates
          </button>

          <div className="bg-[#0b1020] rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-cyan-400/10 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-cyan-400 text-2xl"
                />
              </div>

              <div>
                <p className="text-gray-500">
                  Candidate ID: {selected.candidate_id}
                </p>

                <h2 className="text-3xl font-bold">
                  {selected.name ||
                    `Candidate ${selected.candidate_id}`}
                </h2>

                <p className="text-gray-400">
                  {formatValue(selected.resume_file_name)}
                </p>
              </div>
            </div>
          </div>

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

          <Section icon={faBullseye} title="Skills">
            <Detail
              label="Skills"
              value={selected.related_skils_in_job}
              full
            />
          </Section>

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

  return (
    <main className="min-h-screen bg-[#050816] text-white pb-16">
      <Navbar />

      <section className="p-6 md:p-10">
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

        <h1 className="text-4xl font-bold mt-2">
          Candidates
        </h1>

        <p className="text-gray-400 text-lg mt-2 mb-6">
          View and manage candidate profiles.
        </p>

        <div className="relative max-w-3xl mb-6">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by Candidate ID, degree, company or skill"
            className="w-full bg-[#0b1020] rounded-lg py-4 pl-11 pr-4 text-lg outline-none"
          />
        </div>

        {loading && (
          <p className="text-cyan-400">
            Loading candidates...
          </p>
        )}

        {error && (
          <p className="text-red-400">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filtered.map((c) => (
                <div
                  key={c.candidate_id}
                  className="bg-[#0b1020] rounded-xl p-5"
                >
                  <div className="w-14 h-14 rounded-full bg-cyan-400/10 flex items-center justify-center mb-4">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-cyan-400 text-2xl"
                    />
                  </div>

                  <p className="text-gray-500">
                    Candidate ID: {c.candidate_id}
                  </p>

                  <h3 className="text-xl font-bold mt-1 break-words">
                    {c.name ||
                      `Candidate ${c.candidate_id}`}
                  </h3>

                  <div className="mt-4 space-y-4">
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
                    className="w-full py-3 mt-5 rounded-lg bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-black font-semibold transition"
                  >
                    View Candidate
                  </button>
                </div>
              ))}
            </div>
          )}

        {!loading &&
          !error &&
          filtered.length === 0 && (
            <p className="text-center text-gray-500 text-lg py-16">
              No candidates found.
            </p>
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
            Talent
            <span className="text-cyan-400">
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
        className="flex items-center gap-2 text-gray-400 hover:text-white"
      >
        <FontAwesomeIcon
          icon={faRightFromBracket}
        />
        Logout
      </Link>
    </nav>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="bg-[#0b1020] rounded-xl p-6 mb-5">
      <h3 className="text-xl font-bold mb-5 flex items-center gap-3">
        <FontAwesomeIcon
          icon={icon}
          className="text-cyan-400"
        />
        {title}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {children}
      </div>
    </div>
  );
}

function Detail({ label, value, full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-sm text-gray-500 uppercase">
        {label}
      </p>

      <p className="text-gray-300 mt-1 break-words whitespace-pre-line">
        {formatValue(value)}
      </p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="text-gray-300 mt-1 break-words whitespace-normal">
        {formatValue(value)}
      </p>
    </div>
  );
}

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

function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#080c1a] py-3 text-center text-gray-600 text-sm z-50">
      TalentIQ — AI-Powered Recruitment Platform
    </footer>
  );
}