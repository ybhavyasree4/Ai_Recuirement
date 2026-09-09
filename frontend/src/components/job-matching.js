"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faArrowLeft,
  faBriefcase,
  faUsers,
  faMagnifyingGlass,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export default function JobMatching() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [jobsRes, applicationsRes] = await Promise.all([
        fetch(`${API_URL}/jobs`),
        fetch(`${API_URL}/applications`),
      ]);

      if (!jobsRes.ok || !applicationsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const jobsData = await jobsRes.json();
      const applicationsData = await applicationsRes.json();

      jobsData.sort(
        (a, b) => Number(a.job_id) - Number(b.job_id)
      );

      setJobs(jobsData);
      setApplications(applicationsData);
    } catch (err) {
      console.error(err);
      setError("Unable to load job matching data.");
    }
  }

  function getJobTitle(job, index = 0) {
    return (
      job.job_title ||
      job.title ||
      job.job_position_name ||
      job.position ||
      `Job ${job.job_id || index + 1}`
    );
  }

  function getJobSearchText(job) {
    return [
      job.job_title,
      job.title,
      job.job_position_name,
      job.position,
      job.educationaL_requirements,
      job.educational_requirements,
      job.education_requirements,
      job.experiencere_requirement,
      job.experience_requirement,
      job.age_requirement,
      job.responsibilities,
      job.skills,
      job.required_skills,
      job.job_description,
    ]
      .filter(
        (value) =>
          value !== null &&
          value !== undefined
      )
      .join(" ")
      .toLowerCase();
  }

  /*
    SEARCH LOGIC

    Number search:
    25 -> only Job ID 25

    Text search:
    Python -> jobs containing Python
    Software -> jobs containing Software
  */
  const filteredJobs = jobs.filter((job) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    // Exact Job ID search
    if (/^\d+$/.test(query)) {
      return String(job.job_id) === query;
    }

    // Text search
    return getJobSearchText(job).includes(query);
  });

  function getScore(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return 0;
    }

    const number = Number(value);

    if (isNaN(number)) {
      return 0;
    }

    return number <= 1 ? number * 100 : number;
  }

  function formatScore(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "N/A";
    }

    const number = Number(value);

    if (isNaN(number)) {
      return "N/A";
    }

    return `${getScore(number).toFixed(2)}%`;
  }

  /*
    Candidates are sorted by highest Match Score first
  */
  const matchedCandidates = selectedJob
    ? applications
        .filter(
          (application) =>
            String(application.job_id) ===
            String(selectedJob.job_id)
        )
        .sort(
          (a, b) =>
            getScore(b.match_score) -
            getScore(a.match_score)
        )
    : [];

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
            Job Matching
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mt-3">
            Match candidates with suitable job requirements.
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

              /*
                If search changes and current selected job
                is not in the filtered result, clear selection.
              */
              const value = e.target.value.trim();

              if (value) {
                const isCurrentJobVisible = jobs.some(
                  (job) =>
                    String(job.job_id) ===
                    String(selectedJob?.job_id)
                );

                if (!isCurrentJobVisible) {
                  setSelectedJob(null);
                }
              }
            }}
            placeholder="Search jobs..."
            className="w-full bg-[#0b1020] rounded-xl py-4 pl-12 pr-5 text-lg text-white outline-none placeholder:text-gray-600 focus:bg-[#0d1428]"
          />
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-500/10 text-red-400 rounded-xl p-5 text-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start">

          {/* JOB LIST */}

          <div className="bg-[#0b1020] rounded-xl h-[calc(100vh-300px)] min-h-[500px] flex flex-col overflow-hidden">

            <div className="p-6 shrink-0">
              <div className="flex items-center justify-between">

                <h2 className="text-2xl font-bold">
                  Available Jobs
                </h2>

                <span className="text-base text-cyan-400 font-semibold">
                  {filteredJobs.length}
                </span>

              </div>

              <p className="text-base text-gray-500 mt-2">
                Select a job to view matched candidates
              </p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">

              {filteredJobs.length === 0 ? (

                <div className="p-8 text-center text-gray-500 text-lg">
                  No jobs found.
                </div>

              ) : (

                filteredJobs.map((job, index) => (

                  <button
                    key={job.job_id || index}
                    onClick={() => setSelectedJob(job)}
                    className={`w-full text-left rounded-xl p-5 mb-2 transition ${
                      selectedJob?.job_id === job.job_id
                        ? "bg-cyan-400/10"
                        : "hover:bg-white/5"
                    }`}
                  >

                    <div className="flex items-center gap-4">

                      <div className="w-14 h-14 min-w-14 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                        <FontAwesomeIcon
                          icon={faBriefcase}
                          className="text-cyan-400 text-xl"
                        />

                      </div>

                      <div className="min-w-0">

                        <p className="text-lg font-semibold break-words">
                          {getJobTitle(job, index)}
                        </p>

                        <p className="text-base text-gray-500 mt-1">
                          Job ID: {job.job_id || "N/A"}
                        </p>

                      </div>

                    </div>

                  </button>

                ))
              )}

            </div>
          </div>

          {/* MATCHED CANDIDATES */}

          <div className="bg-[#0b1020] rounded-xl p-7 md:p-8 min-h-[500px]">

            {!selectedJob ? (

              <div className="min-h-[550px] flex flex-col items-center justify-center text-center px-6">

                <div className="w-20 h-20 rounded-xl bg-cyan-400/10 flex items-center justify-center mb-6">

                  <FontAwesomeIcon
                    icon={faBriefcase}
                    className="text-cyan-400 text-4xl"
                  />

                </div>

                <h2 className="text-3xl font-bold">
                  Job Matching
                </h2>

                <p className="text-lg text-gray-400 mt-3 max-w-xl">
                  Select a job to view candidates ranked by
                  their match score.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 w-full max-w-3xl">

                  <InfoCard
                    icon={faBriefcase}
                    text="Job Requirements"
                  />

                  <InfoCard
                    icon={faUsers}
                    text="Matched Candidates"
                  />

                  <InfoCard
                    icon={faMagnifyingGlass}
                    text="Highest Score First"
                  />

                </div>

              </div>

            ) : (

              <>

                {/* SELECTED JOB */}

                <div className="mb-7">

                  <p className="text-cyan-400 text-base font-semibold uppercase">
                    Selected Job
                  </p>

                  <h2 className="text-3xl md:text-4xl font-bold mt-2 break-words">
                    {getJobTitle(selectedJob)}
                  </h2>

                  <p className="text-lg text-gray-500 mt-2">
                    Job ID: {selectedJob.job_id || "N/A"}
                  </p>

                  <p className="text-lg text-gray-400 mt-3">
                    {matchedCandidates.length} matched candidates
                  </p>

                </div>

                {/* CANDIDATES */}

                {matchedCandidates.length === 0 ? (

                  <div className="bg-[#080c1a] rounded-xl p-8 text-center">

                    <FontAwesomeIcon
                      icon={faUsers}
                      className="text-gray-600 text-4xl mb-4"
                    />

                    <p className="text-xl text-gray-400">
                      No matched candidates found.
                    </p>

                  </div>

                ) : (

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

                    {matchedCandidates.map(
                      (application, index) => (

                        <div
                          key={
                            application.application_id ||
                            index
                          }
                          className="bg-[#080c1a] rounded-xl px-6 py-5 h-[260px] flex flex-col overflow-hidden"
                        >

                          {/* CANDIDATE */}

                          <div className="flex items-center gap-4">

                            <div className="w-14 h-14 min-w-14 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                              <FontAwesomeIcon
                                icon={faUsers}
                                className="text-cyan-400 text-xl"
                              />

                            </div>

                            <div className="min-w-0">

                              <p className="text-lg font-semibold truncate">
                                Candidate{" "}
                                {application.candidate_id}
                              </p>

                              <p className="text-base text-gray-500 mt-1">
                                Application ID:{" "}
                                {application.application_id ||
                                  "N/A"}
                              </p>

                            </div>

                          </div>

                          {/* MATCH SCORE */}

                          <div className="mt-6">

                            <p className="text-sm text-cyan-400 uppercase font-semibold">
                              Match Score
                            </p>

                            <p className="text-3xl font-bold mt-2">
                              {formatScore(
                                application.match_score
                              )}
                            </p>

                          </div>

                          {/* SKILL MATCH - NO BOX */}

                          <div className="mt-auto">

                            <p className="text-sm text-cyan-400 uppercase font-semibold">
                              Skill Match
                            </p>

                            <p className="text-2xl font-bold mt-1">
                              {formatScore(
                                application.skill_match_percentage
                              )}
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </>

            )}

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* INFO CARD */

function InfoCard({ icon, text }) {
  return (
    <div className="bg-[#080c1a] rounded-xl p-5 min-h-[120px] flex flex-col items-center justify-center">

      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 text-2xl mb-3"
      />

      <p className="text-base font-semibold text-gray-300 text-center">
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
              Talent<span className="text-cyan-400">IQ</span>
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