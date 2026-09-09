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

    const saved = sessionStorage.getItem("dashboardData");

    if (saved) {
      try {
        const data = JSON.parse(saved);

        if (mounted) {
          setCandidates(data.candidates || []);
          setJobs(data.jobs || []);
          setApplications(data.applications || []);
          setLoading(false);
        }
      } catch {
        sessionStorage.removeItem("dashboardData");
      }
    }

    fetchData(mounted);

    return () => {
      mounted = false;
    };
  }, []);

  async function fetchData(mounted = true) {
    try {
      const requests = await Promise.allSettled([
        fetch(`${API_URL}/candidates`),
        fetch(`${API_URL}/jobs`),
        fetch(`${API_URL}/applications`),
      ]);

      const [candidateResponse, jobResponse, applicationResponse] =
        requests;

      let candidatesData = candidates;
      let jobsData = jobs;
      let applicationsData = applications;

      if (
        candidateResponse.status === "fulfilled" &&
        candidateResponse.value.ok
      ) {
        candidatesData = await candidateResponse.value.json();
      }

      if (
        jobResponse.status === "fulfilled" &&
        jobResponse.value.ok
      ) {
        jobsData = await jobResponse.value.json();
      }

      if (
        applicationResponse.status === "fulfilled" &&
        applicationResponse.value.ok
      ) {
        applicationsData = await applicationResponse.value.json();
      }

      if (!mounted) return;

      setCandidates(candidatesData || []);
      setJobs(jobsData || []);
      setApplications(applicationsData || []);

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

      const cachedData = sessionStorage.getItem("dashboardData");

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
    <main className="min-h-screen bg-[#050816] text-white flex flex-col overflow-x-hidden">

      {/* =========================
          NAVBAR
      ========================= */}

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
                Talent<span className="text-cyan-400">IQ</span>
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

      {/* =========================
          MAIN
      ========================= */}

      <section className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-7 pb-12">

        {/* HEADER */}

        <div className="mb-6">

          <p className="text-cyan-400 text-xs sm:text-sm font-semibold uppercase">
            Recruiter Dashboard
          </p>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1.5 break-words">
            Hiring Workspace
          </h2>

          <p className="text-gray-400 text-sm sm:text-base mt-1.5">
            Manage candidates, jobs and applications from one place.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* =========================
            SUMMARY
        ========================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {cards.map((card) => (
            <Link
              href={card[4]}
              key={card[1]}
              className="min-w-0"
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

        <div className="mt-9">

          <p className="text-cyan-400 text-xs sm:text-sm font-semibold uppercase">
            Recruitment Tools
          </p>

          <h3 className="text-xl sm:text-2xl font-bold mt-1.5 mb-5">
            Manage your hiring workflow
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {features.map((feature) => (
              <Link
                href={feature[3]}
                key={feature[1]}
                className="min-w-0"
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

      <footer className="w-full bg-[#080c1a] py-3 text-center text-gray-600 text-[11px] sm:text-xs">
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
    <div className="bg-[#0b1020] rounded-xl p-4 min-h-[150px] h-full hover:bg-[#0e1428] transition overflow-hidden">

      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 text-lg mb-3"
      />

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="text-2xl font-bold mt-1 break-words">
        {value}
      </p>

      <p className="text-xs text-gray-600 mt-1.5 break-words">
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
    <div className="bg-[#0b1020] rounded-xl p-5 min-h-[175px] h-full hover:bg-[#0e1428] transition overflow-hidden">

      <FontAwesomeIcon
        icon={icon}
        className="text-cyan-400 text-lg mb-4"
      />

      <h4 className="text-base sm:text-lg font-bold break-words">
        {title}
      </h4>

      <p className="text-gray-400 text-sm mt-2 leading-5 break-words">
        {text}
      </p>

    </div>
  );
}