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
        if (!res.ok) {
          throw new Error();
        }

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
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [selected]);

  function openApplication(app) {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setSelected(app);
  }

  function backToApplications() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setSelected(null);
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

    if (!q) {
      return true;
    }

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

  if (selected) {
    return (
      <main className="min-h-screen bg-[#050816] text-white pb-16">
        <Navbar />

        <section className="p-6 md:p-10">
          <button
            onClick={backToApplications}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Applications
          </button>

          <div className="mb-6">
            <p className="text-cyan-400 font-semibold">
              APPLICATION ID: {selected.application_id}
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              Application Details
            </h1>

            <p className="text-gray-400 mt-2">
              Candidate and job application information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              <p className="text-3xl font-bold text-cyan-400">
                {score(selected.match_score)}
              </p>
            </Section>

            <Section
              icon={faCheckCircle}
              title="Skill Match"
            >
              <p className="text-3xl font-bold text-cyan-400">
                {skillScore(
                  selected.skill_match_percentage
                )}
              </p>
            </Section>

            <Section
              icon={faChartLine}
              title="Ranking"
            >
              <p className="text-3xl font-bold">
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

          <div className="mt-5">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
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

  return (
    <main className="min-h-screen bg-[#050816] text-white pb-16">
      <Navbar />

      <section className="p-6 md:p-10">
        <Link
          href="/dashboard"
          scroll={true}
          onClick={() => {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }}
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </Link>

        <p className="text-cyan-400 font-semibold">
          TALENTIQ
        </p>

        <h1 className="text-4xl font-bold mt-2">
          Applications
        </h1>

        <p className="text-gray-400 text-lg mt-2 mb-6">
          View and analyze candidate applications.
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
            placeholder="Search by Application ID, status, skills or recommendation"
            className="w-full bg-[#0b1020] rounded-lg py-4 pl-11 pr-4 text-lg outline-none"
          />
        </div>

        {loading && (
          <p className="text-cyan-400">
            Loading applications...
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
              {filtered.map((app) => (
                <div
                  key={app.application_id}
                  className="bg-[#0b1020] rounded-xl p-5"
                >
                  <div className="flex justify-between items-center mb-5">
                    <p className="text-cyan-400 font-semibold">
                      Application #{app.application_id}
                    </p>

                    <FontAwesomeIcon
                      icon={faBriefcase}
                      className="text-cyan-400"
                    />
                  </div>

                  <div className="space-y-5">
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
                      value={score(
                        app.match_score
                      )}
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
                    onClick={() => openApplication(app)}
                    className="w-full py-3 mt-6 rounded-lg bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-black font-semibold"
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
            <p className="text-center text-gray-500 text-lg py-16">
              No applications found.
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
        scroll={true}
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
        scroll={true}
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

function Info({
  icon,
  label,
  value,
  highlight,
}) {
  return (
    <div className="flex gap-3">
      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 mt-1 shrink-0"
      />

      <div className="min-w-0">
        <p className="text-sm text-gray-500">
          {label}
        </p>

        <p
          className={
            highlight
              ? "text-cyan-400 font-bold text-lg break-words"
              : "text-gray-300 text-lg break-words"
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}) {
  return (
    <div className="bg-[#0b1020] rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
        <FontAwesomeIcon
          icon={icon}
          className="text-cyan-400"
        />

        {title}
      </h2>

      <div className="text-gray-300 text-lg leading-7 break-words">
        {children}
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