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
  faBriefcase,
  faChartLine,
  faCheckCircle,
  faXmarkCircle,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/applications`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setApplications(
          data.sort(
            (a, b) =>
              Number(a.application_id) -
              Number(b.application_id)
          )
        );
      })
      .catch(() => {
        setError("Unable to load applications.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [selected]);

  function openApplication(app) {
    setSelected(app);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function backToApplications() {
    setSelected(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function score(value) {
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
      return String(app.application_id) === q;
    }

    const text = [
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

  /* =========================
     APPLICATION DETAILS
  ========================= */

  if (selected) {
    return (
      <main className="min-h-screen bg-[#050816] text-white flex flex-col overflow-x-hidden">
        <Navbar />

        <section className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 pb-12">
          <button
            onClick={backToApplications}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-5 text-sm transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Applications
          </button>

          <div className="mb-6">
            <p className="text-cyan-400 text-xs sm:text-sm font-semibold">
              APPLICATION ID: {selected.application_id}
            </p>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1.5 break-words">
              Application Details
            </h1>

            <p className="text-gray-400 text-sm sm:text-base mt-1.5">
              Candidate and job application information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section
              icon={faUser}
              title="Candidate"
            >
              <b>Candidate ID:</b>{" "}
              {selected.candidate_id}
            </Section>

            <Section
              icon={faBriefcase}
              title="Job"
            >
              <b>Job ID:</b> {selected.job_id}
            </Section>

            <Section
              icon={faChartLine}
              title="Match Score"
            >
              <p className="text-2xl sm:text-3xl font-bold text-cyan-400">
                {score(selected.match_score)}
              </p>
            </Section>

            <Section
              icon={faCheckCircle}
              title="Skill Match"
            >
              <p className="text-2xl sm:text-3xl font-bold text-cyan-400">
                {skillScore(
                  selected.skill_match_percentage
                )}
              </p>
            </Section>

            <Section
              icon={faChartLine}
              title="Ranking"
            >
              <p className="text-2xl sm:text-3xl font-bold">
                #{selected.ranking ?? "N/A"}
              </p>
            </Section>

            <Section
              icon={faLightbulb}
              title="Application Status"
            >
              {selected.application_status ||
                "Not specified"}
            </Section>
          </div>

          <div className="mt-4">
            <Section
              icon={faLightbulb}
              title="AI Recommendation"
            >
              <p className="whitespace-pre-line">
                {selected.recommendation ||
                  "No recommendation available."}
              </p>
            </Section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Section
              icon={faCheckCircle}
              title="Matched Skills"
            >
              <p className="whitespace-pre-line">
                {selected.matched_skills ||
                  "No matched skills available."}
              </p>
            </Section>

            <Section
              icon={faXmarkCircle}
              title="Missing Skills"
            >
              <p className="whitespace-pre-line">
                {selected.missing_skills ||
                  "No missing skills available."}
              </p>
            </Section>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  /* =========================
     APPLICATION LIST
  ========================= */

  return (
    <main className="min-h-screen bg-[#050816] text-white flex flex-col overflow-x-hidden">
      <Navbar />

      <section className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 pb-12">
        <Link
          href="/dashboard"
          scroll={true}
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-5 text-sm transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </Link>

        <p className="text-cyan-400 text-xs sm:text-sm font-semibold">
          TALENTIQ
        </p>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1.5">
          Applications
        </h1>

        <p className="text-gray-400 text-sm sm:text-base mt-1.5 mb-5">
          View and analyze candidate applications.
        </p>

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
            placeholder="Search by Application ID, status, skills or recommendation"
            className="w-full bg-[#0b1020] rounded-lg py-3 pl-10 pr-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-400/30"
          />
        </div>

        {loading && (
          <p className="text-cyan-400 text-sm">
            Loading applications...
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
              {filtered.map((app) => (
                <div
                  key={app.application_id}
                  className="bg-[#0b1020] rounded-xl p-4 min-h-[290px] h-full flex flex-col overflow-hidden"
                >
                  <div className="flex justify-between items-center gap-2 mb-4 min-w-0">
                    <p className="text-cyan-400 text-xs sm:text-sm font-semibold break-words">
                      Application #{app.application_id}
                    </p>

                    <FontAwesomeIcon
                      icon={faBriefcase}
                      className="text-cyan-400 text-sm shrink-0"
                    />
                  </div>

                  <div className="space-y-3 flex-1 min-w-0">
                    <Info
                      icon={faUser}
                      label="Candidate ID"
                      value={app.candidate_id}
                    />

                    <Info
                      icon={faBriefcase}
                      label="Job ID"
                      value={app.job_id}
                    />

                    <Info
                      icon={faChartLine}
                      label="Match Score"
                      value={score(app.match_score)}
                      highlight
                    />

                    <Info
                      icon={faCheckCircle}
                      label="Skill Match"
                      value={skillScore(
                        app.skill_match_percentage
                      )}
                    />

                    <Info
                      icon={faChartLine}
                      label="Ranking"
                      value={`#${app.ranking ?? "N/A"}`}
                    />
                  </div>

                  <button
                    onClick={() =>
                      openApplication(app)
                    }
                    className="w-full py-2.5 mt-4 rounded-lg bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-black text-xs sm:text-sm font-semibold transition"
                  >
                    View Application
                  </button>
                </div>
              ))}
            </div>
          )}

        {!loading &&
          !error &&
          filtered.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-14">
              No applications found.
            </p>
          )}
      </section>

      <Footer />
    </main>
  );
}

/* =========================
   NAVBAR
========================= */

function Navbar() {
  return (
    <nav className="bg-[#080c1a] px-4 sm:px-6 md:px-8 py-3">
      <div className="flex justify-between items-center gap-4">
        <Link
          href="/dashboard"
          scroll={true}
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
          scroll={true}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs sm:text-sm shrink-0 transition"
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
          <span>Logout</span>
        </Link>
      </div>
    </nav>
  );
}

/* =========================
   INFO
========================= */

function Info({
  icon,
  label,
  value,
  highlight,
}) {
  return (
    <div className="flex gap-2.5 min-w-0">
      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 mt-1 shrink-0 text-sm"
      />

      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-[11px] text-gray-500">
          {label}
        </p>

        <p
          className={
            highlight
              ? "text-cyan-400 font-bold text-sm sm:text-base break-words"
              : "text-gray-300 text-xs sm:text-sm break-words"
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================
   SECTION
========================= */

function Section({
  icon,
  title,
  children,
}) {
  return (
    <div className="bg-[#0b1020] rounded-xl p-4 sm:p-5 overflow-hidden">
      <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2.5 break-words">
        <FontAwesomeIcon
          icon={icon}
          className="text-cyan-400 text-sm shrink-0"
        />

        {title}
      </h2>

      <div className="text-xs sm:text-sm text-gray-300 leading-5 sm:leading-6 break-words whitespace-pre-line overflow-hidden">
        {children}
      </div>
    </div>
  );
}

/* =========================
   FOOTER
========================= */

function Footer() {
  return (
    <footer className="w-full bg-[#080c1a] py-3 text-center text-gray-600 text-[11px] sm:text-xs mt-8">
      TalentIQ — AI-Powered Recruitment Platform
    </footer>
  );
}