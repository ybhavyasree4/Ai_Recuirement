"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faBriefcase,
  faArrowLeft,
  faRightFromBracket,
  faMagnifyingGlass,
  faGraduationCap,
  faClock,
  faUsers,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/jobs`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) =>
        setJobs(
          data.sort(
            (a, b) => Number(a.job_id) - Number(b.job_id)
          )
        )
      )
      .catch(() => setError("Unable to load jobs."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedJob) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [selectedJob]);

  const filtered = jobs.filter((job) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    if (/^\d+$/.test(q)) {
      return String(job.job_id) === q;
    }

    return [
      job.job_position_name,
      job.educationaL_requirements,
      job.experiencere_requirement,
      job.age_requirement,
      job.responsibilities,
    ]
      .filter(Boolean)
      .flatMap((v) => (Array.isArray(v) ? v : [v]))
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  if (selectedJob) {
    return (
      <main className="min-h-screen bg-[#050816] text-white flex flex-col overflow-x-hidden">
        <Navbar />

        <section className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 pb-12">
          <button
            onClick={() => {
              setSelectedJob(null);
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-5 text-sm font-normal transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Jobs
          </button>

          <div className="bg-[#0b1020] rounded-xl p-4 sm:p-5 mb-5 overflow-hidden">
            <p className="text-cyan-400 text-xs sm:text-sm font-normal">
              JOB ID: {selectedJob.job_id}
            </p>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-normal mt-1.5 break-words">
              {formatValue(selectedJob.job_position_name)}
            </h1>

            <p className="text-gray-400 text-xs sm:text-sm mt-1.5 font-normal">
              Complete job information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section
              icon={faGraduationCap}
              title="Education"
            >
              {formatValue(
                selectedJob.educationaL_requirements
              )}
            </Section>

            <Section
              icon={faClock}
              title="Experience"
            >
              {formatValue(
                selectedJob.experiencere_requirement
              )}
            </Section>

            <Section
              icon={faUsers}
              title="Age Requirement"
            >
              {formatValue(selectedJob.age_requirement)}
            </Section>

            <Section
              icon={faBriefcase}
              title="Job Information"
            >
              <p className="font-normal">
                Job ID: {formatValue(selectedJob.job_id)}
              </p>

              <p className="mt-2 font-normal">
                Position:{" "}
                {formatValue(
                  selectedJob.job_position_name
                )}
              </p>
            </Section>
          </div>

          <div className="mt-4">
            <Section
              icon={faListCheck}
              title="Responsibilities"
            >
              <p className="whitespace-pre-line font-normal">
                {formatValue(selectedJob.responsibilities)}
              </p>
            </Section>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white flex flex-col overflow-x-hidden">
      <Navbar />

      <section className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 pb-12">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-5 text-sm font-normal transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </Link>

        <p className="text-cyan-400 text-xs sm:text-sm font-normal">
          RECRUITMENT
        </p>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal mt-1.5">
          Open Jobs
        </h1>

        <p className="text-gray-400 text-sm sm:text-base mt-1.5 mb-5 font-normal">
          Explore available job opportunities.
        </p>

        <div className="relative w-full max-w-3xl mb-5">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Job ID, position, education or experience"
            className="w-full bg-[#0b1020] rounded-lg py-3 pl-10 pr-3 text-sm text-white font-normal outline-none focus:ring-2 focus:ring-cyan-400/30"
          />
        </div>

        {loading && (
          <p className="text-cyan-400 text-sm font-normal">
            Loading jobs...
          </p>
        )}

        {error && (
          <p className="text-red-400 text-sm font-normal">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
              {filtered.map((job) => (
                <div
                  key={job.job_id}
                  className="bg-[#0b1020] rounded-xl p-4 min-h-[290px] h-full flex flex-col overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 mb-3 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-cyan-400/10 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon
                        icon={faBriefcase}
                        className="text-cyan-400 text-lg"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-gray-500 font-normal">
                        Job ID: {job.job_id}
                      </p>

                      <h2 className="text-base sm:text-lg font-normal line-clamp-2 break-words">
                        {formatValue(
                          job.job_position_name
                        )}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1 min-w-0">
                    <Info
                      icon={faGraduationCap}
                      label="Education"
                      value={
                        job.educationaL_requirements
                      }
                    />

                    <Info
                      icon={faClock}
                      label="Experience"
                      value={
                        job.experiencere_requirement
                      }
                    />

                    <Info
                      icon={faUsers}
                      label="Age"
                      value={job.age_requirement}
                    />
                  </div>

                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className="w-full py-2.5 mt-4 rounded-lg bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-black text-xs sm:text-sm font-normal transition"
                  >
                    View Job
                  </button>
                </div>
              ))}
            </div>
          )}

        {!loading &&
          !error &&
          filtered.length === 0 && (
            <p className="text-center text-gray-500 text-sm font-normal py-14">
              No jobs found.
            </p>
          )}
      </section>

      <Footer />
    </main>
  );
}

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
            <h1 className="text-lg sm:text-xl font-normal">
              Talent
              <span className="text-cyan-400">
                IQ
              </span>
            </h1>

            <p className="text-[9px] sm:text-[10px] text-gray-500 font-normal">
              TALENT INTELLIGENCE
            </p>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs sm:text-sm shrink-0 font-normal transition"
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
          <span>Logout</span>
        </Link>
      </div>
    </nav>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="flex gap-2.5 min-w-0">
      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 mt-1 shrink-0 text-sm"
      />

      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-[11px] text-gray-500 font-normal">
          {label}
        </p>

        <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 break-words font-normal">
          {formatValue(value)}
        </p>
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="bg-[#0b1020] rounded-xl p-4 sm:p-5 overflow-hidden">
      <h2 className="text-base sm:text-lg font-normal mb-3 flex items-center gap-2.5 break-words">
        <FontAwesomeIcon
          icon={icon}
          className="text-cyan-400 text-sm shrink-0"
        />

        {title}
      </h2>

      <div className="text-xs sm:text-sm text-gray-300 font-normal leading-5 sm:leading-6 break-words whitespace-pre-line overflow-hidden">
        {children}
      </div>
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
    <footer className="w-full bg-[#080c1a] py-3 text-center text-gray-600 text-[11px] sm:text-xs font-normal mt-8">
      TalentIQ — AI-Powered Recruitment Platform
    </footer>
  );
}