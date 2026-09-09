
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faUsers,
  faBriefcase,
  faFileCircleCheck,
  faChartLine,
  faMagnifyingGlass,
  faUserCheck,
  faRobot,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Dashboard() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // =========================
    // LOAD CACHED DATA FIRST
    // =========================
    const saved = sessionStorage.getItem("dashboardData");

    if (saved) {
      try {
        const data = JSON.parse(saved);

        if (mounted) {
          setCandidates(data.candidates || []);
          setJobs(data.jobs || []);
          setApplications(data.applications || []);

          // Don't show loading screen when cached data exists
          setLoading(false);
        }
      } catch {
        sessionStorage.removeItem("dashboardData");
      }
    }

    // =========================
    // REFRESH IN BACKGROUND
    // =========================
    fetchData(mounted);

    return () => {
      mounted = false;
    };
  }, []);

  // =========================
  // FETCH DASHBOARD DATA
  // =========================
  async function fetchData(mounted = true) {
    try {
      // Start all requests simultaneously
      const requests = await Promise.allSettled([
        fetch(`${API_URL}/candidates`),
        fetch(`${API_URL}/jobs`),
        fetch(`${API_URL}/applications`),
      ]);

      const [candidateResponse, jobResponse, applicationResponse] =
        requests;

      // =========================
      // CANDIDATES
      // =========================
      let candidatesData = candidates;

      if (
        candidateResponse.status === "fulfilled" &&
        candidateResponse.value.ok
      ) {
        candidatesData = await candidateResponse.value.json();
      }

      // =========================
      // JOBS
      // =========================
      let jobsData = jobs;

      if (
        jobResponse.status === "fulfilled" &&
        jobResponse.value.ok
      ) {
        jobsData = await jobResponse.value.json();
      }

      // =========================
      // APPLICATIONS
      // =========================
      let applicationsData = applications;

      if (
        applicationResponse.status === "fulfilled" &&
        applicationResponse.value.ok
      ) {
        applicationsData = await applicationResponse.value.json();
      }

      if (!mounted) return;

      // =========================
      // UPDATE STATE
      // =========================
      setCandidates(candidatesData || []);
      setJobs(jobsData || []);
      setApplications(applicationsData || []);

      // =========================
      // SAVE CACHE
      // =========================
      sessionStorage.setItem(
        "dashboardData",
        JSON.stringify({
          candidates: candidatesData || [],
          jobs: jobsData || [],
          applications: applicationsData || [],
        })
      );

      setError("");
    } catch (error) {
      console.error("Dashboard fetch error:", error);

      if (!mounted) return;

      // Only show error if there is no cached data
      const cachedData =
        sessionStorage.getItem("dashboardData");

      if (!cachedData) {
        setError(
          "Unable to connect to the backend. Make sure FastAPI is running."
        );
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }

  // =========================
  // SHORTLISTED COUNT
  // =========================
  const shortlistedCount = applications.filter((app) => {
    if (!app.recommendation) return false;

    try {
      const data =
        typeof app.recommendation === "string"
          ? JSON.parse(app.recommendation)
          : app.recommendation;

      return (
        data.recommendation?.trim().toUpperCase() ===
        "RECOMMENDED"
      );
    } catch {
      const text = String(app.recommendation)
        .trim()
        .toUpperCase();

      return (
        text.includes("RECOMMENDED") &&
        !text.includes("NOT RECOMMENDED")
      );
    }
  }).length;

  // =========================
  // SUMMARY CARDS
  // =========================
  const cards = [
    [
      faUsers,
      "Candidates",
      candidates.length,
      "Candidate profiles",
      "/dashboard/candidates",
    ],
    [
      faBriefcase,
      "Open Jobs",
      jobs.length,
      "Active job roles",
      "/dashboard/jobs",
    ],
    [
      faFileCircleCheck,
      "Applications",
      applications.length,
      "Total applications",
      "/dashboard/applications",
    ],
    [
      faUserCheck,
      "Shortlisted",
      shortlistedCount,
      "AI recommended candidates",
      "/dashboard/shortlisted",
    ],
  ];

  // =========================
  // RECRUITMENT FEATURES
  // =========================
  const features = [
    [
      faFileCircleCheck,
      "Resume Screening",
      "Analyze resumes and automatically extract candidate information.",
      "/dashboard/resume-screening",
    ],
    [
      faUsers,
      "Candidate Profiling",
      "View structured profiles with education, skills and experience.",
      "/dashboard/candidate-profiling",
    ],
    [
      faMagnifyingGlass,
      "Job Matching",
      "Match candidates with suitable job requirements.",
      "/dashboard/job-matching",
    ],
    [
      faUserCheck,
      "Skill Gap Analysis",
      "Identify matched and missing skills for each candidate.",
      "/dashboard/skill-gap",
    ],
    [
      faChartLine,
      "Candidate Ranking",
      "Rank applicants based on match and skill scores.",
      "/dashboard/ranking",
    ],
    [
      faRobot,
      "AI Recommendations",
      "Get AI-powered insights to support hiring decisions.",
      "/dashboard/recommendations",
    ],
  ];

  return (
    <main className="min-h-screen bg-[#050816] text-white flex flex-col">

      {/* =========================
          NAVBAR
      ========================= */}
      <nav className="bg-[#080c1a] px-5 sm:px-7 md:px-10 py-4">
        <div className="flex justify-between items-center">

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
                Talent<span className="text-cyan-400">IQ</span>
              </h1>

              <p className="text-[10px] text-gray-500">
                TALENT INTELLIGENCE
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white text-base"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            Logout
          </Link>

        </div>
      </nav>

      {/* =========================
          MAIN
      ========================= */}
      <section className="flex-1 px-5 sm:px-7 md:px-10 lg:px-14 py-8 pb-20">

        {/* HEADER */}
        <div className="mb-8">

          <p className="text-cyan-400 text-sm font-semibold uppercase">
            Recruiter Dashboard
          </p>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2">
            Hiring Workspace
          </h2>

          <p className="text-gray-400 text-base md:text-lg mt-2">
            Manage candidates, jobs and applications from one place.
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 text-red-400">
            {error}
          </div>
        )}

        {/* =========================
            SUMMARY
        ========================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {cards.map((card) => (
            <Link
              href={card[4]}
              key={card[1]}
            >
              <DashboardCard
                icon={card[0]}
                title={card[1]}
                value={
                  loading && card[2] === 0
                    ? "..."
                    : card[2].toLocaleString()
                }
                description={card[3]}
              />
            </Link>
          ))}

        </div>

        {/* =========================
            TOOLS
        ========================= */}
        <div className="mt-12">

          <p className="text-cyan-400 text-sm font-semibold uppercase">
            Recruitment Tools
          </p>

          <h3 className="text-2xl sm:text-3xl font-bold mt-2 mb-6">
            Manage your hiring workflow
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {features.map((feature) => (
              <Link
                href={feature[3]}
                key={feature[1]}
              >
                <FeatureCard
                  icon={feature[0]}
                  title={feature[1]}
                  text={feature[2]}
                />
              </Link>
            ))}

          </div>

        </div>

      </section>

      {/* =========================
          FOOTER
      ========================= */}
      <footer className="bg-[#080c1a] py-4 text-center text-gray-600 text-sm">
        TalentIQ — AI-Powered Recruitment Platform
      </footer>

    </main>
  );
}

// =========================
// DASHBOARD CARD
// =========================

function DashboardCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div className="bg-[#0b1020] rounded-xl p-5 min-h-[175px] hover:bg-[#0e1428] transition">

      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 text-xl mb-4"
      />

      <p className="text-base text-gray-500">
        {title}
      </p>

      <p className="text-3xl font-bold mt-1">
        {value}
      </p>

      <p className="text-sm text-gray-600 mt-2">
        {description}
      </p>

    </div>
  );
}

// =========================
// FEATURE CARD
// =========================

function FeatureCard({
  icon,
  title,
  text,
}) {
  return (
    <div className="bg-[#0b1020] rounded-xl p-6 min-h-[205px] hover:bg-[#0e1428] transition">

      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 text-xl mb-5"
      />

      <h4 className="text-xl font-bold">
        {title}
      </h4>

      <p className="text-gray-400 text-base mt-3 leading-6">
        {text}
      </p>

    </div>
  );
}