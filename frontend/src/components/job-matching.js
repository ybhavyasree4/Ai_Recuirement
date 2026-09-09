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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

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
    } finally {
      setLoading(false);
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

  const filteredJobs = jobs.filter((job) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    if (/^\d+$/.test(query)) {
      return String(job.job_id) === query;
    }

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
    <main className="min-h-screen w-full bg-[#050816] text-white flex flex-col overflow-x-hidden">
      <Navbar />

      <section className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 pb-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition mb-5"
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="text-xs"
          />
          Back to Dashboard
        </Link>

        <div className="mb-5">
          <p className="text-cyan-400 text-xs sm:text-sm font-normal uppercase">
            Recruitment Tool
          </p>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal mt-1">
            Job Matching
          </h1>

          <p className="text-sm sm:text-base text-gray-400 mt-2">
            Match candidates with suitable job requirements.
          </p>
        </div>

        <div className="relative mb-5">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 top-3 text-gray-500 text-sm"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);

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
            className="w-full bg-[#0b1020] rounded-lg py-2.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:bg-[#0d1428]"
          />
        </div>

        {error && (
          <div className="mb-5 bg-red-500/10 text-red-400 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-4 items-start">
          <div className="bg-[#0b1020] rounded-xl h-[calc(100vh-270px)] min-h-[450px] flex flex-col overflow-hidden">
            <div className="p-4 shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-normal">
                  Available Jobs
                </h2>

                <span className="text-xs text-cyan-400 font-normal">
                  {loading ? "..." : filteredJobs.length}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Select a job to view matched candidates
              </p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2">
              {loading ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center px-4">
                  <p className="text-sm text-gray-400 font-normal">
                    Loading jobs...
                  </p>

                  <p className="text-[11px] text-gray-600 mt-1 font-normal">
                    Please wait while job data is loaded.
                  </p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm font-normal">
                  No jobs found.
                </div>
              ) : (
                filteredJobs.map((job, index) => (
                  <button
                    key={job.job_id || index}
                    onClick={() => {
                      setSelectedJob(job);
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className={`w-full text-left rounded-lg p-3 mb-1.5 transition ${
                      selectedJob?.job_id === job.job_id
                        ? "bg-cyan-400/10"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 min-w-9 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faBriefcase}
                          className="text-cyan-400 text-sm"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-normal break-words">
                          {getJobTitle(job, index)}
                        </p>

                        <p className="text-[11px] text-gray-500 mt-1 font-normal">
                          Job ID: {job.job_id || "N/A"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#0b1020] rounded-xl p-4 sm:p-5 md:p-6 min-h-[450px] min-w-0">
            {!selectedJob ? (
              <div className="min-h-[420px] flex flex-col items-center justify-center text-center px-4">
                <div className="w-14 h-14 rounded-xl bg-cyan-400/10 flex items-center justify-center mb-4">
                  <FontAwesomeIcon
                    icon={faBriefcase}
                    className="text-cyan-400 text-2xl"
                  />
                </div>

                <h2 className="text-2xl sm:text-3xl font-normal">
                  Job Matching
                </h2>

                <p className="text-sm text-gray-400 mt-2 max-w-xl font-normal">
                  Select a job to view candidates ranked by
                  their match score.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 w-full max-w-3xl">
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
                <div className="mb-5">
                  <p className="text-cyan-400 text-xs font-normal uppercase">
                    Selected Job
                  </p>

                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-normal mt-1 break-words">
                    {getJobTitle(selectedJob)}
                  </h2>

                  <p className="text-xs text-gray-500 mt-1 font-normal">
                    Job ID: {selectedJob.job_id || "N/A"}
                  </p>

                  <p className="text-sm text-gray-400 mt-2 font-normal">
                    {matchedCandidates.length} matched candidates
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  <JobInfoCard
                    label="Job Title"
                    value={getJobTitle(selectedJob)}
                  />

                  <JobInfoCard
                    label="Job ID"
                    value={selectedJob.job_id || "N/A"}
                  />

                  <JobInfoCard
                    label="Company"
                    value={
                      selectedJob.company_name ||
                      selectedJob.company ||
                      selectedJob.companyName ||
                      "Not specified"
                    }
                  />

                  <JobInfoCard
                    label="Location"
                    value={
                      selectedJob.location ||
                      selectedJob.locations ||
                      "Not specified"
                    }
                  />

                  <JobInfoCard
                    label="Required Skills"
                    value={
                      selectedJob.skills_required ||
                      selectedJob.required_skills ||
                      selectedJob.skills ||
                      "Not specified"
                    }
                    wide
                  />

                  <JobInfoCard
                    label="Job Description"
                    value={
                      selectedJob.job_description ||
                      selectedJob.description ||
                      selectedJob.responsibilities ||
                      "No job description available."
                    }
                    wide
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-normal">
                        Matching Candidates
                      </h3>

                      <p className="text-[11px] text-gray-600 mt-1 font-normal">
                        Candidates ranked according to their match score.
                      </p>
                    </div>

                    <span className="text-xs text-gray-500 font-normal">
                      {matchedCandidates.length}
                    </span>
                  </div>

                  {matchedCandidates.length === 0 ? (
                    <div className="bg-[#080c1a] rounded-xl p-6 text-center">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="text-gray-600 text-3xl mb-3"
                      />

                      <p className="text-sm text-gray-400 font-normal">
                        No matched candidates found.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {matchedCandidates.map(
                        (application, index) => (
                          <div
                            key={
                              application.application_id ||
                              index
                            }
                            className="bg-[#080c1a] rounded-xl px-4 py-4 min-h-[190px] flex flex-col overflow-hidden"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 min-w-9 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                                <FontAwesomeIcon
                                  icon={faUsers}
                                  className="text-cyan-400 text-sm"
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-normal break-words">
                                  Candidate{" "}
                                  {application.candidate_id ||
                                    "N/A"}
                                </p>

                                <p className="text-[11px] text-gray-500 mt-1 font-normal">
                                  Application ID:{" "}
                                  {application.application_id ||
                                    "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4">
                              <p className="text-[10px] text-cyan-400 uppercase font-normal">
                                Match Score
                              </p>

                              <p className="text-2xl font-normal mt-1">
                                {formatScore(
                                  application.match_score
                                )}
                              </p>
                            </div>

                            <div className="mt-auto pt-3">
                              <p className="text-[10px] text-cyan-400 uppercase font-normal">
                                Skill Match
                              </p>

                              <p className="text-lg font-normal mt-1">
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

function JobInfoCard({ label, value, wide = false }) {
  return (
    <div
      className={`bg-[#080c1a] rounded-xl px-4 py-4 min-h-[110px] overflow-hidden ${
        wide ? "sm:col-span-2 lg:col-span-3" : ""
      }`}
    >
      <p className="text-[10px] sm:text-[11px] text-cyan-400 font-normal uppercase">
        {label}
      </p>

      <p className="text-xs sm:text-sm text-gray-300 font-normal mt-2 break-words whitespace-pre-wrap leading-relaxed">
        {value}
      </p>
    </div>
  );
}

function InfoCard({ icon, text }) {
  return (
    <div className="bg-[#080c1a] rounded-xl p-4 min-h-[100px] flex flex-col items-center justify-center">
      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 text-lg mb-2"
      />

      <p className="text-sm font-normal text-gray-300 text-center">
        {text}
      </p>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="bg-[#080c1a] w-full shrink-0">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-3 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 min-w-0"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center shrink-0">
            <FontAwesomeIcon
              icon={faBrain}
              className="text-cyan-400 text-lg"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-normal">
              Talent<span className="text-cyan-400">IQ</span>
            </h1>

            <p className="text-[9px] text-gray-500">
              TALENT INTELLIGENCE
            </p>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
        >
          <FontAwesomeIcon
            icon={faRightFromBracket}
            className="text-xs"
          />

          <span className="hidden sm:block">
            Logout
          </span>
        </Link>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-[#080c1a] py-3 text-center text-gray-600 text-[11px] sm:text-xs mt-8">
      TalentIQ — AI-Powered Recruitment Platform
    </footer>
  );
}