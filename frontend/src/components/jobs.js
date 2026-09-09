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
            (a, b) =>
              Number(a.job_id) - Number(b.job_id)
          )
        )
      )
      .catch(() =>
        setError("Unable to load jobs.")
      )
      .finally(() => setLoading(false));
  }, []);

  // FIXED SEARCH
  const filtered = jobs.filter((job) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    // Numbers = exact Job ID
    if (/^\d+$/.test(q)) {
      return String(job.job_id) === q;
    }

    // Text search
    return [
      job.job_position_name,
      job.educationaL_requirements,
      job.experiencere_requirement,
      job.age_requirement,
      job.responsibilities,
    ]
      .filter(Boolean)
      .flatMap((v) =>
        Array.isArray(v) ? v : [v]
      )
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  if (selectedJob) {
    return (
      <main className="min-h-screen bg-[#050816] text-white">
        <Navbar />

        <section className="p-6 md:p-10">

          <button
            onClick={() => setSelectedJob(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Jobs
          </button>

          <div className="bg-[#0b1020] rounded-xl p-6 mb-5">
            <p className="text-cyan-400">
              JOB ID: {selectedJob.job_id}
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              {formatValue(
                selectedJob.job_position_name
              )}
            </h1>

            <p className="text-gray-400 mt-2">
              Complete job information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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
              {formatValue(
                selectedJob.age_requirement
              )}
            </Section>

            <Section
              icon={faBriefcase}
              title="Job Information"
            >
              <p>
                <b>Job ID:</b>{" "}
                {formatValue(selectedJob.job_id)}
              </p>

              <p className="mt-2">
                <b>Position:</b>{" "}
                {formatValue(
                  selectedJob.job_position_name
                )}
              </p>
            </Section>

          </div>

          <div className="mt-5">
            <Section
              icon={faListCheck}
              title="Responsibilities"
            >
              <p className="whitespace-pre-line">
                {formatValue(
                  selectedJob.responsibilities
                )}
              </p>
            </Section>
          </div>

        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
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
          Open Jobs
        </h1>

        <p className="text-gray-400 text-lg mt-2 mb-6">
          Explore available job opportunities.
        </p>

        {/* SEARCH */}
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
            placeholder="Search by Job ID, position, education or experience"
            className="w-full bg-[#0b1020] rounded-lg py-4 pl-11 pr-4 text-lg outline-none"
          />

        </div>

        {loading && (
          <p className="text-cyan-400">
            Loading jobs...
          </p>
        )}

        {error && (
          <p className="text-red-400">
            {error}
          </p>
        )}

        {/* JOB CARDS */}
        {!loading &&
          !error &&
          filtered.length > 0 && (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {filtered.map((job) => (

                <div
                  key={job.job_id}
                  className="bg-[#0b1020] rounded-xl p-5 h-[350px] flex flex-col"
                >

                  <div className="flex items-center gap-3 mb-4">

                    <div className="w-12 h-12 rounded-full bg-cyan-400/10 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faBriefcase}
                        className="text-cyan-400 text-xl"
                      />
                    </div>

                    <div className="min-w-0">

                      <p className="text-sm text-gray-500">
                        Job ID: {job.job_id}
                      </p>

                      <h2 className="text-xl font-bold line-clamp-2">
                        {formatValue(
                          job.job_position_name
                        )}
                      </h2>

                    </div>

                  </div>

                  <div className="space-y-3 flex-1">

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
                    onClick={() =>
                      setSelectedJob(job)
                    }
                    className="w-full py-3 rounded-lg bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-black font-semibold"
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

            <p className="text-center text-gray-500 text-lg py-16">
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

function Info({ icon, label, value }) {
  return (
    <div className="flex gap-3">

      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 mt-1"
      />

      <div className="min-w-0">

        <p className="text-sm text-gray-500">
          {label}
        </p>

        <p className="text-gray-300 line-clamp-2 break-words">
          {formatValue(value)}
        </p>

      </div>

    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="bg-[#0b1020] rounded-xl p-6">

      <h2 className="text-xl font-bold mb-4 flex items-center gap-3">

        <FontAwesomeIcon
          icon={icon}
          className="text-cyan-400"
        />

        {title}

      </h2>

      <div className="text-gray-300 leading-7 break-words">
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
    <footer className="fixed bottom-0 left-0 w-full bg-[#080c1a] py-3 text-center text-gray-600 text-sm z-50">
      TalentIQ — AI-Powered Recruitment Platform
    </footer>
  );
}